const { initiatePayment, initiatePayout, processFundMovement, checkPaymentStatus } = require('../services/paymentService');
const { Transaction } = require('../models');

// Initiate collection payment (User/Employer pays into system)
const initiate = async (req, res, next) => {
  try {
    const { type, amount, phone_number, phone, metadata, transaction_id } = req.body;
    const targetPhone = phone_number || phone;

    let targetAmount = amount;
    let targetType = type || 'hiring_fee';
    let targetUserId = req.user ? req.user.id : null;
    let targetMetadata = metadata || {};

    if (transaction_id) {
      const existingTx = await Transaction.findOne({ where: { reference_id: transaction_id } });
      if (existingTx) {
        targetAmount = targetAmount || existingTx.amount;
        targetType = existingTx.type || targetType;
        targetUserId = targetUserId || existingTx.user_id;
        targetMetadata = { ...(existingTx.metadata || {}), ...targetMetadata, transaction_id };
      }
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User authentication or valid transaction reference required.'
      });
    }

    const result = await initiatePayment({
      userId: targetUserId,
      type: targetType,
      amount: targetAmount || 1000,
      phoneNumber: targetPhone,
      metadata: targetMetadata
    });

    return res.status(200).json({
      success: result.success,
      reference_id: result.data?.referenceId || result.referenceId || transaction_id,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// Initiate payout / disbursement (System sends money to user MoMo)
const payout = async (req, res, next) => {
  try {
    const { amount, phone_number, metadata, type } = req.body;

    const result = await initiatePayout({
      userId: req.user.id,
      amount,
      phoneNumber: phone_number,
      metadata,
      type: type || 'withdrawal'
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Webhook / Callback handler from MTN MoMo
// MTN posts { externalId, financialTransactionId, status, reason, ... }. We never trust the body's
// status directly: we re-check the transaction with the MTN Collection API before releasing anything.
const callback = async (req, res, next) => {
  try {
    const referenceId = req.body?.referenceId || req.body?.externalId || req.headers['x-reference-id'] || req.query?.referenceId;

    if (!referenceId) {
      return res.status(200).json({ success: true, message: 'MTN MoMo callback received (no reference)' });
    }

    const tx = await Transaction.findOne({ where: { reference_id: referenceId } });
    if (!tx) {
      return res.status(200).json({ success: true, message: 'MTN MoMo callback received (unknown reference)' });
    }

    const result = await checkPaymentStatus(referenceId); // verifies with MTN + processes fund movement
    return res.status(200).json({
      success: true,
      message: 'MTN MoMo callback processed',
      payment_status: result.payment_status
    });
  } catch (error) {
    console.error('MTN MoMo callback error:', error.message);
    return res.status(200).json({ success: true, message: 'MTN MoMo callback received' });
  }
};

// Check transaction status directly
const getStatus = async (req, res, next) => {
  try {
    const { referenceId } = req.params;
    const result = await checkPaymentStatus(referenceId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get transaction list
const getTransactions = async (req, res, next) => {
  try {
    const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };
    const transactions = await Transaction.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiate,
  payout,
  callback,
  getStatus,
  getTransactions
};
