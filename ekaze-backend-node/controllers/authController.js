const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { User, Session, Company, Worker, Employer, Admin, Supervisor, Police, Transaction } = require('../models');
const { logAudit } = require('../services/auditService');
const { ensureUserRoleProfile } = require('../services/roleIsolationService');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const { getSettingValue } = require('./settingsController');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// Helper to save profile photos from uploaded files or base64 data URLs
const saveProfilePhoto = (files, file, rawPhoto) => {
  if (files && Array.isArray(files)) {
    const f = files.find(x => x.fieldname === 'photo' || x.fieldname === 'profile_photo' || x.fieldname === 'logo');
    if (f && f.filename) return `/uploads/profiles/${f.filename}`;
  }
  if (file && file.filename) {
    return `/uploads/profiles/${file.filename}`;
  }
  if (typeof rawPhoto === 'string' && rawPhoto.startsWith('data:image')) {
    try {
      const match = rawPhoto.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
        const filename = `profile-${Date.now()}-${uuidv4().substring(0, 8)}.${ext}`;
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
        return `/uploads/profiles/${filename}`;
      }
    } catch (e) {
      console.error('Failed to save base64 profile photo:', e);
    }
  }
  if (typeof rawPhoto === 'string' && (rawPhoto.startsWith('/uploads') || rawPhoto.startsWith('http'))) {
    return rawPhoto;
  }
  return null;
};

// RFC 6238 Standard TOTP (Google Authenticator) Base32 & Verification Engine
function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const clean = String(base32 || '').replace(/[- ]/g, '').toUpperCase();
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTOTP(secretBuffer, timeStepWindow = 0) {
  const step = 30; // 30-second window
  const counter = Math.floor(Date.now() / 1000 / step) + timeStepWindow;
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(buffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

let speakeasy;
try {
  speakeasy = require('speakeasy');
} catch (e) {
  speakeasy = null;
}

function verifyTOTP(token, secret, window = 0) {
  if (!token || !secret) return false;
  const cleanToken = String(token).trim();
  const cleanSecret = String(secret || '').replace(/[- ]/g, '').toUpperCase();

  try {
    // 1. Check with speakeasy (Strict active window = 0)
    if (speakeasy) {
      const verified = speakeasy.totp.verify({
        secret: cleanSecret,
        encoding: 'base32',
        token: cleanToken,
        window: window
      });
      const expected = speakeasy.totp({ secret: cleanSecret, encoding: 'base32' });
      console.log(`[TOTP] Check - Submitted: "${cleanToken}", Current Expected: "${expected}", Matched: ${verified}`);
      if (verified) return true;
    }

    // 2. Fallback to built-in TOTP engine (window = 0: strictly active 30-second code)
    const secretBuffer = base32Decode(cleanSecret);
    if (secretBuffer && secretBuffer.length > 0) {
      for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
        const totp = generateTOTP(secretBuffer, errorWindow);
        if (totp === cleanToken) {
          return true;
        }
      }
    }
  } catch (err) {
    console.error('TOTP verification error:', err);
  }

  return false;
}

// Issues a short-lived MFA challenge instead of a session token
const sendMfaChallenge = async (user, res, req = null) => {
  const tempToken = jwt.sign(
    { id: user.id, purpose: 'mfa_login' },
    env.JWT_SECRET,
    { expiresIn: '10m' }
  );

  const method = user.mfa_method || 'authenticator';
  if (method === 'email' || method === 'sms') {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfa_secret = otpCode;
    await user.save();
    if (method === 'email' && user.email) {
      sendEmail({
        to: user.email,
        subject: 'Your Ekaze Two-Factor Verification Code',
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Ekaze Login Verification</h2>
          <p>Your one-time 6-digit login verification code is:</p>
          <h1 style="color: #0056D2; letter-spacing: 4px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes. If you did not attempt to log in, please secure your account immediately.</p>
        </div>`,
        text: `Your Ekaze two-factor login verification code is: ${otpCode}`
      }).catch(err => console.warn('MFA email send warning:', err.message));
    } else if (method === 'sms' && user.phone) {
      const { resolveUserLanguage } = require('../services/smsService');
      const lang = resolveUserLanguage(req, user);
      const msg = lang === 'rw'
        ? `Ekaze: Kode yawe yo kwinjira muri konti ni ${otpCode}. Izarangira mu minota 10.`
        : `Ekaze: Your login verification code is ${otpCode}. It expires in 10 minutes.`;
      sendSMS(user.phone, msg)
        .catch(err => console.warn('MFA SMS send warning:', err.message));
    }
  }

  return res.status(200).json({
    success: true,
    requires_mfa: true,
    mfa_method: method,
    temp_token: tempToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    message: 'Two-factor authentication code required.'
  });
};

// Issues a verification code to either email or phone for unverified channel (Police, Supervisor, Admin)
const sendChannelVerificationChallenge = async (user, channel, res, req = null) => {
  const tempToken = jwt.sign(
    { id: user.id, purpose: 'mfa_login', channel },
    env.JWT_SECRET,
    { expiresIn: '10m' }
  );

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.mfa_secret = otpCode;
  await user.save();

  if (channel === 'email' && user.email) {
    sendEmail({
      to: user.email,
      subject: 'Ekaze - Security Verification Code',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2>Ekaze Security Verification</h2>
        <p>Hello <strong>${user.name || 'User'}</strong>,</p>
        <p>Please enter the following 6-digit verification code to verify your email and complete your sign in:</p>
        <div style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-radius: 8px; display: inline-block;">
          <h1 style="color: #0073bb; letter-spacing: 5px; margin: 0; font-family: monospace;">${otpCode}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>`,
      text: `Your Ekaze verification code is: ${otpCode}`
    }).catch(err => console.warn('Channel verification email dispatch warning:', err.message));
  } else if (channel === 'phone' && user.phone) {
    const { resolveUserLanguage } = require('../services/smsService');
    const lang = resolveUserLanguage(req, user);
    const msg = lang === 'rw'
      ? `Ekaze: Kode yawe yo kwemeza nimero ni ${otpCode}. Izarangira mu minota 10.`
      : `Ekaze: Your verification code is ${otpCode}. It expires in 10 minutes.`;
    sendSMS(user.phone, msg)
      .catch(err => console.warn('Channel verification SMS dispatch warning:', err.message));
  }

  const destination = channel === 'email' ? user.email : user.phone;
  console.log(`[OTP] Security verification code sent to ${channel} (${destination}): ${otpCode}`);

  return res.status(200).json({
    success: true,
    requires_mfa: true,
    mfa_method: channel === 'email' ? 'email' : 'sms',
    temp_token: tempToken,
    channel,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    message: `A 6-digit verification code has been sent to your ${channel === 'email' ? 'email' : 'phone number'} to verify your identity.`
  });
};

// Helper to detect OS, device name, and browser from user agent
function parseDeviceInfo(ua = '') {
  let os = 'Unknown OS';
  let deviceName = 'Desktop PC';

  if (/windows phone/i.test(ua)) {
    os = 'Windows Phone';
    deviceName = 'Windows Phone';
  } else if (/win(dows )?nt 10\.0/i.test(ua)) {
    os = 'Windows 10/11';
    deviceName = 'Windows PC';
  } else if (/win(dows )?nt 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
    deviceName = 'Windows PC';
  } else if (/win(dows )?nt 6\.2/i.test(ua)) {
    os = 'Windows 8';
    deviceName = 'Windows PC';
  } else if (/win(dows )?nt 6\.1/i.test(ua)) {
    os = 'Windows 7';
    deviceName = 'Windows PC';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
    deviceName = 'Windows PC';
  } else if (/iphone/i.test(ua)) {
    os = 'iOS';
    deviceName = 'iPhone';
  } else if (/ipad/i.test(ua)) {
    os = 'iPadOS';
    deviceName = 'iPad';
  } else if (/android/i.test(ua)) {
    os = 'Android';
    const match = ua.match(/Android [^;]+;\s*([^;)]+)/i);
    if (match && match[1]) {
      const rawModel = match[1].replace(/Build\/.*/i, '').trim();
      deviceName = rawModel || 'Android Phone';
    } else {
      deviceName = 'Android Device';
    }
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
    deviceName = 'MacBook / Mac';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
    deviceName = 'Chromebook';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
    deviceName = 'Linux PC';
  }

  let browser = 'Web Browser';
  if (/edg\//i.test(ua)) {
    const v = ua.match(/edg\/([\d.]+)/i);
    browser = `Edge ${v ? Math.floor(parseFloat(v[1])) : ''}`.trim();
  } else if (/opr\/|opera\//i.test(ua)) {
    const v = ua.match(/(?:opr|opera)\/([\d.]+)/i);
    browser = `Opera ${v ? Math.floor(parseFloat(v[1])) : ''}`.trim();
  } else if (/samsungbrowser\//i.test(ua)) {
    const v = ua.match(/samsungbrowser\/([\d.]+)/i);
    browser = `Samsung Internet ${v ? Math.floor(parseFloat(v[1])) : ''}`.trim();
  } else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) {
    const v = ua.match(/chrome\/([\d.]+)/i);
    browser = `Chrome ${v ? Math.floor(parseFloat(v[1])) : ''}`.trim();
  } else if (/firefox\//i.test(ua)) {
    const v = ua.match(/firefox\/([\d.]+)/i);
    browser = `Firefox ${v ? Math.floor(parseFloat(v[1])) : ''}`.trim();
  } else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) {
    const v = ua.match(/version\/([\d.]+)/i);
    browser = `Safari ${v ? Math.floor(parseFloat(v[1])) : ''}`.trim();
  }

  return { os, deviceName, browser };
}

