const { v4: uuidv4 } = require('uuid');
const { Transaction, Company, User, Employer, HiringRequest, sequelize } = require('../models');
const mtnMomoService = require('./mtnMomoService');

// 1. Initiate Collection Payment via MTN MoMo (User/Employer/Company pays into Ihirwe)
const initiatePayment = async ({ userId, type, amount, phoneNumber, metadata }) => {
  const referenceId = uuidv4(); // Standard UUIDv4 for MTN MoMo X-Reference-Id

  const targetAmount = parseFloat(amount);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    return {
      success: false,
      message: 'Invalid payment amount specified.'
    };
  }

  // Create pending transaction in DB
  const transaction = await Transaction.create({
    reference_id: referenceId,
    user_id: userId,
    type: type || 'hiring_fee',
    amount: targetAmount,
    phone_number: phoneNumber,
    payment_method: 'mtn_momo',
    status: 'pending',
    metadata: metadata || {}
  });

  // Trigger MTN MoMo Collection Payment
  const result = await mtnMomoService.requestToPay({
    phone: phoneNumber,
    amount: targetAmount,
    referenceId,
    externalId: referenceId,
    note: `IHIRWE ${type ? type.replace(/_/g, ' ') : 'Payment'}`
  });

  if (!result.success) {
    transaction.status = 'failed';
    transaction.metadata = { ...transaction.metadata, failure_reason: result.message };
    await transaction.save();
    return {
      success: false,
      referenceId,
      message: result.message || 'Payment initiation failed with MTN MoMo.'
    };
  }

  return {
    success: true,
    referenceId: transaction.reference_id,
    status: 'pending',
    payment_status: 'pending',
    amount: transaction.amount,
    provider: 'mtn_momo',
    message: result.message || 'MTN MoMo prompt sent. Please confirm on your phone (*182*7*1#).'
  };
};

// 2. Initiate Payout / Disbursement (Sending money to worker/company MTN MoMo)
const initiatePayout = async ({ userId, amount, phoneNumber, metadata, type = 'withdrawal' }) => {
  const referenceId = uuidv4();

  const targetAmount = parseFloat(amount);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    return {
      success: false,
      message: 'Invalid payout amount specified.'
    };
  }

  const transaction = await Transaction.create({
    reference_id: referenceId,
    user_id: userId,
    type,
    amount: targetAmount,
    phone_number: phoneNumber,
    payment_method: 'mtn_momo',
    status: 'pending',
    metadata: metadata || {}
  });

  // Call MTN MoMo Transfer
  const momoResult = await mtnMomoService.transfer({
    phone: phoneNumber,
    amount: targetAmount,
    referenceId,
    externalId: referenceId,
    note: `IHIRWE Payout (${type})`
  });

  if (!momoResult.success) {
    transaction.status = 'failed';
    transaction.metadata = { ...transaction.metadata, failure_reason: momoResult.message };
    await transaction.save();
    return {
      success: false,
      referenceId,
      message: momoResult.message || 'MTN MoMo transfer initiation failed.'
    };
  }

  return {
    success: true,
    referenceId: transaction.reference_id,
    status: 'pending',
    payment_status: 'pending',
    amount: transaction.amount,
    provider: 'mtn_momo',
    message: momoResult.message || 'MTN MoMo transfer initiated successfully.'
  };
};

