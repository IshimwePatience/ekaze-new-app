const { Setting, User } = require('../models');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Default initial system settings
const DEFAULT_PAYMENT_SETTINGS = {
  company_registration_fee: 1000,
  company_card_fee: 1000,
  worker_registration_fee: 0,
  employer_registration_fee: 0,
  company_payment_enabled: true,
  worker_payment_enabled: false,
  employer_payment_enabled: false,
  worker_contact_fee: 5000,
  min_saving_amount: 500,
  max_saving_amount: 1000000,
  min_withdrawal_amount: 500,
  max_withdrawal_amount: 2000000
};

const DEFAULT_API_SETTINGS = {
  momo_api: {
    api_key: { value: '', is_active: true },
    api_secret: { value: '', is_active: true }
  },
  nida_api: {
    api_key: { value: '', is_active: true },
    endpoint_url: { value: 'https://api.nida.gov.rw', is_active: true }
  },
  sms_api: {
    api_key: { value: '', is_active: true },
    sender_id: { value: 'EKAZE', is_active: true }
  }
};

// Helper: Ensure setting exists in DB or return fallback
const getSettingValue = async (key, fallback) => {
  try {
    const setting = await Setting.findOne({ where: { key } });
    if (!setting || setting.value === null || setting.value === undefined) {
      return fallback;
    }
    // Attempt parse JSON / boolean / number
    const val = setting.value;
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (!isNaN(val) && val.trim() !== '') return Number(val);
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  } catch {
    return fallback;
  }
};

// Helper: Set setting in DB
const setSettingValue = async (key, value, category = 'general', description = '') => {
  const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
  const existing = await Setting.findOne({ where: { key } });
  if (existing) {
    existing.value = strVal;
    if (category) existing.category = category;
    if (description) existing.description = description;
    await existing.save();
    return existing;
  } else {
    return await Setting.create({
      key,
      value: strVal,
      category,
      description,
      is_active: true
    });
  }
};