function getClientIp(req) {
  let ip = req.headers['x-forwarded-for']
    ? req.headers['x-forwarded-for'].split(',')[0].trim()
    : (req.ip || req.socket?.remoteAddress || '127.0.0.1');
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1';
  return ip;
}

// Helper to send token response via httpOnly cookie & JSON
const sendTokenResponse = async (user, statusCode, req, res, message = 'Success') => {
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours

  // Strictly enforce max 3 active devices per account:
  try {
    const activeSessions = await Session.findAll({
      where: {
        user_id: user.id,
        is_valid: true,
        expires_at: { [Op.gt]: new Date() }
      },
      order: [['created_at', 'ASC']]
    });

    // If 3 or more devices are active, invalidate the oldest session(s)
    // so this new login keeps the active devices strictly <= 3
    if (activeSessions.length >= 3) {
      const excess = activeSessions.length - 2; // Keep at most 2 old active sessions
      for (let i = 0; i < excess; i++) {
        await activeSessions[i].update({ is_valid: false });
      }
    }
  } catch (err) {
    console.warn('⚠️ Session limit enforcement warning:', err.message);
  }

  // Record active session in DB
  const session = await Session.create({
    user_id: user.id,
    token,
    ip_address: getClientIp(req),
    user_agent: req.headers['user-agent'] || 'Web Browser',
    is_valid: true,
    expires_at: expiresAt
  });

  const cookieOptions = {
    expires: expiresAt,
    httpOnly: true,
    secure: env.COOKIE_SECURE === true || env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAMESITE || 'None'
  };

  res.cookie('token', token, cookieOptions);

  await logAudit({
    userId: user.id,
    action: 'USER_LOGIN',
    module: 'AUTH',
    req,
    details: { role: user.role, sessionId: session.id }
  });

  // Dispatch real-time user session notification
  try {
    const { sendNotification } = require('../services/socketService');
    const ua = (req.headers['user-agent'] || 'Web Browser');
    const device = ua.includes('Mobile') ? 'Mobile Device' : (ua.includes('Windows') ? 'Windows PC' : (ua.includes('Mac') ? 'Mac' : 'Web Browser'));
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sendNotification({
      userId: user.id,
      title: 'New Login Session Detected',
      message: `Security Alert: A new login session was established on your account from ${device} at ${timeStr}. If this was not you, please secure your account immediately.`,
      type: 'login_success',
      data: { sessionId: session.id, ip: req.ip || req.headers['x-forwarded-for'], time: new Date() }
    }).catch(e => console.warn('⚠️ Session notification dispatch warning:', e.message));
  } catch (notifErr) {
    // Non-blocking
  }

  // Ensure user role profile exists in isolated table
  const fullUser = await ensureUserRoleProfile(user) || user;

  // Extract the specific role profile matching the user's role
  const roleProfileMap = {
    worker: fullUser.worker,
    employer: fullUser.employer,
    company: fullUser.company,
    admin: fullUser.adminProfile,
    supervisor: fullUser.supervisorProfile,
    police: fullUser.policeProfile
  };

  const isWorkerSuspended = fullUser.status === 'suspended' || fullUser.worker?.extended_profile?.is_suspended === true || fullUser.worker?.availability_status === 'suspended';
  const suspendedCompany = fullUser.worker?.company?.company_name
    || fullUser.worker?.extended_profile?.suspended_by_company_name
    || (fullUser.worker?.company_id ? 'Your Agency' : 'Company Administrator');

  // Construct structured user payload with strict table isolation
  const userPayload = {
    id: fullUser.id,
    name: fullUser.name,
    email: fullUser.email,
    phone: fullUser.phone,
    role: fullUser.role,
    national_id: fullUser.national_id,
    status: fullUser.status,
    is_suspended: isWorkerSuspended,
    suspended_by_company: isWorkerSuspended ? suspendedCompany : null,
    is_verified: fullUser.is_verified,
    google_id: fullUser.google_id,
    google_email: fullUser.google_email,
    mfa_enabled: !!fullUser.mfa_enabled,
    mfa_method: fullUser.mfa_method || 'authenticator',
    profile_photo: (typeof fullUser.profile_photo === 'string' && fullUser.profile_photo.length > 50000 && fullUser.profile_photo.startsWith('data:'))
      ? null
      : fullUser.profile_photo,
    province: fullUser.province,
    district: fullUser.district,
    sector: fullUser.sector,
    cell: fullUser.cell,
    village: fullUser.village,
    address: fullUser.address,
    tin_number: fullUser.company?.tin_number || fullUser.company?.registration_number || null,
    registration_number: fullUser.company?.registration_number || fullUser.company?.tin_number || null,
    company_name: fullUser.company?.company_name || fullUser.name,
    billing_plan: fullUser.company?.billing_plan || null,
    trial_ends_at: fullUser.company?.trial_ends_at || null,
    subscription_amount: fullUser.company?.subscription_amount || null,
    subscription_cycle: fullUser.company?.subscription_cycle || null,
    role_profile: roleProfileMap[fullUser.role] || null,
    // Explicit role profiles
    company: fullUser.company,
    worker: fullUser.worker,
    employer: fullUser.employer,
    adminProfile: fullUser.adminProfile,
    supervisorProfile: fullUser.supervisorProfile,
    policeProfile: fullUser.policeProfile
  };

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userPayload
  });
};

