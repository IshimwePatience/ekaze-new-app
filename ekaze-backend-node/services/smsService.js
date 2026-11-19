const axios = require('axios');

/**
 * Normalizes phone numbers for Rwanda SMS Gateway
 * Supports formats: 078..., +25078..., 25078...
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '250' + cleaned.slice(1);
  } else if (!cleaned.startsWith('250') && cleaned.length === 9) {
    cleaned = '250' + cleaned;
  }
  return cleaned;
};

const cleanVal = (val, fallback = '') => {
  const raw = val !== undefined && val !== null ? String(val) : String(fallback || '');
  return raw.trim().replace(/^["']|["']$/g, '');
};

/**
 * Normalizes a language code/string to 'rw' (Kinyarwanda) or 'en' (English).
 */
const normalizeLangCode = (val) => {
  if (!val) return null;
  const s = String(val).trim().toLowerCase();
  if (s === 'en' || s.startsWith('en-') || s.startsWith('en_') || s.includes('english')) {
    return 'en';
  }
  if (s === 'rw' || s === 'kin' || s.startsWith('rw-') || s.startsWith('kin-') || s.includes('kinyarwanda')) {
    return 'rw';
  }
  return null;
};

/**
 * Resolves user preferred language ('en' or 'rw') from request, explicit string, or User model.
 */
const resolveUserLanguage = (reqOrLang, userRecord = null) => {
  if (typeof reqOrLang === 'string') {
    const direct = normalizeLangCode(reqOrLang);
    if (direct) return direct;
  }
  if (reqOrLang && typeof reqOrLang === 'object') {
    const fromBody = normalizeLangCode(reqOrLang.body?.language || reqOrLang.body?.preferred_language);
    if (fromBody) return fromBody;
    const fromQuery = normalizeLangCode(reqOrLang.query?.lang);
    if (fromQuery) return fromQuery;
    const fromHeader = normalizeLangCode(
      reqOrLang.headers?.['x-language'] ||
      reqOrLang.headers?.['accept-language']
    );
    if (fromHeader) return fromHeader;
    if (reqOrLang.user?.preferred_language) {
      const fromReqUser = normalizeLangCode(reqOrLang.user.preferred_language);
      if (fromReqUser) return fromReqUser;
    }
  }
  if (userRecord) {
    const fromRecord = normalizeLangCode(
      userRecord.preferred_language ||
      userRecord.language ||
      userRecord.extended_profile?.preferred_language
    );
    if (fromRecord) return fromRecord;
  }
  return 'en';
};

/**
 * Dispatches an SMS using the InTouch SMS Rwanda Gateway
 * @param {string} to - Recipient phone number
 * @param {string} message - Message text
 */
const sendSMS = async (to, message) => {
  const url = cleanVal(process.env.DEV_SMS_GATEWAY_URL, 'https://www.intouchsms.co.rw/api/sendsms/.json');
  const username = cleanVal(process.env.DEV_SMS_GATEWAY_USERNAME, 'benocars.technology');
  const password = cleanVal(process.env.DEV_SMS_GATEWAY_PASSWORD, 'beno@123');
  const sender = cleanVal(process.env.DEV_SMS_GATEWAY_SENDERNAME, 'Benocars.T');

  const recipient = formatPhoneNumber(to);

  if (!recipient || recipient.length < 10) {
    console.warn(`[SMS] Invalid recipient number: ${to}`);
    return { success: false, message: 'Invalid recipient phone number' };
  }

  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  params.append('sender', sender);
  params.append('recipients', recipient);
  params.append('message', message);

  try {
    const response = await axios.post(url, params, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      auth: {
        username,
        password
      },
      timeout: 15000
    });

    console.log(`[SMS] Dispatched to ${recipient}: ${response.status} -`, response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`[SMS] Failed to send SMS via urlencoded to ${recipient}:`, error.response?.data || error.message);
    
    // Fallback: try JSON payload
    try {
      const jsonResponse = await axios.post(url, {
        username,
        password,
        sender,
        recipients: recipient,
        message
      }, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        auth: {
          username,
          password
        },
        timeout: 15000
      });
      console.log(`[SMS] (Fallback JSON) Dispatched to ${recipient}: ${jsonResponse.status} -`, jsonResponse.data);
      return {
        success: true,
        data: jsonResponse.data
      };
    } catch (fallbackError) {
      console.error(`[SMS] (Fallback JSON also failed):`, fallbackError.response?.data || fallbackError.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
};

module.exports = {
  sendSMS,
  formatPhoneNumber,
  normalizeLangCode,
  resolveUserLanguage
};