// 1. Get Payment Settings
const getPaymentSettings = async (req, res, next) => {
  try {
    const rawCompFee = await getSettingValue('company_card_fee', await getSettingValue('company_registration_fee', DEFAULT_PAYMENT_SETTINGS.company_registration_fee));
    const company_registration_fee = Number(rawCompFee) || 0;
    const company_card_fee = company_registration_fee;
    const worker_registration_fee = Number(await getSettingValue('worker_registration_fee', DEFAULT_PAYMENT_SETTINGS.worker_registration_fee)) || 0;
    const employer_registration_fee = Number(await getSettingValue('employer_registration_fee', DEFAULT_PAYMENT_SETTINGS.employer_registration_fee)) || 0;
    const worker_contact_fee = Number(await getSettingValue('worker_contact_fee', DEFAULT_PAYMENT_SETTINGS.worker_contact_fee)) || 5000;
    const min_saving_amount = Number(await getSettingValue('min_saving_amount', DEFAULT_PAYMENT_SETTINGS.min_saving_amount)) || 500;
    const max_saving_amount = Number(await getSettingValue('max_saving_amount', DEFAULT_PAYMENT_SETTINGS.max_saving_amount)) || 1000000;
    const min_withdrawal_amount = Number(await getSettingValue('min_withdrawal_amount', DEFAULT_PAYMENT_SETTINGS.min_withdrawal_amount)) || 500;
    const max_withdrawal_amount = Number(await getSettingValue('max_withdrawal_amount', DEFAULT_PAYMENT_SETTINGS.max_withdrawal_amount)) || 2000000;
    
    let company_payment_enabled = await getSettingValue('company_payment_enabled', DEFAULT_PAYMENT_SETTINGS.company_payment_enabled);
    let worker_payment_enabled = await getSettingValue('worker_payment_enabled', DEFAULT_PAYMENT_SETTINGS.worker_payment_enabled);
    let employer_payment_enabled = await getSettingValue('employer_payment_enabled', DEFAULT_PAYMENT_SETTINGS.employer_payment_enabled);

    // If registration money is more than 0, it must be enabled with a tick
    if (company_registration_fee > 0) company_payment_enabled = true;
    if (worker_registration_fee > 0) worker_payment_enabled = true;
    if (employer_registration_fee > 0) employer_payment_enabled = true;

    return res.status(200).json({
      success: true,
      data: {
        company_registration_fee,
        company_card_fee,
        worker_registration_fee,
        employer_registration_fee,
        company_payment_enabled: Boolean(company_payment_enabled),
        worker_payment_enabled: Boolean(worker_payment_enabled),
        employer_payment_enabled: Boolean(employer_payment_enabled),
        worker_contact_fee,
        min_saving_amount,
        max_saving_amount,
        min_withdrawal_amount,
        max_withdrawal_amount
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Update Payment Settings
const updatePaymentSettings = async (req, res, next) => {
  try {
    const {
      company_registration_fee,
      company_card_fee,
      worker_registration_fee,
      employer_registration_fee,
      company_payment_enabled,
      worker_payment_enabled,
      employer_payment_enabled,
      worker_contact_fee,
      min_saving_amount,
      max_saving_amount,
      min_withdrawal_amount,
      max_withdrawal_amount
    } = req.body;

    const rawFee = company_card_fee !== undefined ? company_card_fee : company_registration_fee;
    const compFeeNum = rawFee !== undefined ? Number(rawFee) : undefined;
    const workFeeNum = worker_registration_fee !== undefined ? Number(worker_registration_fee) : undefined;
    const emplFeeNum = employer_registration_fee !== undefined ? Number(employer_registration_fee) : undefined;
    const contactFeeNum = worker_contact_fee !== undefined ? Number(worker_contact_fee) : undefined;
    const minSavingNum = min_saving_amount !== undefined ? Number(min_saving_amount) : undefined;
    const maxSavingNum = max_saving_amount !== undefined ? Number(max_saving_amount) : undefined;
    const minWithdrawNum = min_withdrawal_amount !== undefined ? Number(min_withdrawal_amount) : undefined;
    const maxWithdrawNum = max_withdrawal_amount !== undefined ? Number(max_withdrawal_amount) : undefined;

    if (compFeeNum !== undefined) {
      await setSettingValue('company_registration_fee', compFeeNum, 'payment', 'Company fee for generating driver card per person in RWF');
      await setSettingValue('company_card_fee', compFeeNum, 'payment', 'Company fee for generating driver card per person in RWF');
    }
    if (workFeeNum !== undefined) {
      await setSettingValue('worker_registration_fee', workFeeNum, 'payment', 'Worker registration fee in RWF');
    }
    if (emplFeeNum !== undefined) {
      await setSettingValue('employer_registration_fee', emplFeeNum, 'payment', 'Employer registration fee in RWF');
    }
    if (contactFeeNum !== undefined) {
      await setSettingValue('worker_contact_fee', contactFeeNum, 'payment', 'Worker contact / hiring fee in RWF');
    }
    if (minSavingNum !== undefined) {
      await setSettingValue('min_saving_amount', minSavingNum, 'payment', 'Minimum saving amount in RWF');
    }
    if (maxSavingNum !== undefined) {
      await setSettingValue('max_saving_amount', maxSavingNum, 'payment', 'Maximum saving amount in RWF');
    }
    if (minWithdrawNum !== undefined) {
      await setSettingValue('min_withdrawal_amount', minWithdrawNum, 'payment', 'Minimum withdrawal amount in RWF');
    }
    if (maxWithdrawNum !== undefined) {
      await setSettingValue('max_withdrawal_amount', maxWithdrawNum, 'payment', 'Maximum withdrawal amount in RWF');
    }

    // Auto-enable if fee > 0 unless specifically provided
    const compEnabled = company_payment_enabled !== undefined ? company_payment_enabled : (compFeeNum !== undefined && compFeeNum > 0 ? true : undefined);
    if (compEnabled !== undefined) {
      await setSettingValue('company_payment_enabled', compEnabled, 'payment', 'Company payment required toggle');
    }

    const workEnabled = worker_payment_enabled !== undefined ? worker_payment_enabled : (workFeeNum !== undefined && workFeeNum > 0 ? true : undefined);
    if (workEnabled !== undefined) {
      await setSettingValue('worker_payment_enabled', workEnabled, 'payment', 'Worker payment required toggle');
    }

    const emplEnabled = employer_payment_enabled !== undefined ? employer_payment_enabled : (emplFeeNum !== undefined && emplFeeNum > 0 ? true : undefined);
    if (emplEnabled !== undefined) {
      await setSettingValue('employer_payment_enabled', emplEnabled, 'payment', 'Employer payment required toggle');
    }

    return res.status(200).json({
      success: true,
      message: 'Payment settings updated successfully',
      data: {
        company_registration_fee: compFeeNum !== undefined ? compFeeNum : await getSettingValue('company_registration_fee', 1000),
        company_card_fee: compFeeNum !== undefined ? compFeeNum : await getSettingValue('company_registration_fee', 1000),
        worker_registration_fee: workFeeNum !== undefined ? workFeeNum : await getSettingValue('worker_registration_fee', 0),
        employer_registration_fee: emplFeeNum !== undefined ? emplFeeNum : await getSettingValue('employer_registration_fee', 0),
        worker_contact_fee: contactFeeNum !== undefined ? contactFeeNum : await getSettingValue('worker_contact_fee', 5000),
        min_saving_amount: minSavingNum !== undefined ? minSavingNum : await getSettingValue('min_saving_amount', 500),
        max_saving_amount: maxSavingNum !== undefined ? maxSavingNum : await getSettingValue('max_saving_amount', 1000000),
        min_withdrawal_amount: minWithdrawNum !== undefined ? minWithdrawNum : await getSettingValue('min_withdrawal_amount', 500),
        max_withdrawal_amount: maxWithdrawNum !== undefined ? maxWithdrawNum : await getSettingValue('max_withdrawal_amount', 2000000)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get API Settings
const getApiSettings = async (req, res, next) => {
  try {
    const momo_api_key = await getSettingValue('momo_api_api_key', '');
    const momo_api_secret = await getSettingValue('momo_api_api_secret', '');
    const nida_api_key = await getSettingValue('nida_api_api_key', '');
    const nida_endpoint_url = await getSettingValue('nida_api_endpoint_url', 'https://api.nida.gov.rw');
    const sms_api_key = await getSettingValue('sms_api_api_key', '');
    const sms_sender_id = await getSettingValue('sms_api_sender_id', 'EKAZE');

    return res.status(200).json({
      success: true,
      data: {
        momo_api: {
          api_key: { value: momo_api_key, is_active: true },
          api_secret: { value: momo_api_secret, is_active: true }
        },
        nida_api: {
          api_key: { value: nida_api_key, is_active: true },
          endpoint_url: { value: nida_endpoint_url, is_active: true }
        },
        sms_api: {
          api_key: { value: sms_api_key, is_active: true },
          sender_id: { value: sms_sender_id, is_active: true }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update API Settings by provider
const updateApiSettings = async (req, res, next) => {
  try {
    const { provider } = req.params; // momo_api, nida_api, sms_api
    const entries = req.body || {};

    for (const [key, value] of Object.entries(entries)) {
      await setSettingValue(`${provider}_${key}`, value, provider, `${provider} ${key} config`);
    }

    return res.status(200).json({
      success: true,
      message: `${provider} settings updated successfully`,
      data: req.body
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get All Settings
const getAllSettings = async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category) where.category = category;

    const settings = await Setting.findAll({ where });
    const grouped = {};

    settings.forEach((s) => {
      if (!grouped[s.category]) {
        grouped[s.category] = {};
      }
      let parsedVal = s.value;
      if (parsedVal === 'true') parsedVal = true;
      else if (parsedVal === 'false') parsedVal = false;
      else if (!isNaN(parsedVal) && parsedVal.trim() !== '') parsedVal = Number(parsedVal);

      grouped[s.category][s.key] = {
        value: parsedVal,
        description: s.description,
        is_active: s.is_active
      };
    });

    return res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (error) {
    next(error);
  }
};

// 6. Get Settings by Key
const getSettingsByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    // Check if category
    const catSettings = await Setting.findAll({ where: { category: key } });
    if (catSettings.length > 0) {
      const group = {};
      catSettings.forEach(s => {
        let parsedVal = s.value;
        if (parsedVal === 'true') parsedVal = true;
        else if (parsedVal === 'false') parsedVal = false;
        else if (!isNaN(parsedVal) && parsedVal.trim() !== '') parsedVal = Number(parsedVal);

        group[s.key] = {
          value: parsedVal,
          description: s.description,
          is_active: s.is_active
        };
      });
      return res.status(200).json({ success: true, data: group });
    }

    const single = await Setting.findOne({ where: { key } });
    if (!single) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    let parsedVal = single.value;
    if (parsedVal === 'true') parsedVal = true;
    else if (parsedVal === 'false') parsedVal = false;
    else if (!isNaN(parsedVal) && parsedVal.trim() !== '') parsedVal = Number(parsedVal);

    return res.status(200).json({
      success: true,
      data: {
        key: single.key,
        value: parsedVal,
        category: single.category,
        description: single.description,
        is_active: single.is_active
      }
    });
  } catch (error) {
    next(error);
  }
};

// 7. Update Single Setting
const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await setSettingValue(key, value, undefined, description);
    return res.status(200).json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

// 8. Toggle Setting
const toggleSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ where: { key } });
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    setting.is_active = !setting.is_active;
    await setting.save();

    return res.status(200).json({
      success: true,
      message: `Setting ${setting.is_active ? 'enabled' : 'disabled'} successfully`,
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN PROFILE CONTROLLERS ====================

// Helper to get active admin user
const getAdminUser = async (req) => {
  if (req.user && req.user.role === 'admin') {
    return req.user;
  }
  if (req.user) {
    return req.user;
  }
  // Fallback to seeded admin in database
  const admin = await User.findOne({
    where: { role: 'admin' },
    order: [['id', 'ASC']]
  });
  return admin;
};

// Helper to format profile
const formatUserProfile = (user, req) => {
  let photoUrl = null;
  if (user.profile_photo) {
    if (user.profile_photo.startsWith('http://') || user.profile_photo.startsWith('https://')) {
      photoUrl = user.profile_photo;
    } else {
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol || 'http';
      const cleanPath = user.profile_photo.startsWith('/') ? user.profile_photo : `/${user.profile_photo}`;
      photoUrl = `${protocol}://${host}${cleanPath}`;
    }
  }

  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    national_id: user.national_id,
    gender: user.gender,
    date_of_birth: user.date_of_birth,
    profile_photo: user.profile_photo,
    profile_photo_url: photoUrl,
    status: user.status,
    is_verified: user.is_verified,
    verified_at: user.verified_at,
    address: user.address,
    district: user.district,
    sector: user.sector,
    cell: user.cell,
    village: user.village,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
};

// 9. Get Admin Profile
const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }
    return res.status(200).json({
      success: true,
      data: formatUserProfile(admin, req)
    });
  } catch (error) {
    next(error);
  }
};

// 10. Update Admin Profile
const updateAdminProfile = async (req, res, next) => {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    const { name, email, phone, gender, date_of_birth, address, district, sector, cell, village } = req.body;
    if (name !== undefined) admin.name = name;
    if (email !== undefined) admin.email = email;
    if (phone !== undefined) admin.phone = phone;
    if (gender !== undefined) admin.gender = gender;
    if (date_of_birth !== undefined) admin.date_of_birth = date_of_birth;
    if (address !== undefined) admin.address = address;
    if (district !== undefined) admin.district = district;
    if (sector !== undefined) admin.sector = sector;
    if (cell !== undefined) admin.cell = cell;
    if (village !== undefined) admin.village = village;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: formatUserProfile(admin, req)
    });
  } catch (error) {
    next(error);
  }
};

// 11. Update Admin Password
const updateAdminPassword = async (req, res, next) => {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    const { current_password, new_password, new_password_confirmation } = req.body;
    if (!new_password || new_password !== new_password_confirmation) {
      return res.status(400).json({ success: false, message: 'New password confirmation does not match' });
    }

    if (current_password) {
      const isMatch = await admin.comparePassword(current_password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(new_password, salt);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 12. Upload Admin Profile Photo
const uploadAdminPhoto = async (req, res, next) => {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo uploaded' });
    }

    const relativePath = `/uploads/profiles/${req.file.filename}`;
    admin.profile_photo = relativePath;
    await admin.save();

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const photoUrl = `${protocol}://${host}${relativePath}`;

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        photo_url: photoUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// 13. Delete Admin Profile Photo
const deleteAdminPhoto = async (req, res, next) => {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    admin.profile_photo = null;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
  getApiSettings,
  updateApiSettings,
  getAllSettings,
  getSettingsByKey,
  updateSetting,
  toggleSetting,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  uploadAdminPhoto,
  deleteAdminPhoto,
  getSettingValue,
  setSettingValue
};