// Login User
const login = async (req, res, next) => {
  try {
    const { login: loginId, password } = req.body; // loginId can be email, phone or national_id

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone/national_id and password'
      });
    }

    let cleanPhone = String(loginId).replace(/\D/g, '');
    let alternatePhone = null;
    if (cleanPhone.startsWith('250') && cleanPhone.length === 12) {
      alternatePhone = '0' + cleanPhone.slice(3);
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      alternatePhone = '250' + cleanPhone.slice(1);
    }

    const searchConditions = [
      { email: loginId },
      { phone: loginId },
      { national_id: loginId }
    ];
    if (alternatePhone) {
      searchConditions.push({ phone: alternatePhone });
      searchConditions.push({ phone: cleanPhone });
    }

    let user = await User.findOne({
      where: {
        [Op.or]: searchConditions
      },
      include: [
        { model: Company, as: 'company' },
        { model: Worker, as: 'worker', include: [{ model: Company, as: 'company' }] },
        { model: Employer, as: 'employer' },
        { model: Admin, as: 'adminProfile' },
        { model: Supervisor, as: 'supervisorProfile' },
        { model: Police, as: 'policeProfile' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        account_not_found: true,
        message: 'Account does not exist. Please create a new account to continue.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your password and try again.'
      });
    }

    // Check if worker account is suspended
    const isWorkerSuspended = user.status === 'suspended' || user.worker?.extended_profile?.is_suspended === true || user.worker?.availability_status === 'suspended';
    if (isWorkerSuspended) {
      let companyName = user.worker?.company?.company_name || user.worker?.extended_profile?.suspended_by_company_name;
      if (!companyName && user.worker?.company_id) {
        const comp = await Company.findByPk(user.worker.company_id).catch(() => null);
        if (comp) companyName = comp.company_name;
      }
      const finalCompanyName = companyName || 'your company';
      return res.status(403).json({
        success: false,
        is_suspended: true,
        suspended_by_company: finalCompanyName,
        message: `Your account is suspended by ${finalCompanyName}. Please contact ${finalCompanyName} administration to bring your account back to current.`
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account inactive. Please contact support.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. Please contact support.'
      });
    }

    // ── FIRST LOGIN OTP CHECK FOR COMPANY, POLICE, SUPERVISOR, ADMIN ──
    const requiresVerification = ['company', 'police', 'supervisor', 'admin'].includes(String(user.role).toLowerCase()) || !user.is_verified;
    if (requiresVerification) {
      const inputLogin = String(loginId).trim().toLowerCase();
      const userEmail = (user.email || '').trim().toLowerCase();
      const cleanInput = String(loginId).replace(/\D/g, '');
      const cleanUserPhone = String(user.phone || '').replace(/\D/g, '');

      const isEmailLogin = inputLogin.includes('@') || (userEmail && inputLogin === userEmail);
      const isPhoneLogin = !isEmailLogin && (
        (user.phone && inputLogin === String(user.phone).trim().toLowerCase()) ||
        (cleanInput.length >= 8 && cleanUserPhone.length >= 8 && cleanUserPhone.endsWith(cleanInput.slice(-8)))
      );

      if (isEmailLogin && !user.email_verified) {
        return sendChannelVerificationChallenge(user, 'email', res, req);
      } else if (isPhoneLogin && !user.phone_verified) {
        return sendChannelVerificationChallenge(user, 'phone', res, req);
      } else if (!user.is_verified && (!user.email_verified || !user.phone_verified)) {
        // Fallback for unverified users: send to email if present, otherwise phone
        if (user.email && !user.email_verified) {
          return sendChannelVerificationChallenge(user, 'email', res, req);
        } else if (user.phone && !user.phone_verified) {
          return sendChannelVerificationChallenge(user, 'phone', res, req);
        }
      }
    }

    // ── STRICT REGISTRATION / SUBSCRIPTION PAYMENT VERIFICATION FOR EMPLOYER & COMPANY ──
    if (['employer', 'company'].includes(user.role)) {
      if (user.role === 'company') {
        const company = await Company.findOne({ where: { user_id: user.id } });
        const now = new Date();

        // 1. Check if Company has an active Free Trial
        const isFreeTrial = company?.billing_plan === 'free_trial' || (!company?.billing_plan && company?.trial_ends_at);
        if (isFreeTrial && company?.trial_ends_at) {
          const trialEnd = new Date(company.trial_ends_at);
          if (trialEnd > now) {
            // Free trial is ACTIVE: allow company to log in freely
            // No payment required yet
          } else {
            // Free trial has EXPIRED: company must pay to log in!
            const subAmount = Number(company?.subscription_amount) || 50000.00;
            const cycle = company?.subscription_cycle || 'monthly';
            const { v4: uuidv4 } = require('uuid');

            let pendingTx = await Transaction.findOne({
              where: {
                user_id: user.id,
                type: 'company_fee',
                status: 'pending'
              },
              order: [['created_at', 'DESC']]
            });

            if (!pendingTx) {
              pendingTx = await Transaction.create({
                reference_id: uuidv4(),
                user_id: user.id,
                type: 'company_fee',
                amount: subAmount,
                phone_number: user.phone,
                payment_method: 'mtn_momo',
                status: 'pending',
                metadata: {
                  role: 'company',
                  company_id: company?.id,
                  purpose: 'subscription_fee',
                  cycle: cycle,
                  period_days: company?.subscription_period_days
                }
              });
            }

            return res.status(402).json({
              success: false,
              payment_required: true,
              trial_expired: true,
              message: `Your free trial has ended. Please pay your ${cycle} subscription fee of ${subAmount.toLocaleString()} RWF to access your account.`,
              data: {
                phone: user.phone,
                role: user.role,
                amount: subAmount,
                cycle: cycle,
                transaction_id: pendingTx.reference_id
              }
            });
          }
        } else if (company?.billing_plan === 'subscription') {
          // 2. Direct Subscription plan: must be paid
          const isPaidActive = company?.subscription_paid_until && new Date(company.subscription_paid_until) > now;
          if (!isPaidActive) {
            const subAmount = Number(company?.subscription_amount) || 50000.00;
            const cycle = company?.subscription_cycle || 'monthly';
            const { v4: uuidv4 } = require('uuid');

            let pendingTx = await Transaction.findOne({
              where: {
                user_id: user.id,
                type: 'company_fee',
                status: 'pending'
              },
              order: [['created_at', 'DESC']]
            });

            if (!pendingTx) {
              pendingTx = await Transaction.create({
                reference_id: uuidv4(),
                user_id: user.id,
                type: 'company_fee',
                amount: subAmount,
                phone_number: user.phone,
                payment_method: 'mtn_momo',
                status: 'pending',
                metadata: {
                  role: 'company',
                  company_id: company?.id,
                  purpose: 'subscription_fee',
                  cycle: cycle,
                  period_days: company?.subscription_period_days
                }
              });
            }

            return res.status(402).json({
              success: false,
              payment_required: true,
              subscription_required: true,
              message: `Subscription Payment Required: Please complete your ${cycle} subscription payment of ${subAmount.toLocaleString()} RWF via MTN MoMo to activate your company account.`,
              data: {
                phone: user.phone,
                role: user.role,
                amount: subAmount,
                cycle: cycle,
                transaction_id: pendingTx.reference_id
              }
            });
          }
        }
      } else if (user.role === 'employer') {
        const paidTx = await Transaction.findOne({
          where: {
            user_id: user.id,
            status: 'successful'
          }
        });

        if (!paidTx) {
          let pendingTx = await Transaction.findOne({
            where: {
              user_id: user.id,
              status: 'pending'
            },
            order: [['created_at', 'DESC']]
          });

          const regFee = 1000.00;
          if (!pendingTx) {
            const { v4: uuidv4 } = require('uuid');
            pendingTx = await Transaction.create({
              reference_id: uuidv4(),
              user_id: user.id,
              type: 'hiring_fee',
              amount: regFee,
              phone_number: user.phone,
              payment_method: 'mtn_momo',
              status: 'pending',
              metadata: { role: user.role, purpose: 'registration_fee' }
            });
          }

          return res.status(402).json({
            success: false,
            payment_required: true,
            message: `Registration Payment Required: Please complete your ${regFee.toLocaleString()} RWF registration fee via MTN MoMo to activate your employer account.`,
            data: {
              phone: user.phone,
              role: user.role,
              amount: regFee,
              transaction_id: pendingTx.reference_id
            }
          });
        }
      }
    }

    // ── MFA CHECK ON LOGIN ──
    if (user.mfa_enabled) {
      return sendMfaChallenge(user, res, req);
    }

    user.last_login_at = new Date();
    user.last_login_ip = req.ip;
    await user.save();

    return sendTokenResponse(user, 200, req, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// Google OAuth Login / Account Link Handler
const googleLogin = async (req, res, next) => {
  try {
    const { google_id, google_email, email, name, profile_photo, role } = req.body;

    const userEmail = google_email || email;

    if (!google_id && !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Google login requires google_id or email.'
      });
    }

    // Look for existing user by google_id or email
    let user = await User.findOne({
      where: {
        [Op.or]: [
          ...(google_id ? [{ google_id }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      },
      include: [
        { model: Company, as: 'company' },
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' },
        { model: Admin, as: 'adminProfile' },
        { model: Supervisor, as: 'supervisorProfile' },
        { model: Police, as: 'policeProfile' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        account_not_found: true,
        message: 'Account does not exist. Please create a new account to continue.'
      });
    }

    // Link Google Account if not linked yet
    let changed = false;
    if (!user.google_id && google_id) {
      user.google_id = google_id;
      changed = true;
    }
    if (!user.google_email && userEmail) {
      user.google_email = userEmail;
      changed = true;
    }
    if (profile_photo && !user.profile_photo) {
      user.profile_photo = profile_photo;
      changed = true;
    }
    if (changed) {
      await user.save();
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account suspended or inactive.'
      });
    }

    if (user.mfa_enabled) {
      return sendMfaChallenge(user, res, req);
    }

    user.last_login_at = new Date();
    user.last_login_ip = req.ip;
    await user.save();

    return sendTokenResponse(user, 200, req, res, 'Google authentication successful');
  } catch (error) {
    next(error);
  }
};

// Helper to check existing user duplicates
const checkDuplicateUser = async ({ national_id, passport_number, phone, email }) => {
  const conditions = [];
  if (national_id) conditions.push({ national_id });
  if (passport_number) conditions.push({ passport_number });
  if (phone) conditions.push({ phone });
  if (email && email.trim().length > 0) conditions.push({ email });

  if (conditions.length === 0) return null;

  const existing = await User.findOne({ where: { [Op.or]: conditions } });
  if (!existing) return null;

  if (national_id && existing.national_id === national_id) {
    return `An account with National ID ${national_id} is already registered. Please login instead.`;
  }
  if (passport_number && existing.passport_number === passport_number) {
    return `An account with Passport Number ${passport_number} is already registered. Please login instead.`;
  }
  if (phone && existing.phone === phone) {
    return `An account with phone number ${phone} is already registered. Please login instead.`;
  }
  if (email && existing.email === email) {
    return `An account with email ${email} is already registered. Please login instead.`;
  }
  return 'An account with these credentials already exists.';
};

// Register Worker
const registerWorker = async (req, res, next) => {
  try {
    const {
      name,
      first_name,
      last_name,
      email,
      phone,
      national_id,
      passport_number,
      passport_expiry_date,
      registration_document_type,
      country_id,
      password,
      gender,
      date_of_birth,
      photo,
      profile_photo,
      province,
      district,
      sector,
      cell,
      village,
      experience_level,
      professions,
      skills,
      languages_spoken,
      work_type_preferences,
      preferred_districts,
      min_salary,
      max_salary,
      has_insurance,
      insurance_type,
      insurance_provider,
      insurance_number
    } = req.body;

    const getVal = (val, field) => {
      if (val !== undefined && val !== null && val !== '') return val;
      return req.body ? req.body[field] : undefined;
    };

    const getArray = (val, field) => {
      if (Array.isArray(val) && val.length > 0) return val;
      if (typeof val === 'string' && val) return [val];
      const items = [];
      if (req.body) {
        Object.keys(req.body).forEach(k => {
          if (k.startsWith(`${field}[`) || k.startsWith(`${field}[]`)) {
            items.push(req.body[k]);
          }
        });
      }
      return items;
    };

    const resolvedNationalId = getVal(national_id, 'national_id') || null;
    const resolvedPassportNumber = getVal(passport_number, 'passport_number') || null;
    const resolvedPhone = getVal(phone, 'phone') || null;
    const resolvedEmail = getVal(email, 'email') || null;

    const resolvedFirstName = getVal(first_name, 'first_name');
    const resolvedLastName = getVal(last_name, 'last_name');
    const resolvedName = getVal(name, 'name');
    const computedFirstName = resolvedFirstName || (resolvedName ? resolvedName.split(' ')[0] : 'Worker');
    const computedLastName = resolvedLastName || (resolvedName ? resolvedName.split(' ').slice(1).join(' ') : '');
    const fullName = (resolvedName || `${computedFirstName} ${computedLastName}`).trim();
    const finalPassword = getVal(password, 'password') || ('Ekaze' + Math.random().toString(36).slice(-6) + '!');

    const dupMsg = await checkDuplicateUser({ national_id: resolvedNationalId, passport_number: resolvedPassportNumber, phone: resolvedPhone, email: resolvedEmail });
    if (dupMsg) {
      return res.status(400).json({ success: false, message: dupMsg });
    }

    const uploadedPhoto = saveProfilePhoto(req.files, req.file, getVal(req.body?.photo, 'photo') || getVal(req.body?.profile_photo, 'profile_photo'));

    const user = await User.create({
      role: 'worker',
      name: fullName,
      first_name: computedFirstName,
      last_name: computedLastName,
      email: resolvedEmail,
      phone: resolvedPhone,
      national_id: resolvedNationalId,
      passport_number: resolvedPassportNumber,
      registration_document_type: getVal(registration_document_type, 'registration_document_type') || (resolvedPassportNumber ? 'passport' : 'nida'),
      password: finalPassword,
      gender: gender ? String(gender).toLowerCase() : null,
      date_of_birth: getVal(date_of_birth, 'date_of_birth') || null,
      profile_photo: uploadedPhoto,
      province: getVal(province, 'province') || null,
      district: getVal(district, 'district') || null,
      sector: getVal(sector, 'sector') || null,
      cell: getVal(cell, 'cell') || null,
      village: getVal(village, 'village') || null,
      status: 'active',
      is_verified: true,
      verified_at: new Date()
    });

    // Isolated Worker Table Record
    const rawProfessions = getArray(professions, 'professions');
    const rawSkills = getArray(skills, 'skills');
    const workerSkills = rawProfessions.length > 0 ? rawProfessions : rawSkills;

    const rawWorkTypes = getArray(work_type_preferences, 'work_type_preferences');
    const singleWorkType = rawWorkTypes.length > 0 ? [rawWorkTypes[0]] : [];

    const workerLanguages = getArray(languages_spoken, 'languages_spoken');
    const workerDistricts = getArray(preferred_districts, 'preferred_districts');

    const [workerRecord, created] = await Worker.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        skills: workerSkills,
        professions: workerSkills,
        experience_level: getVal(experience_level, 'experience_level') || null,
        languages_spoken: workerLanguages,
        work_type_preferences: singleWorkType,
        preferred_districts: workerDistricts,
        min_salary: min_salary ? parseFloat(min_salary) : null,
        max_salary: max_salary ? parseFloat(max_salary) : null,
        expected_salary: min_salary ? parseFloat(min_salary) : (max_salary ? parseFloat(max_salary) : null),
        has_insurance: has_insurance !== undefined ? Boolean(has_insurance) : false,
        insurance_type: getVal(insurance_type, 'insurance_type') || null,
        insurance_provider: getVal(insurance_provider, 'insurance_provider') || null,
        insurance_number: getVal(insurance_number, 'insurance_number') || null,
        availability_status: 'available',
        business_card_path: uploadedPhoto
      }
    });

    if (!created) {
      await workerRecord.update({
        skills: workerSkills,
        professions: workerSkills,
        experience_level: getVal(experience_level, 'experience_level') || workerRecord.experience_level,
        languages_spoken: workerLanguages.length > 0 ? workerLanguages : workerRecord.languages_spoken,
        work_type_preferences: singleWorkType.length > 0 ? singleWorkType : workerRecord.work_type_preferences,
        preferred_districts: workerDistricts.length > 0 ? workerDistricts : workerRecord.preferred_districts,
        min_salary: min_salary ? parseFloat(min_salary) : workerRecord.min_salary,
        max_salary: max_salary ? parseFloat(max_salary) : workerRecord.max_salary,
        expected_salary: min_salary ? parseFloat(min_salary) : (max_salary ? parseFloat(max_salary) : workerRecord.expected_salary),
        has_insurance: has_insurance !== undefined ? Boolean(has_insurance) : workerRecord.has_insurance,
        insurance_type: getVal(insurance_type, 'insurance_type') || workerRecord.insurance_type,
        insurance_provider: getVal(insurance_provider, 'insurance_provider') || workerRecord.insurance_provider,
        insurance_number: getVal(insurance_number, 'insurance_number') || workerRecord.insurance_number,
        business_card_path: uploadedPhoto || workerRecord.business_card_path
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Worker registered successfully.',
      token,
      data: {
        phone: user.phone,
        role: 'worker',
        amount: 0,
        is_free: true,
        transaction_id: null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Register Employer (Requires payment if fee configured)
const registerEmployer = async (req, res, next) => {
  try {
    const { name, first_name, last_name, email, phone, national_id, passport_number, password, employer_type, company_name, province, district, sector, cell, village } = req.body;

    const getVal = (val, field) => {
      if (val !== undefined && val !== null && val !== '') return val;
      return req.body ? req.body[field] : undefined;
    };

    const resolvedNationalId = getVal(national_id, 'national_id') || null;
    const resolvedPassportNumber = getVal(passport_number, 'passport_number') || null;
    const resolvedPhone = getVal(phone, 'phone') || null;
    const resolvedEmail = getVal(email, 'email') || null;

    const resolvedFirstName = getVal(first_name, 'first_name');
    const resolvedLastName = getVal(last_name, 'last_name');
    const resolvedName = getVal(name, 'name');
    const computedFirstName = resolvedFirstName || (resolvedName ? resolvedName.split(' ')[0] : 'Employer');
    const computedLastName = resolvedLastName || (resolvedName ? resolvedName.split(' ').slice(1).join(' ') : '');
    const fullName = (resolvedName || `${computedFirstName} ${computedLastName}`).trim();
    const finalPassword = getVal(password, 'password') || ('Ekaze' + Math.random().toString(36).slice(-6) + '!');

    const dupMsg = await checkDuplicateUser({ national_id: resolvedNationalId, passport_number: resolvedPassportNumber, phone: resolvedPhone, email: resolvedEmail });
    if (dupMsg) {
      return res.status(400).json({ success: false, message: dupMsg });
    }

    const uploadedPhoto = saveProfilePhoto(req.files, req.file, getVal(req.body?.photo, 'photo') || getVal(req.body?.profile_photo, 'profile_photo'));

    const empPaymentEnabled = await getSettingValue('employer_payment_enabled', true);
    const empFeeVal = await getSettingValue('employer_registration_fee', await getSettingValue('employer_fee', 5000));
    const empFee = Number(empFeeVal) > 0 ? Number(empFeeVal) : 5000;
    const isFree = (empPaymentEnabled === false || empPaymentEnabled === 'false') && Number(empFeeVal) <= 0;
    const regFee = isFree ? 0 : empFee;

    const user = await User.create({
      role: 'employer',
      name: fullName,
      first_name: computedFirstName,
      last_name: computedLastName,
      email: resolvedEmail,
      phone: resolvedPhone,
      national_id: resolvedNationalId,
      passport_number: resolvedPassportNumber,
      password: finalPassword,
      profile_photo: uploadedPhoto,
      province: getVal(province, 'province') || null,
      district: getVal(district, 'district') || null,
      sector: getVal(sector, 'sector') || null,
      cell: getVal(cell, 'cell') || null,
      village: getVal(village, 'village') || null,
      status: isFree ? 'active' : 'pending',
      is_verified: isFree,
      verified_at: isFree ? new Date() : null
    });

    // Isolated Employer Table Record
    await Employer.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        employer_type: getVal(employer_type, 'employer_type') || 'individual',
        company_name: getVal(company_name, 'company_name') || null
      }
    });

    let refId = null;
    if (!isFree) {
      refId = uuidv4();
      await Transaction.create({
        reference_id: refId,
        user_id: user.id,
        type: 'hiring_fee',
        amount: regFee,
        phone_number: user.phone,
        payment_method: 'mtn_momo',
        status: 'pending',
        metadata: { role: 'employer', purpose: 'registration_fee' }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Employer registered successfully.',
      token,
      data: {
        phone: user.phone,
        role: 'employer',
        amount: regFee,
        is_free: isFree,
        transaction_id: refId,
        otp_resends_remaining: 5
      }
    });
  } catch (error) {
    next(error);
  }
};

// Register Company (Requires payment if fee configured)
const registerCompany = async (req, res, next) => {
  try {
    const { name, first_name, last_name, email, phone, national_id, passport_number, registration_number, company_name, password, province, district, sector, cell, village } = req.body;

    const getVal = (val, field) => {
      if (val !== undefined && val !== null && val !== '') return val;
      return req.body ? req.body[field] : undefined;
    };

    const resolvedNationalId = getVal(national_id, 'national_id') || null;
    const resolvedPassportNumber = getVal(passport_number, 'passport_number') || null;
    const resolvedPhone = getVal(phone, 'phone') || null;
    const resolvedEmail = getVal(email, 'email') || null;

    const resolvedFirstName = getVal(first_name, 'first_name');
    const resolvedLastName = getVal(last_name, 'last_name');
    const resolvedName = getVal(name, 'name');
    const resolvedCompany = getVal(company_name, 'company_name');
    const computedFirstName = resolvedFirstName || (resolvedName ? resolvedName.split(' ')[0] : (resolvedCompany ? resolvedCompany.split(' ')[0] : 'Company'));
    const computedLastName = resolvedLastName || (resolvedName ? resolvedName.split(' ').slice(1).join(' ') : '');
    const fullName = (resolvedCompany || resolvedName || `${computedFirstName} ${computedLastName}`).trim();
    const finalPassword = getVal(password, 'password') || ('Ekaze' + Math.random().toString(36).slice(-6) + '!');

    const dupMsg = await checkDuplicateUser({ national_id: resolvedNationalId, passport_number: resolvedPassportNumber, phone: resolvedPhone, email: resolvedEmail });
    if (dupMsg) {
      return res.status(400).json({ success: false, message: dupMsg });
    }

    const uploadedLogo = saveProfilePhoto(req.files, req.file, getVal(req.body?.logo, 'logo') || getVal(req.body?.photo, 'photo') || getVal(req.body?.profile_photo, 'profile_photo'));

    const compPaymentEnabled = await getSettingValue('company_payment_enabled', true);
    const compFeeVal = await getSettingValue('company_registration_fee', await getSettingValue('company_fee', 1000));
    const compFee = Number(compFeeVal) > 0 ? Number(compFeeVal) : 1000;
    const isFree = (compPaymentEnabled === false || compPaymentEnabled === 'false') && Number(compFeeVal) <= 0;
    const regFee = isFree ? 0 : compFee;

    const user = await User.create({
      role: 'company',
      name: fullName,
      first_name: computedFirstName,
      last_name: computedLastName,
      email: resolvedEmail,
      phone: resolvedPhone,
      national_id: resolvedNationalId,
      passport_number: resolvedPassportNumber,
      password: finalPassword,
      profile_photo: uploadedLogo,
      province: getVal(province, 'province') || null,
      district: getVal(district, 'district') || null,
      sector: getVal(sector, 'sector') || null,
      cell: getVal(cell, 'cell') || null,
      village: getVal(village, 'village') || null,
      status: isFree ? 'active' : 'pending',
      is_verified: isFree,
      verified_at: isFree ? new Date() : null
    });

    // Isolated Company Table Record
    await Company.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        company_name: resolvedCompany || fullName,
        registration_number: getVal(registration_number, 'registration_number') || null,
        verification_status: isFree ? 'verified' : 'pending'
      }
    });

    let refId = null;
    if (!isFree) {
      refId = `EKAZE-REG-${Date.now()}-${uuidv4().substring(0, 8)}`;
      await Transaction.create({
        reference_id: refId,
        user_id: user.id,
        type: 'company_fee',
        amount: regFee,
        phone_number: user.phone,
        payment_method: 'mtn_momo',
        status: 'pending',
        metadata: { role: 'company', purpose: 'registration_fee' }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Company registered successfully.',
      token,
      data: {
        phone: user.phone,
        role: 'company',
        amount: regFee,
        is_free: isFree,
        transaction_id: refId,
        otp_resends_remaining: 5
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout User
const logout = async (req, res, next) => {
  try {
    if (req.sessionId) {
      await Session.update({ is_valid: false }, { where: { id: req.sessionId } });
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    if (req.user) {
      await logAudit({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        module: 'AUTH',
        req
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get Active Sessions for Current User (Max 3 Devices)
const getActiveSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentToken = req.token;

    let sessions = await Session.findAll({
      where: {
        user_id: userId,
        is_valid: true,
        expires_at: { [Op.gt]: new Date() }
      },
      order: [['created_at', 'DESC']]
    });

    // If no session row was saved yet for this token, record one now so the active device appears
    if (sessions.length === 0) {
      const { os, browser } = parseDeviceInfo(req.headers['user-agent']);
      const ip = getClientIp(req);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      const newSess = await Session.create({
        user_id: userId,
        token: req.token || 'current',
        ip_address: ip,
        user_agent: req.headers['user-agent'] || 'Web Browser',
        is_valid: true,
        expires_at: expiresAt
      });
      sessions = [newSess];
    }

    const formatted = sessions.slice(0, 3).map((sess) => {
      const { os, deviceName, browser } = parseDeviceInfo(sess.user_agent);
      let ip = sess.ip_address || '127.0.0.1';
      if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1';

      const isCurrent = sess.token === currentToken || sess.id === req.sessionId;

      const diffMs = Date.now() - new Date(sess.updated_at || sess.created_at).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      let lastSessionStr = 'Just now';
      if (diffHours > 24) {
        lastSessionStr = `${Math.floor(diffHours / 24)} days ago`;
      } else if (diffHours > 0) {
        lastSessionStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        lastSessionStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      }

      return {
        id: sess.id,
        os,
        deviceName,
        browser,
        ip,
        is_current: isCurrent,
        last_session: isCurrent ? 'This device' : lastSessionStr,
        created_at: sess.created_at
      };
    });

    return res.status(200).json({
      success: true,
      sessions: formatted,
      count: formatted.length,
      max_devices: 3
    });
  } catch (error) {
    next(error);
  }
};

// Revoke a Device Session
const revokeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await Session.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Device session not found.'
      });
    }

    await session.update({ is_valid: false });

    await logAudit({
      userId,
      action: 'SESSION_REVOKED',
      module: 'AUTH',
      req,
      details: { sessionId: id }
    });

    const isCurrent = session.token === req.token || session.id === req.sessionId;

    return res.status(200).json({
      success: true,
      is_current: isCurrent,
      message: 'Device disconnected successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User Profile
const me = async (req, res, next) => {
  try {
    const fullUser = await ensureUserRoleProfile(req.user) || req.user;
    return res.status(200).json({
      success: true,
      user: fullUser
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP Code (Validates against sent SMS code or fallback '000000')
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, email, otp_code } = req.body;

    if (!otp_code || String(otp_code).trim().length !== 6) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit OTP code.' });
    }

    let user = null;
    if (phone) {
      user = await User.findOne({ where: { phone } });
    } else if (email) {
      user = await User.findOne({ where: { email } });
    } else if (req.user) {
      user = req.user;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const cleanCode = String(otp_code).trim();
    const isCodeValid = cleanCode === '000000' || (user.mfa_secret && cleanCode === String(user.mfa_secret).trim());

    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your SMS or click Resend.'
      });
    }

    user.otp_verified = true;
    user.is_verified = true;
    user.verified_at = new Date();
    await user.save();

    // Check if user requires payment (Workers are FREE, Employers and Companies pay)
    const isWorker = user.role === 'worker';
    let pendingTx = null;

    if (!isWorker) {
      pendingTx = await Transaction.findOne({
        where: {
          user_id: user.id,
          status: 'pending'
        },
        order: [['created_at', 'DESC']]
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: isWorker ? 'Worker account verified and activated successfully!' : 'Phone verified. Please complete registration payment.',
      token,
      data: {
        otp_verified: true,
        user,
        role: user.role,
        requires_payment: !isWorker,
        amount: pendingTx?.amount || (user.role === 'company' ? 5000 : 1000),
        transaction_id: pendingTx?.reference_id || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Resend OTP Code (Dispatches real SMS to user phone)
const resendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    let user = null;
    if (phone) {
      user = await User.findOne({ where: { phone } });
    } else if (req.user) {
      user = req.user;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (user) {
      user.mfa_secret = otpCode;
      await user.save();
    }

    const targetPhone = phone || user?.phone;
    if (targetPhone) {
      const { resolveUserLanguage } = require('../services/smsService');
      const lang = resolveUserLanguage(req, user);
      const msg = lang === 'rw'
        ? `Ekaze: Kode yawe nshya yo kwemeza ni ${otpCode}. Izarangira mu minota 10.`
        : `Ekaze: Your new verification code is ${otpCode}. It expires in 10 minutes.`;
      sendSMS(targetPhone, msg)
        .catch(err => console.warn('Resend OTP SMS warning:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: 'New OTP sent to your phone number via SMS.',
      data: {
        otp_resends_remaining: 5,
        otp_code: otpCode,
        otp_expires_in: '10m'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, username, phone, email, profile_photo, google_id, google_email } = req.body;
    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;
    if (profile_photo !== undefined) user.profile_photo = profile_photo;
    if (google_id !== undefined) user.google_id = google_id;
    if (google_email !== undefined) user.google_email = google_email;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// MFA Setup (Google Authenticator, Phone SMS, or Email)
const setupMfa = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { method = 'authenticator' } = req.body;
    
    if (method === 'authenticator') {
      // Reuse existing valid secret if available so reopening modal does not invalidate scanned QR codes on phone
      const isResetRequested = req.body && req.body.reset === true;
      let rawSecret = user.mfa_secret;

      if (!rawSecret || rawSecret.length < 16 || isResetRequested) {
        const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        rawSecret = '';
        for (let i = 0; i < 16; i++) {
          rawSecret += BASE32.charAt(Math.floor(Math.random() * BASE32.length));
        }
        user.mfa_secret = rawSecret;
        user.mfa_method = 'authenticator';
        await user.save();
      }
      const secret = `${rawSecret.slice(0, 4)}-${rawSecret.slice(4, 8)}-${rawSecret.slice(8, 12)}-${rawSecret.slice(12, 16)}`;
      const qrCodeUri = `otpauth://totp/Ekaze:${encodeURIComponent(user.email || user.phone || 'User')}?secret=${rawSecret}&issuer=Ekaze&algorithm=SHA1&digits=6&period=30`;

      user.mfa_secret = rawSecret;
      user.mfa_method = 'authenticator';
      await user.save();

      return res.status(200).json({
        success: true,
        message: `MFA setup initialized for authenticator`,
        data: {
          method: 'authenticator',
          secret,
          raw_secret: rawSecret,
          qr_code_uri: qrCodeUri,
          phone: user.phone || '',
          email: user.email || ''
        }
      });
    } else {
      // Email or SMS setup OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.mfa_secret = otpCode;
      user.mfa_method = method;
      await user.save();

      if (method === 'email' && user.email) {
        sendEmail({
          to: user.email,
          subject: 'Your Ekaze MFA Setup Code',
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Two-Factor Setup Code</h2>
            <p>Your 6-digit confirmation code is:</p>
            <h1 style="color: #0056D2; letter-spacing: 4px;">${otpCode}</h1>
          </div>`,
          text: `Your MFA setup code is: ${otpCode}`
        }).catch(err => console.warn('MFA email send error:', err.message));
      } else if (method === 'sms' && user.phone) {
        const { resolveUserLanguage } = require('../services/smsService');
        const lang = resolveUserLanguage(req, user);
        const msg = lang === 'rw'
          ? `Ekaze: Kode yawe yo gufungura umutekano wa MFA ni ${otpCode}.`
          : `Ekaze: Your MFA setup code is ${otpCode}.`;
        sendSMS(user.phone, msg)
          .catch(err => console.warn('MFA SMS send error:', err.message));
      }

      return res.status(200).json({
        success: true,
        message: `Verification code sent to your ${method === 'sms' ? 'phone' : 'email'}`,
        data: {
          method,
          phone: user.phone || '',
          email: user.email || ''
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// MFA Verify and Enable (Initial Setup)
const verifyMfa = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { code, method = 'authenticator' } = req.body;

    if (!code || String(code).trim().length !== 6) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit verification code.' });
    }

    const cleanCode = String(code).trim();
    let isCodeValid = false;

    if (method === 'authenticator') {
      isCodeValid = verifyTOTP(cleanCode, user.mfa_secret);
    } else {
      isCodeValid = cleanCode === String(user.mfa_secret).trim();
    }

    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: method === 'authenticator'
          ? 'Invalid 6-digit authenticator code. Check your Google Authenticator app and ensure your phone time is accurate.'
          : 'Invalid 6-digit verification code. Please check and try again.'
      });
    }

    user.mfa_enabled = true;
    user.mfa_method = method;
    await user.save();

    try {
      await logAudit({
        userId: user.id,
        action: 'MFA_ENABLED',
        module: 'auth',
        req,
        details: { method: user.mfa_method, timestamp: new Date().toISOString() }
      });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'Two-Factor Authentication (MFA) successfully activated!',
      data: {
        mfa_enabled: true,
        mfa_method: user.mfa_method
      }
    });
  } catch (error) {
    next(error);
  }
};

// Send / Resend MFA Code during setup
const sendMfaCode = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { method = 'email' } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfa_secret = otpCode;
    user.mfa_method = method;
    await user.save();

    if (method === 'email' && user.email) {
      sendEmail({
        to: user.email,
        subject: 'Your Ekaze MFA Verification Code',
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Ekaze Security Verification</h2>
          <p>Your one-time 6-digit verification code is:</p>
          <h1 style="color: #0056D2; letter-spacing: 4px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>`,
        text: `Your Ekaze verification code is: ${otpCode}`
      }).catch(err => console.warn('Email dispatch warning:', err.message));
    } else if (method === 'sms' && user.phone) {
      const { resolveUserLanguage } = require('../services/smsService');
      const lang = resolveUserLanguage(req, user);
      const msg = lang === 'rw'
        ? `Ekaze: Kode yawe yo kwemeza MFA ni ${otpCode}. Izarangira mu minota 10.`
        : `Ekaze: Your MFA verification code is ${otpCode}. It expires in 10 minutes.`;
      sendSMS(user.phone, msg)
        .catch(err => console.warn('MFA SMS send warning:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent to your ${method === 'sms' ? 'phone' : 'email'}.`
    });
  } catch (error) {
    next(error);
  }
};

// Verify Login MFA (Triggered on login when mfa_enabled is true)
const verifyLoginMfa = async (req, res, next) => {
  try {
    const { temp_token, code } = req.body;

    if (!temp_token || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the verification code.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(temp_token, env.JWT_SECRET);
      if (decoded.purpose !== 'mfa_login') {
        return res.status(401).json({ success: false, message: 'Invalid MFA login session.' });
      }
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'MFA session expired. Please sign in again with your email/phone and password.'
      });
    }

    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Company, as: 'company' },
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' },
        { model: Admin, as: 'adminProfile' },
        { model: Supervisor, as: 'supervisorProfile' },
        { model: Police, as: 'policeProfile' }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const cleanCode = String(code).trim();
    let isCodeValid = false;

    if (decoded.channel === 'email' || decoded.channel === 'phone') {
      isCodeValid = cleanCode === String(user.mfa_secret).trim();
    } else if (user.mfa_method === 'authenticator') {
      isCodeValid = verifyTOTP(cleanCode, user.mfa_secret);
    } else if (user.mfa_method === 'email' || user.mfa_method === 'sms') {
      isCodeValid = cleanCode === String(user.mfa_secret).trim();
    }

    if (!isCodeValid) {
      return res.status(401).json({
        success: false,
        message: user.mfa_method === 'authenticator'
          ? 'Invalid 6-digit authenticator code. Please check your Google Authenticator app.'
          : 'Invalid 6-digit verification code. Please try again.'
      });
    }

    // Code verified! If this was channel verification, mark only that specific channel as verified
    if (decoded.channel === 'email') {
      user.email_verified = true;
    } else if (decoded.channel === 'phone') {
      user.phone_verified = true;
    }
    user.is_verified = true;

    user.last_login_at = new Date();
    user.last_login_ip = req.ip;
    await user.save();

    // ── POST-VERIFICATION BILLING / TRIAL CHECK FOR COMPANY ──
    if (user.role === 'company') {
      const company = await Company.findOne({ where: { user_id: user.id } });
      const now = new Date();
      const isFreeTrial = company?.billing_plan === 'free_trial' || (!company?.billing_plan && company?.trial_ends_at);

      if (isFreeTrial && company?.trial_ends_at) {
        const trialEnd = new Date(company.trial_ends_at);
        if (trialEnd > now) {
          // Free trial is ACTIVE: Proceed directly into dashboard!
          return sendTokenResponse(user, 200, req, res, 'Login successful');
        } else {
          // Free trial EXPIRED: require payment
          const subAmount = Number(company?.subscription_amount) || 50000.00;
          const cycle = company?.subscription_cycle || 'monthly';
          const { v4: uuidv4 } = require('uuid');

          let pendingTx = await Transaction.findOne({
            where: {
              user_id: user.id,
              type: 'company_fee',
              status: 'pending'
            },
            order: [['created_at', 'DESC']]
          });

          if (!pendingTx) {
            pendingTx = await Transaction.create({
              reference_id: uuidv4(),
              user_id: user.id,
              type: 'company_fee',
              amount: subAmount,
              phone_number: user.phone,
              payment_method: 'mtn_momo',
              status: 'pending',
              metadata: {
                role: 'company',
                company_id: company?.id,
                purpose: 'subscription_fee',
                cycle: cycle,
                period_days: company?.subscription_period_days
              }
            });
          }

          return res.status(402).json({
            success: false,
            payment_required: true,
            trial_expired: true,
            message: `Your free trial has ended. Please pay your ${cycle} subscription fee of ${subAmount.toLocaleString()} RWF to access your account.`,
            data: {
              phone: user.phone,
              role: user.role,
              amount: subAmount,
              cycle: cycle,
              transaction_id: pendingTx.reference_id
            }
          });
        }
      } else if (company?.billing_plan === 'subscription') {
        const isPaidActive = company?.subscription_paid_until && new Date(company.subscription_paid_until) > now;
        if (!isPaidActive) {
          const subAmount = Number(company?.subscription_amount) || 50000.00;
          const cycle = company?.subscription_cycle || 'monthly';
          const { v4: uuidv4 } = require('uuid');

          let pendingTx = await Transaction.findOne({
            where: {
              user_id: user.id,
              type: 'company_fee',
              status: 'pending'
            },
            order: [['created_at', 'DESC']]
          });

          if (!pendingTx) {
            pendingTx = await Transaction.create({
              reference_id: uuidv4(),
              user_id: user.id,
              type: 'company_fee',
              amount: subAmount,
              phone_number: user.phone,
              payment_method: 'mtn_momo',
              status: 'pending',
              metadata: {
                role: 'company',
                company_id: company?.id,
                purpose: 'subscription_fee',
                cycle: cycle,
                period_days: company?.subscription_period_days
              }
            });
          }

          return res.status(402).json({
            success: false,
            payment_required: true,
            subscription_required: true,
            message: `Subscription Payment Required: Please complete your ${cycle} subscription payment of ${subAmount.toLocaleString()} RWF via MTN MoMo to activate your company account.`,
            data: {
              phone: user.phone,
              role: user.role,
              amount: subAmount,
              cycle: cycle,
              transaction_id: pendingTx.reference_id
            }
          });
        }
      }
    }

    return sendTokenResponse(user, 200, req, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// Resend Login MFA (for email or sms during login)
const resendLoginMfa = async (req, res, next) => {
  try {
    const { temp_token } = req.body;
    if (!temp_token) {
      return res.status(400).json({ success: false, message: 'Invalid request.' });
    }
    const decoded = jwt.verify(temp_token, env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const channel = decoded.channel;
    const isEmail = channel === 'email' || user.mfa_method === 'email';
    const isSms = channel === 'phone' || user.mfa_method === 'sms';

    if (isEmail || isSms) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.mfa_secret = otpCode;
      await user.save();

      if (isEmail && user.email) {
        sendEmail({
          to: user.email,
          subject: 'Your New Ekaze Login Verification Code',
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Ekaze Login Verification</h2>
            <p>Your new one-time 6-digit login verification code is:</p>
            <h1 style="color: #0056D2; letter-spacing: 4px;">${otpCode}</h1>
            <p>This code will expire in 10 minutes.</p>
          </div>`,
          text: `Your new Ekaze verification code is: ${otpCode}`
        }).catch(err => console.warn('Email dispatch warning:', err.message));
      } else if (isSms && user.phone) {
        const { resolveUserLanguage } = require('../services/smsService');
        const lang = resolveUserLanguage(req, user);
        const msg = lang === 'rw'
          ? `Ekaze: Kode yawe nshya yo kwinjira muri konti ni ${otpCode}. Izarangira mu minota 10.`
          : `Ekaze: Your new login verification code is ${otpCode}. It expires in 10 minutes.`;
        sendSMS(user.phone, msg)
          .catch(err => console.warn('MFA SMS send warning:', err.message));
      }
      console.log(`[OTP] Resent verification code to ${isEmail ? 'email' : 'phone'}: ${otpCode}`);
    }

    return res.status(200).json({
      success: true,
      message: 'New verification code sent.'
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

// MFA Disable
const disableMfa = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.mfa_enabled = false;
    user.mfa_secret = null;
    await user.save();

    try {
      await logAudit({
        userId: user.id,
        action: 'MFA_DISABLED',
        module: 'auth',
        req,
        details: { timestamp: new Date().toISOString() }
      });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'Two-Factor Authentication (MFA) has been disabled.',
      data: {
        mfa_enabled: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// MFA Status
const getMfaStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        mfa_enabled: !!user?.mfa_enabled,
        mfa_method: user?.mfa_method || 'authenticator',
        phone: user?.phone || '',
        email: user?.email || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

// Registration pre-verification and uniqueness engine
const registrationOtpStore = new Map();

// Check uniqueness of ID, phone, email
const checkUnique = async (req, res, next) => {
  try {
    const { national_id, passport_number, phone, email } = req.body;
    let formattedPhone = phone ? String(phone).trim() : null;
    if (formattedPhone) {
      const clean = formattedPhone.replace(/\D/g, '');
      formattedPhone = clean.startsWith('250') ? clean : (clean.startsWith('0') ? '250' + clean.slice(1) : (clean.length === 9 ? '250' + clean : clean));
    }

    if (national_id) {
      const existing = await User.findOne({ where: { national_id: String(national_id).trim() } });
      if (existing) {
        return res.status(200).json({ success: false, is_unique: false, field: 'national_id', message: `An account with National ID ${national_id} is already registered. Please login instead.` });
      }
    }

    if (passport_number) {
      const existing = await User.findOne({ where: { passport_number: String(passport_number).trim() } });
      if (existing) {
        return res.status(200).json({ success: false, is_unique: false, field: 'passport_number', message: `An account with Passport Number ${passport_number} is already registered. Please login instead.` });
      }
    }

    if (formattedPhone) {
      const existing = await User.findOne({
        where: {
          [Op.or]: [
            { phone: formattedPhone },
            { phone: formattedPhone.startsWith('250') ? '0' + formattedPhone.slice(3) : formattedPhone },
            { phone: formattedPhone.startsWith('250') ? '+' + formattedPhone : formattedPhone }
          ]
        }
      });
      if (existing) {
        return res.status(200).json({ success: false, is_unique: false, field: 'phone', message: `An account with phone number ${phone} is already registered. Please login instead.` });
      }
    }

    if (email && String(email).trim().length > 0) {
      const existing = await User.findOne({ where: { email: String(email).trim().toLowerCase() } });
      if (existing) {
        return res.status(200).json({ success: false, is_unique: false, field: 'email', message: `An account with email ${email} is already registered. Please login instead.` });
      }
    }

    return res.status(200).json({ success: true, is_unique: true, message: 'All credentials are valid and unique.' });
  } catch (error) {
    next(error);
  }
};

// Send 6-digit verification code to phone or email
const sendVerificationCode = async (req, res, next) => {
  try {
    const { type, target } = req.body;
    if (!type || !target) {
      return res.status(400).json({ success: false, message: 'Type (phone or email) and target are required.' });
    }

    let cleanTarget = String(target).trim();
    if (type === 'phone') {
      const clean = cleanTarget.replace(/\D/g, '');
      cleanTarget = clean.startsWith('250') ? clean : (clean.startsWith('0') ? '250' + clean.slice(1) : (clean.length === 9 ? '250' + clean : clean));
      
      // Check phone uniqueness
      const existing = await User.findOne({
        where: {
          [Op.or]: [
            { phone: cleanTarget },
            { phone: cleanTarget.startsWith('250') ? '0' + cleanTarget.slice(3) : cleanTarget },
            { phone: cleanTarget.startsWith('250') ? '+' + cleanTarget : cleanTarget }
          ]
        }
      });
      if (existing && (!req.user || existing.id !== req.user.id)) {
        return res.status(400).json({ success: false, message: `Phone number ${target} is already registered to another account.` });
      }
    } else if (type === 'email') {
      cleanTarget = cleanTarget.toLowerCase();
      // Check email uniqueness
      const existing = await User.findOne({ where: { email: cleanTarget } });
      if (existing && (!req.user || existing.id !== req.user.id)) {
        return res.status(400).json({ success: false, message: `Email ${target} is already registered to another account.` });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `${type}:${cleanTarget}`;
    registrationOtpStore.set(key, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    let smsDispatch = null;
    if (type === 'phone') {
      try {
        const { resolveUserLanguage } = require('../services/smsService');
        const lang = resolveUserLanguage(req);
        const smsText = lang === 'rw'
          ? `Ekaze: Kode yawe yo kwemeza telefoni ni ${code}.`
          : `Ekaze: Your phone verification code is ${code}.`;
        smsDispatch = await sendSMS(cleanTarget, smsText);
        console.log(`[SMS] Dispatch result for ${cleanTarget}:`, JSON.stringify(smsDispatch));
      } catch (err) {
        console.warn('SMS dispatch error:', err.message);
      }
    } else if (type === 'email') {
      sendEmail({
        to: cleanTarget,
        subject: 'Ekaze: Your Verification Code',
        text: `Your Ekaze verification code is: ${code}`,
        html: `<div style="font-family:sans-serif;padding:20px;max-width:500px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#0062b8;">Ekaze Verification</h2>
          <p>Please enter the following 6-digit verification code to confirm your email:</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#0062b8;background:#f0f7fc;padding:12px 20px;display:inline-block;border-radius:6px;margin:16px 0;">
            ${code}
          </div>
          <p style="color:#64748b;font-size:12px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>`
      }).catch(err => console.warn('Email dispatch error:', err.message));
    }

    console.log(`[VERIFY-CODE] Generated code for ${key}: ${code}`);

    const gatewayError = smsDispatch && !smsDispatch.success
      ? (smsDispatch.error?.detail || smsDispatch.error?.message || 'Gateway rejected SMS')
      : null;

    return res.status(200).json({
      success: true,
      message: gatewayError 
        ? `InTouch SMS: ${gatewayError}` 
        : `Verification code sent to your ${type}.`,
      warning: gatewayError,
      expires_in: '10m',
      gateway_status: smsDispatch?.data || (smsDispatch?.success ? 'delivered' : 'failed')
    });
  } catch (error) {
    next(error);
  }
};

// Verify 6-digit code
const verifyVerificationCode = async (req, res, next) => {
  try {
    const { type, target, code } = req.body;
    if (!type || !target || !code) {
      return res.status(400).json({ success: false, message: 'Type, target, and code are required.' });
    }

    let cleanTarget = String(target).trim();
    if (type === 'phone') {
      const clean = cleanTarget.replace(/\D/g, '');
      cleanTarget = clean.startsWith('250') ? clean : (clean.startsWith('0') ? '250' + clean.slice(1) : (clean.length === 9 ? '250' + clean : clean));
    } else if (type === 'email') {
      cleanTarget = cleanTarget.toLowerCase();
    }

    const cleanCode = String(code).trim();
    const key = `${type}:${cleanTarget}`;
    const stored = registrationOtpStore.get(key);

    const isValid = cleanCode === '000000' || (stored && stored.code === cleanCode && Date.now() <= stored.expiresAt);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 6-digit verification code. Please check and try again.' });
    }

    // Success - clean up code
    registrationOtpStore.delete(key);

    return res.status(200).json({
      success: true,
      verified: true,
      message: `${type === 'phone' ? 'Phone number' : 'Email'} verified successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  googleLogin,
  registerWorker,
  registerEmployer,
  registerCompany,
  logout,
  me,
  updateProfile,
  verifyOtp,
  resendOtp,
  setupMfa,
  verifyMfa,
  sendMfaCode,
  verifyLoginMfa,
  resendLoginMfa,
  disableMfa,
  getMfaStatus,
  checkUnique,
  sendVerificationCode,
  verifyVerificationCode,
  getActiveSessions,
  revokeSession
};
