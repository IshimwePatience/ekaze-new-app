const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, protectOptional } = require('../middleware/auth');

router.post('/initiate', protectOptional, paymentController.initiate);
router.post('/payout', protect, paymentController.payout);
router.get('/status/:referenceId', protectOptional, paymentController.getStatus);
router.post('/callback', paymentController.callback); // Webhook callback from Momo
router.get('/transactions', protect, paymentController.getTransactions);

module.exports = router;
