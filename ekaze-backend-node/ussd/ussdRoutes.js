const express = require('express');
const router = express.Router();
const ussdController = require('./ussdController');

// Main USSD Webhook Handler (Supports POST from Telco Gateway and GET for easy browser testing)
router.post('/', ussdController.handleUssdWebhook);
router.get('/', ussdController.handleUssdWebhook);

// Info / metadata endpoint
router.get('/info', ussdController.getUssdInfo);

module.exports = router;