// 3. Process Fund Movements upon verified payment completion
const processFundMovement = async ({ referenceId, companyId, amount, type }) => {
  const t = await sequelize.transaction();

  try {
    const transaction = await Transaction.findOne({ where: { reference_id: referenceId }, transaction: t });
    if (!transaction) throw new Error('Transaction not found');

    if (transaction.status === 'successful') {
      await t.commit();
      return { success: true, transaction, already_processed: true };
    }

    transaction.status = 'successful';
    await transaction.save({ transaction: t });

    // Handle user/employer/company activation if registration fee or fee payment
    const isRegistration =
      transaction.type === 'company_fee' ||
      transaction.type === 'employer_fee' ||
      transaction.type === 'registration_fee' ||
      transaction.metadata?.purpose === 'registration_fee' ||
      (transaction.metadata?.role && ['employer', 'company'].includes(transaction.metadata.role));

    let targetUserId = transaction.user_id;
    if (!targetUserId && transaction.metadata?.transaction_id) {
      const origTx = await Transaction.findOne({ where: { reference_id: transaction.metadata.transaction_id }, transaction: t });
      if (origTx && origTx.user_id) targetUserId = origTx.user_id;
    }

    const isCardPayment = transaction.type === 'card_payment';

    if (targetUserId && !isCardPayment) {
      const user = await User.findByPk(targetUserId, { transaction: t });
      if (user && (user.role === 'employer' || user.role === 'company' || isRegistration)) {
        user.status = 'active';
        user.is_verified = true;
        user.verified_at = user.verified_at || new Date();
        user.otp_verified = true;
        await user.save({ transaction: t });

        if (user.role === 'company') {
          const comp = await Company.findOne({ where: { user_id: user.id }, transaction: t });
          if (comp) {
            comp.verification_status = 'approved';

            // Calculate subscription period if paying subscription
            if (transaction.type === 'company_fee' || transaction.metadata?.purpose === 'subscription_fee') {
              const cycle = transaction.metadata?.cycle || comp.subscription_cycle || 'monthly';
              const days = transaction.metadata?.period_days || comp.subscription_period_days;
              const nextPaid = new Date();
              if (cycle === 'annual') {
                nextPaid.setFullYear(nextPaid.getFullYear() + 1);
              } else if (cycle === 'custom' && days) {
                nextPaid.setDate(nextPaid.getDate() + Number(days));
              } else {
                nextPaid.setMonth(nextPaid.getMonth() + 1);
              }
              comp.subscription_paid_until = nextPaid;
            }

            await comp.save({ transaction: t });
          }
        }
      }
    }

    // Company paid driver card fee via MTN MoMo -> unlock card generation for those workers
    if (isCardPayment && transaction.metadata?.purpose === 'company_card_generation') {
      const { Worker } = require('../models');
      const paidIds = Array.isArray(transaction.metadata.worker_ids) ? transaction.metadata.worker_ids : [];
      if (paidIds.length) {
        await Worker.update(
          { card_paid: true, card_paid_at: new Date() },
          { where: { id: paidIds }, transaction: t }
        );
      }
    }

    // Deposit to company wallet if applicable
    if (companyId && type === 'hiring_fee') {
      const company = await Company.findByPk(companyId, { transaction: t });
      if (company) {
        company.wallet_balance = parseFloat(company.wallet_balance || 0) + parseFloat(amount || transaction.amount);
        await company.save({ transaction: t });
      }
    }

    // When hiring fee is successfully confirmed by MTN MoMo:
    if (transaction.type === 'hiring_fee') {
      const meta = transaction.metadata || {};
      const workerId = meta.worker_id;
      const employerId = meta.employer_id;
      const selectedSlotIds = Array.isArray(meta.selected_slot_ids) ? meta.selected_slot_ids : [];

      if (workerId && employerId) {
        const { Worker, HiringRequest } = require('../models');
        const workerModel = await Worker.findByPk(workerId, { transaction: t });
        if (workerModel) {
          const ext = workerModel.extended_profile || {};
          const slots = Array.isArray(ext.availability_slots) ? ext.availability_slots : [];
          if (slots.length > 0 && selectedSlotIds.length > 0) {
            ext.availability_slots = slots.map(s => {
              if (selectedSlotIds.includes(String(s.id)) || selectedSlotIds.includes(String(s.day_index))) {
                return { ...s, is_booked: true, is_hired: true, employer_id: employerId };
              }
              return s;
            });
            const remaining = ext.availability_slots.filter(s => !(s.is_booked || s.is_hired || s.employer_id));
            if (remaining.length === 0) {
              workerModel.availability_status = 'hired';
            }
            workerModel.extended_profile = ext;
            workerModel.changed('extended_profile', true);
            await workerModel.save({ transaction: t });
          }
        }

        // Create or update accepted hiring request so employer sees worker in Not Yet Signed & can view contact
        const [hiringReq, created] = await HiringRequest.findOrCreate({
          where: { employer_id: employerId, worker_id: workerId },
          defaults: {
            employer_id: employerId,
            worker_id: workerId,
            offered_salary: transaction.amount || 25000,
            notes: `Confirmed via MTN MoMo PIN (Paid: ${transaction.amount} RWF, Ref: ${transaction.reference_id})`,
            status: 'accepted'
          },
          transaction: t
        }).catch(err => {
          console.error('HiringRequest error:', err);
          return [null, false];
        });

        if (hiringReq && !created && hiringReq.status === 'pending') {
          hiringReq.status = 'accepted';
          hiringReq.notes = `Confirmed via MTN MoMo PIN (Paid: ${transaction.amount} RWF, Ref: ${transaction.reference_id})`;
          await hiringReq.save({ transaction: t }).catch(() => {});
        }
      }
    }

    await t.commit();

    // Send telecom notification
    try {
      const { sendNotification } = require('./socketService');
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB');
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedAmount = Number(transaction.amount).toLocaleString();
      sendNotification({
        userId: transaction.user_id,
        title: 'Payment Confirmed via MTN MoMo',
        message: `Payment Received: You have transferred ${formattedAmount} RWF via MTN MoMo on ${dateStr} at ${timeStr}. Financial Transaction Id: ${transaction.reference_id}.`,
        type: 'payment_received',
        data: { referenceId: transaction.reference_id, amount: transaction.amount, type: transaction.type }
      }).catch(e => console.warn('Payment notification error:', e.message));
    } catch (e) {}

    return { success: true, transaction };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// 4. Check Status via MTN MoMo API
const checkPaymentStatus = async (referenceId) => {
  const transaction = await Transaction.findOne({ where: { reference_id: referenceId } });
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // If already successful, return immediately
  if (transaction.status === 'successful') {
    return {
      success: true,
      payment_status: 'SUCCESSFUL',
      status: 'successful',
      transaction
    };
  }

  // Poll MTN MoMo Collection status
  const mtnStatus = await mtnMomoService.getPaymentStatus(referenceId);

  if (mtnStatus.status === 'SUCCESSFUL') {
    await processFundMovement({
      referenceId,
      companyId: transaction.metadata?.company_id,
      amount: transaction.amount,
      type: transaction.type
    });
    transaction.status = 'successful';
    await transaction.save().catch(() => {});
  } else if (mtnStatus.status === 'FAILED') {
    transaction.status = 'failed';
    transaction.metadata = { ...transaction.metadata, reason: mtnStatus.reason };
    await transaction.save().catch(() => {});
  }

  return {
    success: true,
    payment_status: transaction.status === 'successful' ? 'SUCCESSFUL' : (transaction.status === 'failed' ? 'FAILED' : 'PENDING'),
    status: transaction.status,
    reason: mtnStatus.reason,
    transaction
  };
};

module.exports = {
  initiatePayment,
  initiatePayout,
  processFundMovement,
  checkPaymentStatus
};
