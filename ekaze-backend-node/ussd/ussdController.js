const { handleUssdSession } = require('./ussdService');

/**
 * USSD Webhook Handler (Accepts requests from Africa's Talking, MTN, Airtel, or test simulators)
 */
const handleUssdWebhook = async (req, res, next) => {
  try {
    // Extract parameters from either POST body or GET query (for testing)
    const sessionId = req.body.sessionId || req.query.sessionId || 'session_' + Date.now();
    const serviceCode = req.body.serviceCode || req.query.serviceCode || '*789#';
    const phoneNumber = req.body.phoneNumber || req.query.phoneNumber || req.body.phone || req.query.phone;
    const text = req.body.text !== undefined ? req.body.text : (req.query.text !== undefined ? req.query.text : '');

    if (!phoneNumber) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send('END Nimero ya telefone ntabwo yabonetse.');
    }

    const response = await handleUssdSession({
      sessionId,
      serviceCode,
      phoneNumber,
      text: String(text).trim()
    });

    // USSD gateways require HTTP 200 with text/plain content type
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(response);
  } catch (error) {
    console.error('USSD Controller Error:', error);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send('END Habaye ikibazo mu itumanaho. Ongera ugerageze mukanya.');
  }
};

/**
 * Health check / info endpoint for USSD service
 */
const getUssdInfo = (req, res) => {
  return res.status(200).json({
    success: true,
    service: 'Ekaze USSD Gateway Engine',
    shortcode: '*789#',
    supported_aggregators: ["Africa's Talking", 'MTN Rwanda Webhook', 'Airtel Money USSD'],
    endpoints: {
      webhook: '/api/v1/ussd (POST or GET)',
      test_example: '/api/v1/ussd?phoneNumber=0788000004&text='
    }
  });
};

module.exports = {
  handleUssdWebhook,
  getUssdInfo
};
