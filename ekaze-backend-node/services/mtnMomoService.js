const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class MtnMomoService {
  constructor() {
    this.baseUrl = (process.env.MTN_API || process.env.MTN_API_URL || 'https://proxy.momoapi.mtn.co.rw').replace(/\/+$/, '');
    this.subscriptionKey = (process.env.MTN_COLLECTION_SUBSCRIPTION_KEY || process.env.MTN_SUBSCRIPTION_KEY || '').trim();
    this.b64Key = (process.env.MTN_COLLECTION_B64_KEY || process.env.MTN_B64_KEY || '').trim();
    this.targetEnv = (process.env.MTN_TARGET_ENVIRONMENT || process.env.MTN_TARGET_ENV || 'mtnrwanda').trim();

    this.disbursementSubKey = (process.env.MTN_DISBURSEMENT_SUBSCRIPTION_KEY || this.subscriptionKey).trim();
    this.disbursementB64Key = (process.env.MTN_DISBURSEMENT_B64_KEY || this.b64Key).trim();

    // In-memory token cache to prevent 429 Too Many Requests & rate limiting on proxy
    this.collectionTokenCache = { token: null, expiresAt: 0 };
    this.disbursementTokenCache = { token: null, expiresAt: 0 };
  }

  /**
   * Strictly normalize & validate Rwandan MTN phone number.
   * Only MTN Rwanda prefixes (078..., 079...) are accepted.
   * Formats to MSISDN: 25078XXXXXXX or 25079XXXXXXX.
   */
  normalizeMtnPhone(phone) {
    if (!phone) return null;
    let cleaned = String(phone).replace(/[^0-9]/g, '');

    if (cleaned.startsWith('078') || cleaned.startsWith('079')) {
      if (cleaned.length === 10) return '25' + cleaned;
    }
    if (cleaned.startsWith('78') || cleaned.startsWith('79')) {
      if (cleaned.length === 9) return '250' + cleaned;
    }
    if (cleaned.startsWith('25078') || cleaned.startsWith('25079')) {
      if (cleaned.length === 12) return cleaned;
    }

    // Invalid or non-MTN
    return null;
  }

  /**
   * Helper to ensure header X-Reference-Id is always a strictly valid UUIDv4
   */
  ensureUuid(ref) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (ref && uuidRegex.test(ref)) {
      return ref;
    }
    return uuidv4();
  }

  /**
   * Get Access Token for Collection (Pay In) with in-memory caching
   */
  async getCollectionToken() {
    const now = Date.now();
    if (this.collectionTokenCache.token && this.collectionTokenCache.expiresAt > now + 60000) {
      return this.collectionTokenCache.token;
    }

    if (!this.subscriptionKey || !this.b64Key) {
      console.error('❌ MTN Collection keys are missing from configuration.');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/collection/token/`,
        {},
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Authorization': `Basic ${this.b64Key}`,
            'X-Target-Environment': this.targetEnv
          },
          timeout: 15000
        }
      );

      const token = response.data?.access_token;
      const expiresIn = parseInt(response.data?.expires_in, 10) || 3600;

      if (token) {
        this.collectionTokenCache = {
          token,
          expiresAt: now + (expiresIn * 1000)
        };
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ MTN Collection Token Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Get Access Token for Disbursement (Payout / Worker Cashout) with in-memory caching
   */
  async getDisbursementToken() {
    const now = Date.now();
    if (this.disbursementTokenCache.token && this.disbursementTokenCache.expiresAt > now + 60000) {
      return this.disbursementTokenCache.token;
    }

    if (!this.disbursementSubKey || !this.disbursementB64Key) {
      console.error('❌ MTN Disbursement keys are missing from configuration.');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/disbursement/token/`,
        {},
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.disbursementSubKey,
            'Authorization': `Basic ${this.disbursementB64Key}`,
            'X-Target-Environment': this.targetEnv
          },
          timeout: 15000
        }
      );

      const token = response.data?.access_token;
      const expiresIn = parseInt(response.data?.expires_in, 10) || 3600;

      if (token) {
        this.disbursementTokenCache = {
          token,
          expiresAt: now + (expiresIn * 1000)
        };
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ MTN Disbursement Token Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * 1. Request to Pay (Collection - Prompt user for PIN on MTN phone)
   */
  async requestToPay({ phone, amount, referenceId, externalId, note = 'IHIRWE Payment' }) {
    const formattedPhone = this.normalizeMtnPhone(phone);
    if (!formattedPhone) {
      return {
        success: false,
        message: 'Invalid MTN phone number. Only MTN Rwanda numbers (078xxxxxxx, 079xxxxxxx) are supported.'
      };
    }

    const numAmount = Math.round(Number(amount));
    if (isNaN(numAmount) || numAmount < 1 || numAmount > 2000000) {
      return {
        success: false,
        message: 'Invalid amount. Minimum is 1 RWF, maximum is 2,000,000 RWF per transaction.'
      };
    }

    const uuidRef = this.ensureUuid(referenceId);
    const token = await this.getCollectionToken();

    if (!token) {
      return {
        success: false,
        message: 'Unable to connect to MTN MoMo Gateway. Please verify credentials or try again shortly.'
      };
    }

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': uuidRef,
        'X-Target-Environment': this.targetEnv,
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'Content-Type': 'application/json'
      };
      // MTN pushes the final status to this webhook (must be a public HTTPS URL whitelisted with MTN)
      const callbackUrl = (process.env.MTN_CALLBACK_URL || '').trim();
      if (callbackUrl) headers['X-Callback-Url'] = callbackUrl;

      const response = await axios.post(
        `${this.baseUrl}/collection/v1_0/requesttopay`,
        {
          amount: String(numAmount),
          currency: 'RWF',
          externalId: String(externalId || referenceId || uuidRef),
          payer: {
            partyIdType: 'MSISDN',
            partyId: formattedPhone
          },
          payerMessage: note,
          payeeNote: note
        },
        {
          headers,
          timeout: 20000
        }
      );

      // MTN Returns 202 Accepted when USSD prompt is pushed to subscriber
      if (response.status === 202) {
        return {
          success: true,
          referenceId: uuidRef,
          status: 'PENDING',
          isMock: false,
          phone: formattedPhone,
          amount: numAmount,
          message: 'MTN MoMo payment prompt sent to your phone. Please dial *182*7*1# or approve the pop-up.'
        };
      }

      return {
        success: false,
        message: 'MTN Gateway did not accept payment request.'
      };
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      console.error('❌ MTN requestToPay failed:', errMsg);
      return {
        success: false,
        message: `MTN MoMo request failed: ${errMsg}`
      };
    }
  }

  /**
   * 2. Transfer / Payout (Disbursement - Send funds from Ihirwe account to worker MTN phone)
   */
  async transfer({ phone, amount, referenceId, externalId, note = 'IHIRWE Payout' }) {
    const formattedPhone = this.normalizeMtnPhone(phone);
    if (!formattedPhone) {
      return {
        success: false,
        message: 'Invalid MTN phone number. Only MTN Rwanda numbers (078xxxxxxx, 079xxxxxxx) are supported.'
      };
    }

    const numAmount = Math.round(Number(amount));
    if (isNaN(numAmount) || numAmount < 1 || numAmount > 2000000) {
      return {
        success: false,
        message: 'Invalid payout amount. Minimum is 1 RWF, maximum is 2,000,000 RWF.'
      };
    }

    const uuidRef = this.ensureUuid(referenceId);
    const token = await this.getDisbursementToken();

    if (!token) {
      return {
        success: false,
        message: 'Unable to connect to MTN Disbursement Gateway.'
      };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/disbursement/v1_0/transfer`,
        {
          amount: String(numAmount),
          currency: 'RWF',
          externalId: String(externalId || referenceId || uuidRef),
          payee: {
            partyIdType: 'MSISDN',
            partyId: formattedPhone
          },
          payerMessage: note,
          payeeNote: note
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': uuidRef,
            'X-Target-Environment': this.targetEnv,
            'Ocp-Apim-Subscription-Key': this.disbursementSubKey,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      if (response.status === 202) {
        return {
          success: true,
          referenceId: uuidRef,
          status: 'PENDING',
          isMock: false,
          phone: formattedPhone,
          amount: numAmount,
          message: 'MTN MoMo transfer initiated successfully.'
        };
      }

      return {
        success: false,
        message: 'MTN Gateway did not accept transfer request.'
      };
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      console.error('❌ MTN transfer failed:', errMsg);
      return {
        success: false,
        message: `MTN MoMo transfer failed: ${errMsg}`
      };
    }
  }

  /**
   * 3. Check Payment Status via Collection API
   */
  async getPaymentStatus(referenceId) {
    const uuidRef = this.ensureUuid(referenceId);
    const token = await this.getCollectionToken();

    if (!token) {
      return { status: 'PENDING', reason: 'Waiting for MoMo gateway authorization' };
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/collection/v1_0/requesttopay/${uuidRef}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.targetEnv,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          },
          timeout: 15000
        }
      );

      const status = response.data?.status || 'PENDING';
      return {
        status: status.toUpperCase(),
        financialId: response.data?.financialTransactionId || null,
        reason: response.data?.reason || null
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { status: 'PENDING', reason: 'Transaction pending approval on subscriber phone' };
      }
      return { status: 'FAILED', reason: error.response?.data?.message || error.message };
    }
  }

  /**
   * 4. Check Transfer Status via Disbursement API
   */
  async getTransferStatus(referenceId) {
    const uuidRef = this.ensureUuid(referenceId);
    const token = await this.getDisbursementToken();

    if (!token) {
      return { status: 'PENDING', reason: 'Waiting for MoMo gateway authorization' };
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/disbursement/v1_0/transfer/${uuidRef}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.targetEnv,
            'Ocp-Apim-Subscription-Key': this.disbursementSubKey
          },
          timeout: 15000
        }
      );

      const status = response.data?.status || 'PENDING';
      return {
        status: status.toUpperCase(),
        financialId: response.data?.financialTransactionId || null,
        reason: response.data?.reason || null
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { status: 'PENDING', reason: 'Transfer pending processing' };
      }
      return { status: 'FAILED', reason: error.response?.data?.message || error.message };
    }
  }
}

module.exports = new MtnMomoService();
