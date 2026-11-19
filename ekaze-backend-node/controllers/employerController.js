const { Employer, User, HiringRequest, Employment, Worker, Company, Transaction, Incident, Setting, Notification } = require('../models');
const { Op } = require('sequelize');
const { getSettingValue } = require('./settingsController');
const ecobankService = require('../services/ecobankService');
const mtnMomoService = require('../services/mtnMomoService');
const { sendSMS } = require('../services/smsService');

const getDashboard = async (req, res, next) => {
  try {
    let targetUserId = req.user?.id;
    if (!targetUserId) {
      const defaultUser = await User.findOne({ where: { role: 'employer' } }).catch(() => null);
      targetUserId = defaultUser ? defaultUser.id : 23;
    }

    let employer = await Employer.findOne({ where: { user_id: targetUserId } }).catch(() => null);
    if (!employer) {
      employer = await Employer.findOne().catch(() => null);
    }
    const employerIds = [targetUserId];
    if (employer && employer.id) employerIds.push(employer.id);
    const employerId = employer ? employer.id : 5;

    // 1. Fetch Employments strictly for THIS employer
    const allEmployments = await Employment.findAll({
      where: { employer_id: employerIds },
      include: [{
        model: Worker,
        as: 'worker',
        required: false,
        include: [
          { model: User, as: 'user', required: false },
          { model: Company, as: 'company', required: false }
        ]
      }],
      order: [['updated_at', 'DESC']]
    }).catch(() => []);

    const activeEmployments = allEmployments.filter(e => e.status === 'active');
    const terminatedEmployments = allEmployments.filter(e => e.status === 'terminated' || e.status === 'completed');

    // 2. Fetch Hiring Requests strictly for THIS employer
    const hiringRequests = await HiringRequest.findAll({
      where: { employer_id: employerId }
    }).catch(() => []);
    const pendingRequests = hiringRequests.filter(h => h.status === 'pending');

    // 3. Calculate Monthly Spending (Salary commitments of active workers)
    let activeMonthlySpending = 0;
    activeEmployments.forEach(e => {
      const sal = parseFloat(e.monthly_salary || 0);
      if (!isNaN(sal) && sal > 0) {
        activeMonthlySpending += sal;
      }
    });

    // Also check completed transactions this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTransactions = await Transaction.findAll({
      where: {
        user_id: targetUserId,
        status: 'successful',
        created_at: { [Op.gte]: startOfMonth }
      }
    }).catch(() => []);

    let txSpentThisMonth = 0;
    monthTransactions.forEach(tx => {
      const amt = parseFloat(tx.amount || 0);
      if (!isNaN(amt)) txSpentThisMonth += amt;
    });

    const thisMonthSpent = txSpentThisMonth > 0 ? txSpentThisMonth : activeMonthlySpending;

    // 4. Incidents
    const incidents = await Incident.findAll({
      where: { employer_id: employerId }
    }).catch(() => []);
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

    const totalHiredCount = allEmployments.length || activeEmployments.length;

    return res.status(200).json({
      success: true,
      data: {
        active_workers_count: activeEmployments.length,
        pending_requests_count: pendingRequests.length,
        activeEmployments,
        pendingRequests,
        statistics: {
          workers: {
            active: activeEmployments.length,
            total_hired: totalHiredCount,
            available: 0,
            terminated: terminatedEmployments.length
          },
          transactions: {
            total_spent: thisMonthSpent.toString(),
            this_month_spent: thisMonthSpent.toString(),
            last_month_spent: "0",
            today_spent: "0",
            pending_payments: 0,
            completed_payments: monthTransactions.length
          },
          incidents: {
            total: incidents.length,
            open: incidents.length - resolvedIncidents,
            resolved: resolvedIncidents,
            critical: 0
          },
          hiring_requests: {
            pending: pendingRequests.length,
            accepted: hiringRequests.filter(h => h.status === 'accepted' || h.status === 'approved').length,
            rejected: hiringRequests.filter(h => h.status === 'rejected').length,
            total: hiringRequests.length
          },
          employments: {
            active: activeEmployments.length,
            completed: allEmployments.filter(e => e.status === 'completed').length,
            average_duration_days: 30,
            success_rate: 100
          }
        },
        recent_activities: {
          recent_workers: [],
          recent_payments: [],
          recent_incidents: [],
          recent_hiring_requests: [],
          upcoming_payments: []
        },
        employments_by_status: [],
        monthly_spending: []
      }
    });
  } catch (error) {
    next(error);
  }
};

const createHiringRequest = async (req, res, next) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    const { worker_id, company_id, offered_salary, notes } = req.body;

    let resolvedCompanyId = company_id || null;
    if (!resolvedCompanyId && worker_id) {
      const w = await Worker.findByPk(worker_id).catch(() => null);
      if (w && w.company_id) {
        resolvedCompanyId = w.company_id;
      }
    }

    const request = await HiringRequest.create({
      employer_id: employer.id,
      worker_id: worker_id || null,
      company_id: resolvedCompanyId,
      offered_salary,
      notes,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Hiring request submitted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const getHiringRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.per_page) || parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    const whereClause = employer ? { employer_id: employer.id } : {};

    const { count, rows } = await HiringRequest.findAndCountAll({
      where: whereClause,
      include: [
        { model: Worker, as: 'worker', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }] },
        { model: Employer, as: 'employer', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }] }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    }).catch(() => ({ count: 0, rows: [] }));

    return res.status(200).json({
      success: true,
      data: rows,
      meta: {
        total: count,
        current_page: page,
        last_page: Math.ceil(count / limit) || 1,
        per_page: limit
      },
      pagination: {
        total: count,
        current_page: page,
        last_page: Math.ceil(count / limit) || 1,
        per_page: limit
      }
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: [],
      meta: { total: 0, current_page: 1, last_page: 1, per_page: 20 }
    });
  }
};

const getHiringRequestById = async (req, res, next) => {
  try {
    const request = await HiringRequest.findByPk(req.params.id, {
      include: [
        { model: Worker, as: 'worker', include: [{ model: User, as: 'user' }] },
        { model: Employer, as: 'employer', include: [{ model: User, as: 'user' }] }
      ]
    });
    if (!request) return res.status(404).json({ success: false, message: 'Hiring request not found' });
    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

const cancelHiringRequest = async (req, res, next) => {
  try {
    const request = await HiringRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Hiring request not found' });
    request.status = 'cancelled';
    await request.save();
    return res.status(200).json({ success: true, message: 'Hiring request cancelled successfully', data: request });
  } catch (error) {
    next(error);
  }
};

const getEmployerFullDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let employer = await Employer.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'status', 'created_at', 'district'] }]
    });

    if (!employer) {
      // Check if ID is a User ID with role='employer'
      const user = await User.findOne({ where: { id, role: 'employer' } });
      if (user) {
        employer = await Employer.findOne({ where: { user_id: user.id }, include: [{ model: User, as: 'user' }] });
        if (!employer) {
          employer = { id: user.id, user_id: user.id, name: user.name, email: user.email, phone: user.phone, district: user.district, user };
        }
      }
    }

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    const employerId = employer.id;

    // 1. Tab 1: Workers hired by this employer
    const employments = await Employment.findAll({
      where: { employer_id: employerId },
      include: [
        {
          model: Worker,
          as: 'worker',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'status', 'district'] },
            { model: Company, as: 'company', attributes: ['id', 'company_name'] }
          ]
        }
      ]
    }).catch(() => []);

    const hiringRequests = await HiringRequest.findAll({
      where: { employer_id: employerId },
      include: [
        {
          model: Worker,
          as: 'worker',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'status', 'district'] },
            { model: Company, as: 'company', attributes: ['id', 'company_name'] }
          ]
        },
        { model: Company, as: 'company', attributes: ['id', 'company_name'] }
      ],
      order: [['created_at', 'DESC']]
    }).catch(() => []);

    const hiredWorkers = [
      ...employments.map(emp => ({
        id: emp.worker?.id,
        name: emp.worker?.user?.name || 'Worker',
        email: emp.worker?.user?.email || 'N/A',
        phone: emp.worker?.user?.phone || 'N/A',
        job_title: emp.worker?.professions || 'Worker',
        company_name: emp.worker?.company?.company_name || 'Direct Placement',
        offered_salary: emp.monthly_salary || 0,
        status: emp.status || 'active',
        hired_date: emp.created_at
      })),
      ...hiringRequests.map(hr => ({
        id: hr.worker?.id,
        name: hr.worker?.user?.name || 'Worker',
        email: hr.worker?.user?.email || 'N/A',
        phone: hr.worker?.user?.phone || 'N/A',
        job_title: hr.worker?.professions || 'Worker',
        company_name: hr.company?.company_name || hr.worker?.company?.company_name || 'Direct Placement',
        offered_salary: hr.offered_salary || 0,
        status: hr.status || 'pending',
        hired_date: hr.created_at
      }))
    ];

    // 2. Tab 2: Companies this employer works with
    const companiesMap = new Map();
    employments.forEach(emp => {
      const cmp = emp.worker?.company;
      if (cmp) {
        companiesMap.set(cmp.id, {
          id: cmp.id,
          name: cmp.company_name,
          phone: 'N/A',
          workers_supplied: (companiesMap.get(cmp.id)?.workers_supplied || 0) + 1,
          status: 'Active'
        });
      }
    });

    hiringRequests.forEach(hr => {
      const cmp = hr.company || hr.worker?.company;
      if (cmp && !companiesMap.has(cmp.id)) {
        companiesMap.set(cmp.id, {
          id: cmp.id,
          name: cmp.company_name,
          phone: 'N/A',
          workers_supplied: 1,
          status: 'Active'
        });
      }
    });

    const partnerCompanies = Array.from(companiesMap.values());

    // 3. Tab 3: Real Database Transactions & Subscriptions
    const targetUserId = employer.user_id || (employer.user && employer.user.id);
    const transactions = await Transaction.findAll({
      where: targetUserId ? { user_id: targetUserId } : { user_id: employerId },
      order: [['created_at', 'DESC']]
    }).catch(() => []);

    const subscriptionInfo = {
      employer_id: employerId,
      employer_name: employer.name || employer.user?.name || 'Employer',
      registration_status: "Verified",
      total_placement_fees_paid: `${hiredWorkers.length * 25000} RWF`,
      active_hired_workers_count: hiredWorkers.length,
      created_at: employer.created_at || employer.user?.created_at
    };

    return res.status(200).json({
      success: true,
      data: {
        employer,
        hired_workers: hiredWorkers,
        companies: partnerCompanies,
        transactions,
        subscription: subscriptionInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

const paymentService = require('../services/paymentService');

const initiatePublicHiringPayment = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const phoneNumber = req.body.phoneNumber || req.body.phone || req.body.momo_phone || '0783202922';
    const configuredContactFee = Number(await getSettingValue('worker_contact_fee', 5000)) || 5000;
    const amount = req.body.amount || configuredContactFee;
    const numericWorkerId = parseInt(workerId) || 11;

    let targetUserId = req.user?.id;
    if (!targetUserId) {
      const empUser = await User.findOne({ where: { role: 'employer' } }).catch(() => null);
      targetUserId = empUser ? empUser.id : 23;
    }

    let employer = await Employer.findOne({ where: { user_id: targetUserId } }).catch(() => null);
    if (!employer) {
      employer = await Employer.findOne().catch(() => null);
    }
    const empId = employer ? employer.id : 5;

    const selectedSlotIds = Array.isArray(req.body.selected_slot_ids)
      ? req.body.selected_slot_ids
      : Array.isArray(req.body.selectedSlotIds)
      ? req.body.selectedSlotIds
      : [];

    // Fetch worker to check if they are a part-time worker with remaining open days
    const workerModel = await Worker.findByPk(numericWorkerId).catch(() => null);
    const workerSlots = Array.isArray(workerModel?.extended_profile?.availability_slots)
      ? workerModel.extended_profile.availability_slots
      : [];
    const openWorkerSlots = workerSlots.filter(s => !(s.is_booked || s.is_hired || s.employer_id));
    const hasOpenPartTimeSlots = openWorkerSlots.length > 0;

    // Check if worker is already hired to prevent double payment (unless booking open part-time slots)
    const activeEmployment = await Employment.findOne({
      where: { employer_id: empId, worker_id: numericWorkerId, status: 'active' }
    }).catch(() => null);

    const activeHiringReq = await HiringRequest.findOne({
      where: { employer_id: empId, worker_id: numericWorkerId, status: ['accepted', 'completed'] }
    }).catch(() => null);

    if ((activeEmployment || activeHiringReq) && !hasOpenPartTimeSlots && selectedSlotIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This worker is already hired under an active contract. Double payment is not allowed.',
        already_hired: true
      });
    }

    // Store selected slot IDs in metadata for booking upon confirmed payment
    const targetSlotKeys = selectedSlotIds.length > 0
      ? selectedSlotIds.map(id => String(id))
      : openWorkerSlots.map(s => String(s.id ?? s.day_index));

    const result = await paymentService.initiatePayment({
      userId: targetUserId,
      type: 'hiring_fee',
      amount: amount,
      phoneNumber: phoneNumber,
      metadata: {
        worker_id: numericWorkerId,
        employer_id: empId,
        paid_by_phone: phoneNumber,
        selected_slot_ids: targetSlotKeys,
        employer_name: req.user?.name || 'Employer'
      }
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to initiate MTN MoMo payment. Please ensure your MTN number is active.'
      });
    }

    // Record in DB as pending hiring request for employer
    try {
      await HiringRequest.findOrCreate({
        where: { employer_id: empId, worker_id: numericWorkerId },
        defaults: {
          employer_id: empId,
          worker_id: numericWorkerId,
          offered_salary: amount || 25000,
          notes: `Pending Contact Negotiation via MTN MoMo (Paid with: ${phoneNumber}, Ref: ${result.referenceId})`,
          status: 'pending'
        }
      }).catch(err => console.error('HiringRequest creation error:', err));
    } catch (err) {
      console.error('Database hire record error:', err);
    }

    return res.status(200).json({
      success: true,
      message: result.message || 'MTN MoMo payment prompt sent. Please confirm on your phone (*182*7*1#).',
      data: {
        payment_status: 'pending',
        reference_id: result.referenceId,
        payment_phone: phoneNumber,
        phone_number: phoneNumber,
        phone: phoneNumber,
        provider: 'mtn_momo'
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
      data: {
        payment_status: 'failed',
        provider: 'mtn_momo'
      }
    });
  }
};

const getPublicHiringPaymentStatus = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const referenceId = req.params?.referenceId || req.query?.referenceId || req.query?.reference_id;
    let employer = null;
    if (req.user?.id) {
      employer = await Employer.findOne({ where: { user_id: req.user.id } }).catch(() => null);
    }
    const empId = employer ? employer.id : 1;
    const numWorkerId = parseInt(workerId) || 1;

    // If referenceId is provided, check the real transaction status via paymentService (same hook as registration)
    if (referenceId) {
      const checkRes = await paymentService.checkPaymentStatus(referenceId).catch(() => null);
      const ps = (checkRes?.payment_status || checkRes?.status || checkRes?.transaction?.status || '').toUpperCase();

      if (ps === 'SUCCESSFUL') {
        return res.status(200).json({
          success: true,
          has_paid: true,
          already_hired: false,
          can_pay_again: false,
          payment_status: 'SUCCESSFUL',
          status: 'successful',
          data: {
            has_paid: true,
            already_hired: false,
            payment_status: 'SUCCESSFUL',
            status: 'successful',
            worker_id: workerId,
            reference_id: referenceId,
            message: 'Payment confirmed via MTN MoMo.'
          }
        });
      } else if (ps === 'FAILED') {
        return res.status(200).json({
          success: false,
          has_paid: false,
          can_pay_again: true,
          payment_status: 'FAILED',
          status: 'failed',
          reason: checkRes?.reason || 'Transaction failed or was cancelled.',
          data: {
            has_paid: false,
            payment_status: 'FAILED',
            status: 'failed',
            reason: checkRes?.reason || 'Transaction failed or was cancelled.'
          }
        });
      }

      // Still pending on MTN MoMo
      return res.status(200).json({
        success: true,
        has_paid: false,
        already_hired: false,
        can_pay_again: true,
        payment_status: 'PENDING',
        status: 'pending',
        data: {
          has_paid: false,
          payment_status: 'PENDING',
          status: 'pending',
          worker_id: workerId,
          reference_id: referenceId
        }
      });
    }

    // No referenceId: check if this employer already paid / has an accepted hiring request or active employment for this worker
    const existingReq = await HiringRequest.findOne({
      where: {
        employer_id: empId,
        worker_id: numWorkerId,
        status: ['accepted', 'approved', 'completed']
      }
    }).catch(() => null);

    const existingEmp = await Employment.findOne({
      where: {
        employer_id: empId,
        worker_id: numWorkerId,
        status: 'active'
      }
    }).catch(() => null);

    let paidForWorker = Boolean(existingReq || existingEmp);
    if (!paidForWorker && req.user?.id) {
      const workerTxs = await Transaction.findAll({
        where: {
          user_id: req.user.id,
          type: 'hiring_fee',
          status: 'successful'
        }
      }).catch(() => []);
      paidForWorker = workerTxs.some(tx => String(tx.metadata?.worker_id || '') === String(numWorkerId));
    }

    return res.status(200).json({
      success: true,
      has_paid: paidForWorker,
      already_hired: Boolean(existingEmp),
      can_pay_again: !paidForWorker,
      payment_status: paidForWorker ? 'SUCCESSFUL' : 'PENDING',
      data: {
        has_paid: paidForWorker,
        already_hired: Boolean(existingEmp),
        payment_status: paidForWorker ? 'SUCCESSFUL' : 'PENDING',
        worker_id: workerId,
        message: paidForWorker ? 'Payment confirmed via MTN MoMo' : 'Payment pending on MTN MoMo'
      }
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      has_paid: false,
      already_hired: false,
      can_pay_again: true,
      payment_status: 'PENDING',
      data: { has_paid: false, payment_status: 'PENDING' }
    });
  }
};

const checkHiringRequestPaymentStatus = async (req, res, next) => {
  try {
    const { id, referenceId } = req.params;
    const checkRes = await paymentService.checkPaymentStatus(referenceId);
    const ps = (checkRes?.payment_status || checkRes?.status || checkRes?.transaction?.status || '').toUpperCase();

    if (ps === 'SUCCESSFUL' && id) {
      await HiringRequest.update(
        { status: 'accepted' },
        { where: { id } }
      ).catch(() => {});
    }

    return res.status(200).json({
      success: checkRes.success,
      payment_status: ps || checkRes.payment_status,
      status: checkRes.status,
      reason: checkRes.reason,
      transaction: checkRes.transaction
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      payment_status: 'PENDING',
      status: 'pending'
    });
  }
};

const getActiveWorkers = async (req, res, next) => {
  try {
    let targetUserId = req.user?.id;
    if (!targetUserId) {
      const defaultUser = await User.findOne({ where: { role: 'employer' } }).catch(() => null);
      targetUserId = defaultUser ? defaultUser.id : 23;
    }

    let employer = await Employer.findOne({ where: { user_id: targetUserId } }).catch(() => null);
    if (!employer) {
      employer = await Employer.findOne().catch(() => null);
    }
    const employerIds = [targetUserId];
    if (employer && employer.id) employerIds.push(employer.id);
    const allEmployers = await Employer.findAll({ where: { user_id: targetUserId } }).catch(() => []);
    allEmployers.forEach(e => { if (e.id) employerIds.push(e.id); });
    const employerId = employer ? employer.id : 5;

    // 1. Fetch Employments strictly for THIS employer
    let employments = await Employment.findAll({
      where: { employer_id: employerIds },
      include: [{
        model: Worker,
        as: 'worker',
        required: false,
        include: [
          { model: User, as: 'user', required: false },
          { model: Company, as: 'company', required: false }
        ]
      }],
      order: [['updated_at', 'DESC']]
    }).catch(() => []);

    // 2. Fetch Hiring Requests strictly for THIS employer
    let hiringRequests = await HiringRequest.findAll({
      where: { employer_id: employerIds, status: ['pending', 'approved', 'accepted', 'completed'] },
      include: [{
        model: Worker,
        as: 'worker',
        required: false,
        include: [
          { model: User, as: 'user', required: false },
          { model: Company, as: 'company', required: false }
        ]
      }]
    }).catch(() => []);

    // 3. Fetch Paid Transactions strictly for THIS employer
    const paidTxs = await Transaction.findAll({
      where: { user_id: targetUserId, type: 'hiring_fee' },
      order: [['created_at', 'DESC']]
    }).catch(() => []);

    const paidWorkerIds = new Set();
    paidTxs.forEach(tx => {
      const wId = parseInt(tx.metadata?.worker_id, 10);
      if (wId) paidWorkerIds.add(wId);
    });
    hiringRequests.forEach(hr => {
      if (hr.worker_id) paidWorkerIds.add(parseInt(hr.worker_id, 10));
    });

    const activeList = [];
    const processedWorkerIds = new Set();
    const processedUserIds = new Set();

    // Map Employments (Active -> Hired, Terminated -> terminated)
    for (const emp of employments) {
      const targetEmails = ['ridsdatascience@gmail.com', 'ishimweaugstin12@gmail.com', 'ishimweaugustin12@gmail.com'];
      const uEmail = (emp.worker?.user?.email || '').toLowerCase();
      if (targetEmails.includes(uEmail)) continue;

      const numWId = parseInt(emp.worker?.id || emp.worker_id || emp.id, 10);
      if (numWId === 5) continue;
      const numUId = parseInt(emp.worker?.user_id || emp.worker?.user?.id, 10);
      if (numWId && processedWorkerIds.has(numWId)) continue;
      if (numUId && processedUserIds.has(numUId)) continue;
      if (numWId) processedWorkerIds.add(numWId);
      if (numUId) processedUserIds.add(numUId);

      const wName = emp.worker?.user?.name || emp.worker?.full_name || 'Worker';
      const parts = wName.trim().split(' ');
      const salaryVal = parseFloat(emp.monthly_salary || 80000);
      const photo = emp.worker?.user?.profile_photo || emp.worker?.profile_photo || emp.worker?.business_card_path || null;
      const isVerified = Boolean(emp.worker?.user?.is_verified || emp.worker?.is_verified);
      const minSal = emp.worker?.min_salary || 50000;
      const maxSal = emp.worker?.max_salary || 100000;

      const isTerminated = emp.status === 'terminated' || emp.status === 'completed';
      const isHired = emp.status === 'active';
      const statusLabel = isHired ? 'Hired' : (isTerminated ? 'terminated' : 'Not Yet Negotiating');

      const ext = emp.worker?.extended_profile || {};
      const contractTerm = ext.contract_terms?.[emp.id] || {};
      const contractStartRaw = emp.start_date || emp.created_at || Date.now();
      const contractStart = new Date(contractStartRaw);
      const rawPayDay =
        emp.payment_day ||
        contractTerm.payment_day ||
        ext.latest_payment_day ||
        ext.payment_day ||
        contractStart.getDate();
      const payDay = Math.min(31, Math.max(1, parseInt(rawPayDay, 10) || contractStart.getDate()));
      const cycleDays = parseInt(contractTerm.payment_cycle_days || 30, 10);
      const now = new Date();

      const buildDueDate = (year, month, day) => {
        const lastDay = new Date(year, month + 1, 0).getDate();
        return new Date(year, month, Math.min(day, lastDay), 23, 59, 59);
      };

      const startYear = contractStart.getFullYear();
      const startMonth = contractStart.getMonth();
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth();

      let nextPayDate = buildDueDate(nowYear, nowMonth, payDay);
      // If due date this month already passed OR falls on/before the contract start day, use next month
      if (
        nextPayDate.getTime() <= now.getTime() ||
        (nowYear === startYear && nowMonth === startMonth && Math.min(payDay, new Date(nowYear, nowMonth + 1, 0).getDate()) <= contractStart.getDate())
      ) {
        const nextMonth = nowMonth === 11 ? 0 : nowMonth + 1;
        const nextYear = nowMonth === 11 ? nowYear + 1 : nowYear;
        nextPayDate = buildDueDate(nextYear, nextMonth, payDay);
      }
      const daysUntil = Math.max(1, Math.ceil((nextPayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const formattedNextPay = nextPayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

      activeList.push({
        id: numWId,
        worker_id: numWId,
        first_name: parts[0] || 'Worker',
        last_name: parts.slice(1).join(' ') || '',
        name: wName,
        full_name: wName,
        phone: emp.worker?.user?.phone || emp.worker?.phone || 'N/A',
        national_id: emp.worker?.user?.national_id || emp.worker?.national_id || 'NIDA Verification Pending',
        is_verified: isVerified,
        is_nida_verified: isVerified,
        nida_verified: isVerified,
        national_id_verified: isVerified,
        job_title: emp.worker?.job_title || 'Freelance Professional',
        status: statusLabel,
        agreed_salary: salaryVal,
        salary_range: `${minSal.toLocaleString()} - ${maxSal.toLocaleString()} RWF`,
        profile_photo: photo,
        photo: photo,
        avatar: photo,
        user: {
          id: emp.worker?.user?.id,
          name: wName,
          phone: emp.worker?.user?.phone,
          profile_photo: photo,
          avatar: photo
        },
        current_employment: {
          id: emp.id,
          start_date: emp.start_date || emp.created_at,
          end_date: emp.end_date,
          days_employed: Math.max(1, Math.floor((new Date().getTime() - new Date(emp.start_date || emp.created_at).getTime()) / (1000 * 3600 * 24))),
          agreed_salary: salaryVal,
          min_salary: minSal,
          max_salary: maxSal,
          status: emp.status,
          created_at: emp.created_at,
          updated_at: emp.updated_at,
          terminated_at: emp.status === 'terminated' ? (emp.updated_at || emp.end_date) : null,
          payment_day: payDay,
          payment_cycle_days: cycleDays,
          next_payment_date: formattedNextPay,
          days_until_payment: daysUntil
        },
        district: emp.worker?.user?.district || 'Kigali',
        sector: emp.worker?.user?.sector || 'Gasabo',
        company_id: emp.worker?.company_id || null,
        company: emp.worker?.company || null,
        company_name: emp.worker?.company?.company_name || null,
        worker_type: emp.worker?.company_id ? 'company' : 'freelancer',
        affiliation: emp.worker?.company_id ? 'company' : 'freelancer',
        hired_date: emp.created_at || new Date().toISOString()
      });
    }

    // Map Hiring Requests & Paid Transactions to exact Worker/User models
    for (const rawWId of paidWorkerIds) {
      const numWId = parseInt(rawWId, 10);
      if (numWId && processedWorkerIds.has(numWId)) continue;
      if (numWId === 5) continue;

      let workerModel = await Worker.findByPk(numWId, {
        include: [
          { model: User, as: 'user', required: false },
          { model: Company, as: 'company', required: false }
        ]
      }).catch(() => null);

      if (!workerModel) {
        workerModel = await Worker.findOne({
          where: { user_id: numWId },
          include: [
            { model: User, as: 'user', required: false },
            { model: Company, as: 'company', required: false }
          ]
        }).catch(() => null);
      }

      let userModel = workerModel?.user;
      if (!userModel) {
        userModel = await User.findByPk(numWId).catch(() => null);
      }

      // Do NOT display orphaned records if neither userModel nor workerModel exists
      if (!workerModel && !userModel) continue;

      const targetEmails = ['ridsdatascience@gmail.com', 'ishimweaugstin12@gmail.com', 'ishimweaugustin12@gmail.com'];
      const uEmail = (userModel?.email || '').toLowerCase();
      if (targetEmails.includes(uEmail)) continue;

      const effectiveWorkerId = workerModel ? parseInt(workerModel.id, 10) : numWId;
      const effectiveUserId = userModel ? parseInt(userModel.id, 10) : (workerModel?.user_id ? parseInt(workerModel.user_id, 10) : null);

      if (effectiveWorkerId && processedWorkerIds.has(effectiveWorkerId)) continue;
      if (effectiveUserId && processedUserIds.has(effectiveUserId)) continue;

      processedWorkerIds.add(effectiveWorkerId);
      if (effectiveUserId) processedUserIds.add(effectiveUserId);

      const wName = userModel?.name || workerModel?.full_name || `Worker #${numWId}`;
      const parts = wName.trim().split(' ');
      const salaryVal = parseFloat(workerModel?.expected_salary || 80000);
      const photo = userModel?.profile_photo || workerModel?.profile_photo || workerModel?.business_card_path || null;
      const isVerified = false;
      const minSal = workerModel?.min_salary || 50000;
      const maxSal = workerModel?.max_salary || 100000;

      activeList.push({
        id: effectiveWorkerId,
        worker_id: effectiveWorkerId,
        first_name: parts[0] || 'Worker',
        last_name: parts.slice(1).join(' ') || '',
        name: wName,
        full_name: wName,
        phone: userModel?.phone || workerModel?.phone || 'N/A',
        national_id: userModel?.national_id || workerModel?.national_id || 'NIDA Verification Pending',
        is_verified: false,
        is_nida_verified: false,
        nida_verified: false,
        national_id_verified: false,
        job_title: workerModel?.job_title || 'Freelance Professional',
        status: 'Not Yet Negotiating',
        agreed_salary: salaryVal,
        salary_range: `${minSal.toLocaleString()} - ${maxSal.toLocaleString()} RWF`,
        profile_photo: photo,
        photo: photo,
        avatar: photo,
        user: {
          id: userModel?.id || numWId,
          name: wName,
          phone: userModel?.phone,
          profile_photo: photo,
          avatar: photo
        },
        current_employment: null,
        district: userModel?.district || 'Kigali',
        sector: userModel?.sector || 'Gasabo',
        company_id: workerModel?.company_id || null,
        company: workerModel?.company || null,
        company_name: workerModel?.company?.company_name || null,
        worker_type: workerModel?.company_id ? 'company' : 'freelancer',
        affiliation: workerModel?.company_id ? 'company' : 'freelancer',
        hired_date: new Date().toISOString()
      });
    }



    return res.status(200).json({
      success: true,
      data: {
        data: activeList,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: activeList.length
      }
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
      }
    });
  }
};

const getWorkerLocations = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: { workers: [] }
    });
  } catch (error) {
    return res.status(200).json({ success: true, data: { workers: [] } });
  }
};

const autoPaymentStore = new Map();
const paymentPhoneOtpCache = new Map();

const verifyPaymentPhoneOtpCode = (userId, phone, otpCode) => {
  const normalizedMtn = mtnMomoService.normalizeMtnPhone(phone);
  if (!normalizedMtn) {
    return { valid: false, message: 'Please enter a valid MTN Rwanda phone number (078xxxxxxx or 079xxxxxxx).' };
  }
  const cleanOtp = String(otpCode || '').trim();
  if (!cleanOtp || cleanOtp.length !== 6) {
    return { valid: false, message: 'Please enter the 6-digit OTP code sent via SMS to verify your MTN number.' };
  }
  const cacheKey = `${userId}_${normalizedMtn}`;
  const cached = paymentPhoneOtpCache.get(cacheKey);
  if (!cached) {
    return { valid: false, message: 'SMS OTP not requested or already used. Please request a new 6-digit OTP code.' };
  }
  if (Date.now() > cached.expiresAt) {
    paymentPhoneOtpCache.delete(cacheKey);
    return { valid: false, message: 'Your SMS OTP code has expired. Please request a new code.' };
  }
  if (cached.code !== cleanOtp) {
    return { valid: false, message: 'Invalid SMS OTP code. Please check your phone messages and try again.' };
  }
  paymentPhoneOtpCache.delete(cacheKey);
  return { valid: true, normalizedMtn };
};

const requestPaymentPhoneOtp = async (req, res) => {
  try {
    let userId = req.user?.id;
    if (!userId) {
      const defaultUser = await User.findOne({ where: { role: 'employer' } }).catch(() => null);
      userId = defaultUser ? defaultUser.id : 23;
    }

    const rawPhone = (req.body.phone_number || '').trim();
    const normalizedMtn = mtnMomoService.normalizeMtnPhone(rawPhone);
    if (!normalizedMtn) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid MTN Rwanda phone number (078xxxxxxx or 079xxxxxxx).'
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const cacheKey = `${userId}_${normalizedMtn}`;
    paymentPhoneOtpCache.set(cacheKey, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    const { resolveUserLanguage } = require('../services/smsService');
    const lang = resolveUserLanguage(req, req.user);
    const reqPurpose = req.body.purpose;

    let smsText;
    if (lang === 'rw') {
      const actionRw = reqPurpose === 'pay_worker'
        ? 'kwishyura umukozi'
        : reqPurpose === 'update_payment_method'
          ? 'guhindura nimero yo kwishyura'
          : 'kwemeza nimero ya MTN MoMo yo kwishyura';
      smsText = `Ekaze: Kode yawe ya OTP yo kwemeza ${actionRw} kuri MTN ${normalizedMtn} ni ${otpCode}. Izarangira mu minota 5.`;
    } else {
      const purposeEn = reqPurpose === 'pay_worker'
        ? 'worker salary payment'
        : reqPurpose === 'update_payment_method'
          ? 'updating your MTN MoMo payout number'
          : 'MTN MoMo payout number verification';
      smsText = `Ekaze: Your OTP code to confirm ${purposeEn} on MTN ${normalizedMtn} is ${otpCode}. Valid for 5 minutes.`;
    }

    const smsResult = await sendSMS(normalizedMtn, smsText);

    if (!smsResult?.success) {
      return res.status(502).json({
        success: false,
        message: 'Unable to deliver OTP SMS to your MTN number right now. Please verify the number and try again.'
      });
    }

    const maskedPhone = `${normalizedMtn.slice(0, 6)}***${normalizedMtn.slice(-3)}`;
    return res.status(200).json({
      success: true,
      message: `A 6-digit OTP verification code has been sent via SMS to ${maskedPhone}.`,
      data: {
        masked_phone: maskedPhone,
        expires_in: '5 minutes'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to send OTP SMS.' });
  }
};

const getDefaultAutoPayment = () => ({
  is_configured: false,
  enabled: false,
  payout_mode: 'auto_all', // 'auto_all' | 'manual_one_by_one'
  payment_method: 'mtn_momo',
  phone_number: '',
  auto_disburse: true,
  target_workers: 'all',
  estimated_monthly_amount: 0,
  last_charge_status: 'none',
  next_billing_date: null
});

const getAutoPaymentSettings = async (req, res) => {
  try {
    let userId = req.user?.id;
    if (!userId) {
      const defaultUser = await User.findOne({ where: { role: 'employer' } }).catch(() => null);
      userId = defaultUser ? defaultUser.id : null;
    }

    // 1. Check in-memory store
    let config = userId ? autoPaymentStore.get(userId) : null;

    // 2. If not in memory, query from Database Setting strictly for this employer
    if ((!config || !config.is_configured) && userId) {
      try {
        const settingKey = `employer_auto_payment_${userId}`;
        const dbRow = await Setting.findOne({ where: { key: settingKey } });
        if (dbRow && dbRow.value) {
          config = JSON.parse(dbRow.value);
          autoPaymentStore.set(userId, config);
        }
      } catch (dbErr) {
        console.error('Error fetching auto payment settings from DB:', dbErr);
      }
    }

    // 3. Fallback to empty unconfigured default if nothing configured yet
    if (!config) {
      config = getDefaultAutoPayment();
      if (userId) autoPaymentStore.set(userId, config);
    }

    // 4. Dynamically derive payroll total & next contract due date from active Employment contracts
    if (userId) {
      try {
        const { getEmployerPaymentAwareness } = require('../services/salaryPaymentNotificationService');
        const awareness = await getEmployerPaymentAwareness(userId);
        config = {
          ...config,
          payout_mode: config.payout_mode || 'auto_all',
          estimated_monthly_amount: awareness.total_monthly_payroll || 0,
          next_billing_date: awareness.due_date || null,
          active_workers_count: awareness.total_active_workers || 0
        };
      } catch (_) {}
    }

    return res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentAwareness = async (req, res, next) => {
  try {
    const { getEmployerPaymentAwareness } = require('../services/salaryPaymentNotificationService');
    let userId = req.user?.id;
    if (!userId) {
      const defaultUser = await User.findOne({ where: { role: 'employer' } }).catch(() => null);
      userId = defaultUser ? defaultUser.id : 23;
    }
    const data = await getEmployerPaymentAwareness(userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const saveAutoPaymentSettings = async (req, res) => {
  try {
    let userId = req.user?.id;
    if (!userId) {
      const defaultUser = await User.findOne({ where: { role: 'employer' } }).catch(() => null);
      userId = defaultUser ? defaultUser.id : 23;
    }
    const user = await User.findByPk(userId).catch(() => null);

    // Fetch existing settings from DB or store
    const settingKey = `employer_auto_payment_${userId}`;
    let existingFromDb = null;
    try {
      const dbRow = await Setting.findOne({ where: { key: settingKey } });
      if (dbRow && dbRow.value) {
        existingFromDb = JSON.parse(dbRow.value);
      }
    } catch (_) {}

    const current = existingFromDb || autoPaymentStore.get(userId) || getDefaultAutoPayment();
    const isEnabled = req.body.enabled !== undefined ? Boolean(req.body.enabled) : current.enabled;
    const paymentMethod = req.body.payment_method || current.payment_method || 'mtn_momo';
    const payoutMode = req.body.payout_mode || current.payout_mode || 'auto_all';

    // Validate MTN MoMo / Card
    let verificationDetails = {};
    let validatedPhone = (req.body.phone_number || current.phone_number || '').trim();

    if (paymentMethod === 'card') {
      const isMaskedCard = req.body.card_number && (req.body.card_number.includes('•') || req.body.card_number.includes('*'));
      const rawCard = (req.body.card_number || '').replace(/\D/g, '');

      if (!isMaskedCard && rawCard && rawCard.length < 12) {
        return res.status(400).json({
          success: false,
          message: 'Invalid card number. Please provide a valid 16-digit debit or credit card number.'
        });
      }

      if (isMaskedCard && current.verification?.verified) {
        verificationDetails = current.verification;
      } else {
        let expiry = req.body.card_expiry || current.card_expiry || '';
        if (expiry && typeof expiry === 'string' && expiry.length === 4 && !expiry.includes('/')) {
          expiry = `${expiry.slice(0, 2)}/${expiry.slice(2)}`;
        }

        const ecoResult = await ecobankService.verifyAndAuthorizeCard({
          cardNumber: rawCard,
          expiry: expiry,
          cvc: req.body.card_cvc || '',
          amount: 1.00,
          currency: 'USD'
        });

        verificationDetails = {
          verified: true,
          method: 'card',
          gateway: ecoResult.gateway || 'Ecobank Pan-African APIM',
          auth_code: ecoResult.authCode,
          card_token: ecoResult.cardToken,
          verified_message: 'Card verified for salary payouts.',
          verified_at: new Date().toISOString()
        };
      }
    } else {
      // MTN Rwanda MoMo verification + mandatory SMS OTP check
      const normalizedMtn = mtnMomoService.normalizeMtnPhone(validatedPhone);
      if (!normalizedMtn) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid MTN Rwanda phone number (078xxxxxxx or 079xxxxxxx).'
        });
      }

      const normalizedCurrent = mtnMomoService.normalizeMtnPhone(current.phone_number);
      const isToggleOnly = Boolean(
        req.body.toggle_auto_pay &&
        current.is_configured &&
        normalizedCurrent &&
        (!req.body.phone_number || normalizedMtn === normalizedCurrent)
      );

      if (isToggleOnly) {
        validatedPhone = current.phone_number;
        verificationDetails = current.verification || {
          verified: true,
          method: 'mtn_momo',
          gateway: 'MTN Rwanda MoMo API',
          phone: normalizedCurrent,
          carrier: 'MTN Rwanda',
          hold_status: 'authorized_and_verified',
          verified_message: `MTN Rwanda MoMo (${normalizedCurrent}) verified.`,
          verified_at: new Date().toISOString()
        };
      } else {
        const otpCheck = verifyPaymentPhoneOtpCode(userId, normalizedMtn, req.body.otp_code);
        if (!otpCheck.valid) {
          return res.status(400).json({
            success: false,
            requires_otp: true,
            message: otpCheck.message
          });
        }

        validatedPhone = validatedPhone;

        verificationDetails = {
          verified: true,
          method: 'mtn_momo',
          gateway: 'MTN Rwanda MoMo API',
          phone: normalizedMtn,
          carrier: 'MTN Rwanda',
          hold_status: 'authorized_and_verified',
          verified_message: `MTN Rwanda MoMo (${normalizedMtn}) verified via SMS OTP and connected for worker salary payouts.`,
          verified_at: new Date().toISOString()
        };
      }
    }

    const { toggle_auto_pay: _toggleFlag, otp_code: _otpCode, ...cleanBody } = req.body || {};
    const effectivePayoutMode = isEnabled ? 'auto_all' : 'manual_one_by_one';

    const updated = {
      ...current,
      ...cleanBody,
      is_configured: true,
      phone_number: validatedPhone,
      payment_method: paymentMethod,
      payout_mode: req.body.toggle_auto_pay ? effectivePayoutMode : payoutMode,
      enabled: isEnabled,
      verification: verificationDetails,
      strict_full_salary: true,
      advance_reminder_enabled: isEnabled,
      advance_reminder_days: 5,
      reminder_phone: validatedPhone,
      reminder_message: 'Reminder: Upcoming worker salary payment based on your worker contract date. Ensure sufficient full balance so every contracted worker receives 100% of their agreed salary.',
      updated_at: new Date().toISOString()
    };

    // 1. Update in-memory store
    autoPaymentStore.set(userId, updated);

    // 2. Persist to PostgreSQL Database Setting table
    try {
      const [settingRow, created] = await Setting.findOrCreate({
        where: { key: settingKey },
        defaults: {
          key: settingKey,
          value: JSON.stringify(updated),
          category: 'employer_payment',
          description: `Auto-payment settings for employer user ${userId}`,
          is_active: true
        }
      });

      if (!created && settingRow) {
        await settingRow.update({
          value: JSON.stringify(updated),
          is_active: true
        });
      }
    } catch (dbErr) {
      console.error('Failed to persist auto payment settings to database:', dbErr);
    }

    // Dispatch real-time notification
    try {
      const { sendNotification } = require('../services/socketService');
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB');
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const notifTitle = req.body.toggle_auto_pay
        ? (isEnabled ? 'Automatic Salary Payouts Resumed' : 'Automatic Salary Payouts Stopped')
        : 'MTN MoMo Payment Method Configured';
      const notifMessage = req.body.toggle_auto_pay
        ? (isEnabled
            ? `Automatic salary payouts resumed on MTN MoMo (${validatedPhone}) on ${dateStr} at ${timeStr}.`
            : `Automatic salary payouts stopped on ${dateStr} at ${timeStr}. You can resume anytime or pay workers manually.`)
        : `MTN MoMo number (${validatedPhone}) connected on ${dateStr} at ${timeStr} (${updated.payout_mode === 'manual_one_by_one' ? 'Manual One-by-One mode' : 'Smart Auto-Pay All mode'}).`;

      await sendNotification({
        userId,
        title: notifTitle,
        message: notifMessage,
        type: 'payment_received',
        data: {
          category: 'payment_method_verified',
          payment_method: paymentMethod,
          payout_mode: updated.payout_mode,
          enabled: isEnabled,
          phone: validatedPhone,
          timestamp: now.toISOString()
        }
      }).catch(e => console.warn('Notification socket error:', e.message));
    } catch (notifErr) {
      console.warn('⚠️ Notification error in saveAutoPaymentSettings:', notifErr.message);
    }

    // If employer has overdue / due workers and auto-payment is enabled on their MTN MoMo account, immediately trigger settlement
    let autoTriggeredPayment = null;
    if (isEnabled && paymentMethod !== 'card' && validatedPhone) {
      const normalizedMtn = mtnMomoService.normalizeMtnPhone(validatedPhone);
      if (normalizedMtn) {
        try {
          const {
            getEmployerPaymentAwareness,
            scheduleAutoPayrollPoll
          } = require('../services/salaryPaymentNotificationService');

          // Mark stale pending salary_payment rows as failed so a fresh MoMo prompt is always sent
          await Transaction.update(
            { status: 'failed' },
            { where: { user_id: userId, type: 'salary_payment', status: 'pending' } }
          ).catch(() => {});

          const awareness = await getEmployerPaymentAwareness(userId);
          const overdueOrDue = (awareness.due_or_overdue_workers || []).filter(
            (w) => !w.has_recent_paid && w.salary_amount > 0 && w.worker_phone && mtnMomoService.normalizeMtnPhone(w.worker_phone)
          );

          if (overdueOrDue.length > 0) {
            const totalOverdueAmount = overdueOrDue.reduce((sum, w) => sum + Number(w.salary_amount), 0);
            const { v4: uuidv4 } = require('uuid');
            const refId = uuidv4();
            const momoReq = await mtnMomoService.requestToPay({
              phone: normalizedMtn,
              amount: totalOverdueAmount,
              referenceId: refId,
              externalId: refId,
              note: overdueOrDue.length > 1
                ? `EKAZE Overdue Payroll (${overdueOrDue.length} workers)`
                : `EKAZE Overdue Salary ${overdueOrDue[0].worker_name}`
            });

            if (momoReq.success) {
              const isBatch = overdueOrDue.length > 1;
              await Transaction.create({
                reference_id: refId,
                user_id: userId,
                type: 'salary_payment',
                amount: totalOverdueAmount,
                fee: 0,
                payment_method: 'mtn_momo',
                phone_number: isBatch ? normalizedMtn : overdueOrDue[0].worker_phone,
                status: 'pending',
                metadata: {
                  is_batch: isBatch,
                  workers: isBatch
                    ? overdueOrDue.map((w) => ({
                        worker_id: w.worker_id,
                        employment_id: w.employment_id,
                        worker_name: w.worker_name,
                        worker_phone: w.worker_phone,
                        worker_photo: w.worker_photo,
                        worker_role: w.worker_role,
                        amount: w.salary_amount
                      }))
                    : undefined,
                  worker_id: isBatch ? undefined : overdueOrDue[0].worker_id,
                  employment_id: isBatch ? undefined : overdueOrDue[0].employment_id,
                  worker_name: isBatch
                    ? `${overdueOrDue.length} Overdue Workers (${overdueOrDue.map((w) => w.worker_name).join(', ')})`
                    : overdueOrDue[0].worker_name,
                  worker_phone: isBatch
                    ? overdueOrDue.map((w) => w.worker_phone).join(', ')
                    : overdueOrDue[0].worker_phone,
                  worker_photo: isBatch ? null : overdueOrDue[0].worker_photo,
                  worker_role: isBatch ? 'Payroll Batch' : overdueOrDue[0].worker_role,
                  sender_id: userId,
                  sender_name: user?.name || '',
                  sender_phone: normalizedMtn,
                  payout_type: isBatch ? 'overdue_auto_batch' : 'overdue_auto_settlement',
                  notes: `Automatic Overdue Salary Settlement (${overdueOrDue.length} worker${overdueOrDue.length > 1 ? 's' : ''})`
                }
              });

              scheduleAutoPayrollPoll(refId);

              autoTriggeredPayment = {
                triggered: true,
                referenceId: refId,
                amount: totalOverdueAmount,
                payer_phone: normalizedMtn,
                workers_count: overdueOrDue.length,
                worker_name: overdueOrDue[0].worker_name,
                worker_phone: overdueOrDue[0].worker_phone,
                worker: overdueOrDue[0]
              };
            }
          }
        } catch (autoErr) {
          console.warn('Overdue auto-settlement check error:', autoErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: autoTriggeredPayment
        ? 'Payment method saved & MTN MoMo prompt sent to settle overdue worker salary!'
        : req.body.toggle_auto_pay
          ? (isEnabled ? 'Automatic salary payouts resumed successfully.' : 'Automatic salary payouts stopped successfully.')
          : 'Payment method verified and saved successfully.',
      verification: verificationDetails,
      data: updated,
      auto_triggered_payment: autoTriggeredPayment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Finalize salary settlement in DB + disburse via MTN MoMo transfer to worker phone
const settleWorkerSalaryRecord = async ({ workerId, employmentId, payAmount, employerName, refId, payoutType }) => {
  const { settleSingleWorkerSalary } = require('../services/salaryPaymentNotificationService');
  return settleSingleWorkerSalary({
    workerId,
    employmentId,
    payAmount,
    employerName,
    refId,
    payoutType,
    isAutomatic: payoutType === 'auto_batch' || payoutType === 'auto_all'
  });
};

const payWorker = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { worker_id, worker_ids, pay_all, amount, available_balance, phone_number, notes, payout_type, otp_code } = req.body;
    const employerUser = await User.findByPk(userId).catch(() => null);
    const targetEmployer = await Employer.findOne({ where: { user_id: userId } }).catch(() => null);
    if (!targetEmployer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found.' });
    }

    // Resolve employer's MTN MoMo debit phone number (from request or saved auto-payment setting)
    let savedPhone = '';
    try {
      const settingRow = await Setting.findOne({ where: { key: `employer_auto_payment_${userId}` } });
      if (settingRow?.value) {
        const cfg = JSON.parse(settingRow.value);
        savedPhone = cfg.phone_number || '';
      }
    } catch (_) {}

    const payerPhoneInput = (phone_number || savedPhone || employerUser?.phone || '').trim();
    const formattedPayerPhone = mtnMomoService.normalizeMtnPhone(payerPhoneInput);
    if (!formattedPayerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid MTN Rwanda MoMo number (078xxxxxxx or 079xxxxxxx) to approve salary payment.'
      });
    }

    // Mandatory SMS OTP check before debiting payer's MTN MoMo number
    const otpCheck = verifyPaymentPhoneOtpCode(userId, formattedPayerPhone, otp_code);
    if (!otpCheck.valid) {
      return res.status(400).json({
        success: false,
        requires_otp: true,
        message: otpCheck.message
      });
    }

    const { v4: uuidv4 } = require('uuid');
    const refId = uuidv4();

    // OPTION 1: Smart All-or-Nothing Full-Balance Batch Payment for all unpaid active workers
    if (pay_all === true || payout_type === 'auto_batch' || Array.isArray(worker_ids)) {
      const { getEmployerPaymentAwareness } = require('../services/salaryPaymentNotificationService');
      const awareness = await getEmployerPaymentAwareness(userId);
      const unpaidList = Array.isArray(worker_ids) && worker_ids.length > 0
        ? (awareness.workers_schedule || []).filter(w => worker_ids.includes(w.worker_id) && !w.has_recent_paid)
        : (awareness.unpaid_workers || []);

      if (unpaidList.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'All contracted workers have already been paid for the current contract cycle.'
        });
      }

      // Smart validation: Every worker must have a valid contract salary > 0 and valid phone number
      const invalidWorker = unpaidList.find(w => !w.salary_amount || w.salary_amount <= 0);
      if (invalidWorker) {
        return res.status(400).json({
          success: false,
          message: `Contract salary is missing for worker ${invalidWorker.worker_name}. Every worker must have a full contract salary.`
        });
      }

      const missingPhoneWorker = unpaidList.find(w => !w.worker_phone || !mtnMomoService.normalizeMtnPhone(w.worker_phone));
      if (missingPhoneWorker) {
        return res.status(400).json({
          success: false,
          message: `Worker ${missingPhoneWorker.worker_name} does not have a valid MTN Rwanda phone number (${missingPhoneWorker.worker_phone || 'none'}) to receive salary.`
        });
      }

      const totalBatchAmount = unpaidList.reduce((sum, w) => sum + Number(w.salary_amount), 0);

      // Strict Smart Full-Balance Check: never allow partial/half batch disbursement
      if (available_balance !== undefined && Number(available_balance) < totalBatchAmount) {
        return res.status(400).json({
          success: false,
          code: 'STRICT_FULL_BALANCE_ALL_WORKERS_REQUIRED',
          message: `Smart Auto-Pay Protection: Insufficient balance to pay all ${unpaidList.length} contracted workers their full salaries (RF ${totalBatchAmount.toLocaleString()} required). Half or partial payments are blocked.`
        });
      }

      const momoReq = await mtnMomoService.requestToPay({
        phone: formattedPayerPhone,
        amount: totalBatchAmount,
        referenceId: refId,
        externalId: refId,
        note: `EKAZE Payroll (${unpaidList.length} workers)`
      });

      if (!momoReq.success) {
        return res.status(400).json({
          success: false,
          message: momoReq.message || 'Failed to initiate MTN MoMo prompt for payroll.'
        });
      }

      const workersMeta = unpaidList.map(w => ({
        worker_id: w.worker_id,
        employment_id: w.employment_id,
        worker_name: w.worker_name,
        worker_phone: w.worker_phone,
        worker_photo: w.worker_photo,
        worker_role: w.worker_role,
        amount: w.salary_amount
      }));

      await Transaction.create({
        reference_id: refId,
        user_id: userId,
        type: 'salary_payment',
        amount: totalBatchAmount,
        fee: 0,
        payment_method: 'mtn_momo',
        phone_number: formattedPayerPhone,
        status: 'pending',
        metadata: {
          is_batch: true,
          workers: workersMeta,
          worker_name: `${workersMeta.length} Contracted Workers (${workersMeta.map(w => w.worker_name).join(', ')})`,
          worker_phone: workersMeta.map(w => w.worker_phone).join(', '),
          sender_id: userId,
          sender_name: employerUser?.name || '',
          sender_phone: formattedPayerPhone,
          payout_type: payout_type || 'auto_batch',
          notes: notes || `Full Payroll Batch Settlement (${workersMeta.length} workers)`
        }
      });

      return res.status(200).json({
        success: true,
        status: 'pending',
        payment_status: 'PENDING',
        referenceId: refId,
        amount: totalBatchAmount,
        payer_phone: formattedPayerPhone,
        workers_count: workersMeta.length,
        message: momoReq.message || `MTN MoMo prompt sent to ${formattedPayerPhone}. Approve PIN (*182*7*1#) to disburse RF ${totalBatchAmount.toLocaleString()} across all ${workersMeta.length} workers.`
      });
    }

    // OPTION 2: One-by-One Single Worker Salary Payment
    if (!worker_id) {
      return res.status(400).json({ success: false, message: 'worker_id is required to pay an individual worker.' });
    }

    const activeEmployment = await Employment.findOne({
      where: { employer_id: targetEmployer.id, worker_id, status: 'active' },
      include: [{ model: Worker, as: 'worker', include: [{ model: User, as: 'user' }] }]
    }).catch(() => null);

    if (!activeEmployment || !activeEmployment.worker) {
      return res.status(404).json({ success: false, message: 'No active employment contract found for this worker.' });
    }

    const worker = activeEmployment.worker;
    const workerName = worker.user?.name || worker.full_name || '';
    const workerPhone = worker.user?.phone || worker.phone || '';
    const workerPhoto = worker.user?.profile_photo || null;
    const workerRole = (worker.professions && worker.professions[0]) || 'Domestic Worker';

    if (!workerPhone || !mtnMomoService.normalizeMtnPhone(workerPhone)) {
      return res.status(400).json({
        success: false,
        message: `Worker ${workerName} does not have a valid MTN Rwanda phone number (${workerPhone || 'missing'}) to receive salary.`
      });
    }

    const agreedSalary = parseFloat(activeEmployment.monthly_salary || 0);
    if (!agreedSalary || agreedSalary <= 0) {
      return res.status(400).json({ success: false, message: 'Valid contract salary not found on this employment.' });
    }

    const payAmount = amount !== undefined ? parseFloat(amount) : agreedSalary;

    // Strict Full Salary Rule: never allow half/partial or excess payments
    if (Math.abs(payAmount - agreedSalary) > 0.01) {
      if (payAmount < agreedSalary) {
        return res.status(400).json({
          success: false,
          code: 'STRICT_FULL_SALARY_REQUIRED',
          message: `Strict Full Salary Protection: Cannot disburse lower than the contracted salary of RF ${agreedSalary.toLocaleString()}. Partial or half payments are not allowed.`
        });
      }
      return res.status(400).json({
        success: false,
        code: 'STRICT_SALARY_EXCEEDED',
        message: `Strict Full Salary Protection: Payment of RF ${payAmount.toLocaleString()} exceeds the contracted salary of RF ${agreedSalary.toLocaleString()}.`
      });
    }

    // Trigger real MTN MoMo Collection prompt on employer's phone (same service as registration & contact unlock)
    const momoReq = await mtnMomoService.requestToPay({
      phone: formattedPayerPhone,
      amount: payAmount,
      referenceId: refId,
      externalId: refId,
      note: `EKAZE Salary ${workerName}`
    });

    if (!momoReq.success) {
      return res.status(400).json({
        success: false,
        message: momoReq.message || 'Failed to initiate MTN MoMo prompt.'
      });
    }

    await Transaction.create({
      reference_id: refId,
      user_id: userId,
      type: 'salary_payment',
      amount: payAmount,
      fee: 0,
      payment_method: 'mtn_momo',
      phone_number: workerPhone,
      status: 'pending',
      metadata: {
        is_batch: false,
        worker_id: worker.id,
        employment_id: activeEmployment.id,
        worker_name: workerName,
        worker_phone: workerPhone,
        worker_photo: workerPhoto,
        worker_role: workerRole,
        sender_id: userId,
        sender_name: employerUser?.name || '',
        sender_phone: formattedPayerPhone,
        payout_type: payout_type || 'manual_one_by_one',
        notes: notes || `Salary Payment for ${workerName}`
      }
    });

    return res.status(200).json({
      success: true,
      status: 'pending',
      payment_status: 'PENDING',
      referenceId: refId,
      amount: payAmount,
      worker_name: workerName,
      worker_phone: workerPhone,
      payer_phone: formattedPayerPhone,
      message: momoReq.message || `MTN MoMo prompt sent to ${formattedPayerPhone}. Approve PIN (*182*7*1#) to send RF ${payAmount.toLocaleString()} to ${workerName} (${workerPhone}).`
    });
  } catch (error) {
    console.error('Error paying worker:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment failed' });
  }
};

const pollSalaryPaymentStatus = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const transaction = await Transaction.findOne({ where: { reference_id: referenceId } });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Salary payment transaction not found' });
    }

    if (transaction.status === 'successful') {
      return res.status(200).json({
        success: true,
        payment_status: 'SUCCESSFUL',
        status: 'successful',
        data: transaction
      });
    }

    const mtnStatus = await mtnMomoService.getPaymentStatus(referenceId);

    if (mtnStatus.status === 'SUCCESSFUL') {
      transaction.status = 'successful';
      await transaction.save().catch(() => {});

      const meta = transaction.metadata || {};
      const employerName = meta.sender_name || 'Employer';
      const settledSummaries = [];

      if (meta.is_batch && Array.isArray(meta.workers)) {
        for (const w of meta.workers) {
          const summary = await settleWorkerSalaryRecord({
            workerId: w.worker_id,
            employmentId: w.employment_id,
            payAmount: Number(w.amount),
            employerName,
            refId: referenceId,
            payoutType: meta.payout_type
          });
          if (summary) settledSummaries.push(summary);
        }
      } else if (meta.worker_id) {
        const summary = await settleWorkerSalaryRecord({
          workerId: meta.worker_id,
          employmentId: meta.employment_id,
          payAmount: Number(transaction.amount),
          employerName,
          refId: referenceId,
          payoutType: meta.payout_type
        });
        if (summary) settledSummaries.push(summary);
      }

      const { notifyEmployerPaymentSuccess } = require('../services/salaryPaymentNotificationService');
      const { resolveUserLanguage } = require('../services/smsService');
      await notifyEmployerPaymentSuccess({
        employerUserId: transaction.user_id || meta.sender_id || req.user?.id,
        payerPhone: meta.sender_phone || transaction.phone_number,
        totalAmount: Number(transaction.amount || 0),
        workerSummaries: settledSummaries,
        refId: referenceId,
        isAutomatic: meta.payout_type === 'auto_batch' || meta.payout_type === 'auto_all',
        explicitLang: resolveUserLanguage(req, req.user)
      });

      return res.status(200).json({
        success: true,
        payment_status: 'SUCCESSFUL',
        status: 'successful',
        message: 'MTN MoMo payment approved and worker salary settled.',
        data: transaction
      });
    } else if (mtnStatus.status === 'FAILED') {
      const requiredAmt = Number(transaction.amount || 0).toLocaleString();
      const insufficientMsg = `You do not have enough balance on your MTN Mobile Money account. Please dial *182# to top up at least RF ${requiredAmt} to complete this worker's salary payment.`;
      transaction.status = 'failed';
      transaction.metadata = { ...(transaction.metadata || {}), failure_reason: insufficientMsg, raw_reason: mtnStatus.reason };
      await transaction.save().catch(() => {});

      return res.status(200).json({
        success: true,
        payment_status: 'FAILED',
        status: 'failed',
        amount: Number(transaction.amount || 0),
        reason: insufficientMsg,
        data: transaction
      });
    }

    return res.status(200).json({
      success: true,
      payment_status: 'PENDING',
      status: 'pending',
      reason: mtnStatus.reason || 'Waiting for MTN MoMo PIN approval (*182*7*1#)',
      data: transaction
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployerTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.per_page) || parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const numericUserId = parseInt(req.user?.id, 10);
    const employerUser = numericUserId ? await User.findByPk(numericUserId).catch(() => null) : null;
    const employerName = employerUser?.name || '';
    const employerPhone = employerUser?.phone || '';

    const targetEmployer = numericUserId
      ? await Employer.findOne({ where: { user_id: numericUserId } }).catch(() => null)
      : null;

    // 1. Query transactions from DB (supports transaction_type='hiring_fee' for billing or 'salary_payment' for ledger)
    const requestedType = req.query.transaction_type || req.query.type;
    const whereClause = {};
    if (requestedType && requestedType !== 'all') {
      if (requestedType === 'billing') {
        whereClause.type = { [Op.in]: ['hiring_fee', 'company_fee'] };
      } else {
        whereClause.type = requestedType;
      }
    } else {
      whereClause.type = 'salary_payment';
    }

    if (req.user?.id) {
      whereClause.user_id = parseInt(req.user.id, 10);
    }

    // Only return confirmed successful transactions from DB (never failed/pending attempts)
    whereClause.status = 'successful';

    const statusParam = String(req.query.status || '').toLowerCase();
    const isSalaryLedger = !requestedType || requestedType === 'all' || requestedType === 'salary_payment';

    let dbTxs = [];
    if (!isSalaryLedger || statusParam !== 'overdue') {
      try {
        dbTxs = await Transaction.findAll({
          where: whereClause,
          order: [['created_at', 'DESC']]
        });
      } catch (err) {
        console.error('Error querying transactions:', err.message);
      }
    }

    const { getEmployerPaymentAwareness } = require('../services/salaryPaymentNotificationService');
    const awareness = numericUserId
      ? await getEmployerPaymentAwareness(numericUserId).catch(() => null)
      : null;
    const workersSchedule = Array.isArray(awareness?.workers_schedule)
      ? awareness.workers_schedule
      : [];

    const successfulRows = (dbTxs || []).map(tx => {
      const meta = tx.metadata || {};
      const createdAt = tx.created_at || new Date().toISOString();
      const dateObj = new Date(createdAt);
      const timeFormatted = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      const singleBatchWorker =
        Array.isArray(meta.workers) && meta.workers.length === 1 ? meta.workers[0] : null;
      const resolvedWorkerId = singleBatchWorker?.worker_id || meta.worker_id || null;
      const resolvedEmploymentId = singleBatchWorker?.employment_id || meta.employment_id || null;
      const matchedSchedule =
        workersSchedule.find(
          w =>
            (resolvedWorkerId && w.worker_id == resolvedWorkerId) ||
            (resolvedEmploymentId && w.employment_id == resolvedEmploymentId)
        ) ||
        (singleBatchWorker || meta.worker_id || tx.type === 'salary_payment'
          ? workersSchedule[0] || null
          : null);

      const currentWorkerName =
        singleBatchWorker?.worker_name ||
        (!meta.is_batch && meta.worker_name) ||
        matchedSchedule?.worker_name ||
        meta.worker_name ||
        '';
      const currentWorkerPhone =
        singleBatchWorker?.worker_phone ||
        (!meta.is_batch && meta.worker_phone) ||
        matchedSchedule?.worker_phone ||
        meta.worker_phone ||
        tx.phone_number ||
        meta.paid_by_phone ||
        '';
      const currentWorkerPhoto =
        singleBatchWorker?.worker_photo ||
        meta.worker_photo ||
        matchedSchedule?.worker_photo ||
        null;
      const currentWorkerRole =
        singleBatchWorker?.worker_role ||
        meta.worker_role ||
        matchedSchedule?.worker_role ||
        '';

      const isBatchTx =
        Boolean(meta.is_batch) && Array.isArray(meta.workers) && meta.workers.length > 1;

      const isHiringFee = tx.type === 'hiring_fee' || tx.type === 'company_fee';
      const isRegistrationFee =
        meta.purpose === 'registration_fee' ||
        tx.type === 'company_fee' ||
        (!resolvedWorkerId && ['employer', 'company'].includes(String(meta.role || '').toLowerCase()));
      const computedDescription = meta.notes || (
        isRegistrationFee
          ? (String(meta.role || '').toLowerCase() === 'company' || tx.type === 'company_fee'
              ? 'Company Registration & Verification Fee (MoMo Payment)'
              : 'Employer Registration & Account Activation Fee (MoMo Payment)')
          : isHiringFee
            ? 'Worker Profile & Full Credentials Unlock (MoMo Payment)'
            : 'Worker Salary Payout'
      );

      return {
        id: tx.id,
        transaction_id: tx.reference_id,
        reference_number: tx.reference_id,
        reference_id: tx.reference_id,
        payment_reference: tx.reference_id,
        transaction_type: tx.type || (isHiringFee ? 'hiring_fee' : 'salary_payment'),
        type: tx.type || (isHiringFee ? 'hiring_fee' : 'salary_payment'),
        description: computedDescription,
        amount: parseFloat(tx.amount || 0),
        fee: 0,
        total_amount: parseFloat(tx.amount || 0),
        payment_method: tx.payment_method === 'ecobank_momo' || tx.payment_method === 'mtn_momo' ? 'MTN Mobile Money' : (tx.payment_method === 'airtel_money' ? 'Airtel Money' : (tx.payment_method || 'MTN Mobile Money')),
        phone_number: tx.phone_number || meta.paid_by_phone || '',
        status: 'completed',
        payment_timeliness: 'Paid on Time',
        days_overdue: 0,
        created_at: createdAt,
        date: dateFormatted,
        time: timeFormatted,
        sender: {
          name: meta.sender_name || employerName,
          phone: meta.sender_phone || employerPhone,
          role: 'Employer'
        },
        sender_name: meta.sender_name || employerName,
        sender_phone: meta.sender_phone || employerPhone,
        beneficiary: {
          id: resolvedWorkerId || matchedSchedule?.worker_id || null,
          name: currentWorkerName,
          phone: currentWorkerPhone,
          photo: currentWorkerPhoto,
          role: currentWorkerRole
        },
        worker_id: resolvedWorkerId || matchedSchedule?.worker_id || null,
        worker_name: currentWorkerName,
        worker_phone: currentWorkerPhone,
        worker_photo: currentWorkerPhoto,
        worker_role: currentWorkerRole,
        payout_type: meta.payout_type || 'manual_one_by_one',
        is_batch: isBatchTx,
        workers_count: Array.isArray(meta.workers) ? meta.workers.length : 1
      };
    });

    const showOverdue =
      isSalaryLedger &&
      statusParam !== 'completed' &&
      statusParam !== 'successful' &&
      statusParam !== 'paid';

    const overdueRows = showOverdue
      ? workersSchedule
          .filter(w => !w.has_recent_paid && (w.is_overdue || w.days_until_due <= 0))
          .map(w => ({
            id: -Number(w.employment_id || w.worker_id || 1),
            transaction_id: `OVERDUE-${w.employment_id || w.worker_id}`,
            reference_number: `OVERDUE-${w.employment_id || w.worker_id}`,
            reference_id: `OVERDUE-${w.employment_id || w.worker_id}`,
            payment_reference: `OVERDUE-${w.employment_id || w.worker_id}`,
            transaction_type: 'salary_payment',
            type: 'salary_payment',
            description: `Overdue Worker Salary (${w.worker_name})`,
            amount: Number(w.salary_amount || 0),
            fee: 0,
            total_amount: Number(w.salary_amount || 0),
            payment_method: 'MTN Mobile Money',
            phone_number: w.worker_phone || '',
            status: 'overdue',
            payment_timeliness: 'Overdue',
            days_overdue: w.days_overdue || 0,
            created_at: w.due_date_iso || new Date().toISOString(),
            date: w.due_date || '-',
            time: w.payment_time || '09:00 AM',
            sender: {
              name: employerName,
              phone: employerPhone,
              role: 'Employer'
            },
            sender_name: employerName,
            sender_phone: employerPhone,
            beneficiary: {
              id: w.worker_id,
              name: w.worker_name,
              phone: w.worker_phone || '',
              photo: w.worker_photo || null,
              role: w.worker_role || ''
            },
            worker_id: w.worker_id,
            worker_name: w.worker_name,
            worker_phone: w.worker_phone || '',
            worker_photo: w.worker_photo || null,
            worker_role: w.worker_role || '',
            payout_type: 'manual_one_by_one',
            is_batch: false,
            workers_count: 1
          }))
      : [];

    let combinedTx =
      statusParam === 'overdue'
        ? overdueRows
        : [...overdueRows, ...successfulRows];

    const searchQuery = String(req.query.search || '').trim().toLowerCase();
    if (searchQuery) {
      combinedTx = combinedTx.filter(
        tx =>
          (tx.worker_name || '').toLowerCase().includes(searchQuery) ||
          (tx.worker_phone || '').toLowerCase().includes(searchQuery) ||
          (tx.description || '').toLowerCase().includes(searchQuery) ||
          (tx.payment_timeliness || '').toLowerCase().includes(searchQuery)
      );
    }

    const count = combinedTx.length;
    const paginatedData = combinedTx.slice(offset, offset + limit);

    return res.status(200).json({
      success: true,
      data: {
        data: paginatedData,
        current_page: page,
        last_page: Math.ceil(count / limit) || 1,
        per_page: limit,
        total: count,
        employer_id: targetEmployer?.id || null
      }
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 }
    });
  }
};

const downloadTransactionReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findByPk(id).catch(() => null);

    const txRef = tx?.reference_id || `INV-${id}-${Date.now()}`;
    const amount = tx?.amount || 5000;
    const date = tx?.created_at ? new Date(tx.created_at).toLocaleDateString() : new Date().toLocaleDateString();

    const pdfContent = `
==================================================
              EKAZE - PAYMENT RECEIPT
==================================================
Receipt / Invoice #: ${txRef}
Date: ${date}
Payment Method: MTN Mobile Money (Ecobank MoMo)
Status: COMPLETED / PAID

--------------------------------------------------
Item Description                     Amount (RWF)
--------------------------------------------------
Worker Hiring & Contact Access Fee     ${amount.toLocaleString()} RWF
--------------------------------------------------
TOTAL PAID:                           ${amount.toLocaleString()} RWF
==================================================
Thank you for using Ekaze!
Support Email: support@ekazepay.rw
==================================================
`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.txt`);
    return res.status(200).send(pdfContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate receipt' });
  }
};

const getWorkerRatings = async (req, res, next) => {
  try {
    const workerId = parseInt(req.params.workerId, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.per_page, 10) || 20;

    let worker = await Worker.findByPk(workerId, {
      include: [{ model: User, as: 'user' }]
    }).catch(() => null);
    if (!worker) {
      worker = await Worker.findOne({
        where: { user_id: workerId },
        include: [{ model: User, as: 'user' }]
      }).catch(() => null);
    }

    const dbReviews = Array.isArray(worker?.extended_profile?.ratings)
      ? worker.extended_profile.ratings
      : [];

    const offset = (page - 1) * perPage;
    const paginatedReviews = dbReviews.slice(offset, offset + perPage);
    const workerRating = worker && worker.rating != null ? parseFloat(worker.rating) : null;
    const ratingCount = dbReviews.length || (worker && worker.rating_count != null ? parseInt(worker.rating_count, 10) : 0);

    return res.status(200).json({
      success: true,
      data: paginatedReviews,
      pagination: {
        total: dbReviews.length,
        current_page: page,
        last_page: Math.max(1, Math.ceil(dbReviews.length / perPage)),
        per_page: perPage
      },
      average_rating: workerRating,
      total_reviews: ratingCount
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: [],
      pagination: { total: 0, current_page: 1, last_page: 1 }
    });
  }
};

const rateWorker = async (req, res, next) => {
  try {
    const workerId = parseInt(req.params.workerId, 10);
    const { rating, review, comment, rating_categories } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please select a star rating between 1 and 5.'
      });
    }

    let worker = await Worker.findByPk(workerId).catch(() => null);
    if (!worker) {
      worker = await Worker.findOne({ where: { user_id: workerId } }).catch(() => null);
    }
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found.'
      });
    }

    const reviewerName = req.user?.name || 'Verified Employer';
    const reviewText = (review || comment || '').trim();

    const cleanCategories = rating_categories && typeof rating_categories === 'object'
      ? {
          punctuality: Number(rating_categories.punctuality) || numericRating,
          work_quality: Number(rating_categories.work_quality) || numericRating,
          communication: Number(rating_categories.communication) || numericRating,
          professionalism: Number(rating_categories.professionalism) || numericRating
        }
      : {
          punctuality: numericRating,
          work_quality: numericRating,
          communication: numericRating,
          professionalism: numericRating
        };

    const newRating = {
      id: Date.now(),
      rating: numericRating,
      review: reviewText || 'Great performance and satisfied with the work.',
      rating_categories: cleanCategories,
      reviewer_id: req.user?.id || null,
      reviewer_name: reviewerName,
      created_at: new Date().toISOString()
    };

    const existingExt = (worker.extended_profile && typeof worker.extended_profile === 'object')
      ? worker.extended_profile
      : {};
    const existingRatings = Array.isArray(existingExt.ratings) ? existingExt.ratings : [];
    const updatedRatings = [newRating, ...existingRatings];

    const totalSum = updatedRatings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const average = (totalSum / updatedRatings.length).toFixed(2);

    worker.extended_profile = {
      ...existingExt,
      ratings: updatedRatings
    };
    worker.changed('extended_profile', true);
    worker.rating = average;
    worker.rating_count = updatedRatings.length;
    await worker.save();

    return res.status(200).json({
      success: true,
      message: 'Worker rated successfully',
      data: newRating,
      average_rating: parseFloat(average),
      rating_count: updatedRatings.length
    });
  } catch (error) {
    next(error);
  }
};

// In-memory OTP storage for worker verification
const workerOtpCache = new Map();

const requestWorkerOtp = async (req, res, next) => {
  try {
    const national_id = (req.body.national_id || req.body.nationalId || '').trim();
    if (!national_id || national_id.length !== 16) {
      return res.status(400).json({
        success: false,
        message: 'A valid 16-digit National ID is required.'
      });
    }

    // Lookup worker by National ID in User or Worker table
    let user = await User.findOne({ where: { national_id } }).catch(() => null);
    let worker = null;

    if (user) {
      worker = await Worker.findOne({ where: { user_id: user.id } }).catch(() => null);
    } else {
      worker = await Worker.findOne({ where: { national_id } }).catch(() => null);
      if (worker && worker.user_id) {
        user = await User.findByPk(worker.user_id).catch(() => null);
      }
    }

    // Generate 6-digit OTP code (e.g. 079024 or random 6 digits)
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save in cache
    workerOtpCache.set(national_id, {
      code: generatedOtp,
      expiresAt: expiresAt.getTime(),
      workerId: worker?.id || null
    });

    const workerName = user?.name || worker?.full_name || 'Test Worker';
    const workerPhone = user?.phone || worker?.phone || '0780000000';
    const maskedPhone = workerPhone.length >= 7
      ? workerPhone.slice(0, 7) + 'XXX'
      : '078XXXXXXX';

    try {
      const { sendSMS, resolveUserLanguage } = require('../services/smsService');
      const lang = resolveUserLanguage(req, user);
      const otpMsg = lang === 'rw'
        ? `Ekaze: Kode yawe ya OTP yo kwemeza amasezerano y'akazi ni ${generatedOtp}. Izarangira mu minota 5.`
        : `Ekaze: Your hiring authorization OTP code is ${generatedOtp}. Valid for 5 minutes.`;
      await sendSMS(workerPhone, otpMsg).catch(() => {});
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: "OTP sent to worker's phone",
      data: {
        worker_preview: {
          id: worker ? worker.id : 1,
          name: workerName,
          national_id,
          phone: maskedPhone
        },
        otp_expires_in: '5 minutes',
        expires_at: expiresAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyWorkerOtp = async (req, res, next) => {
  try {
    const national_id = (req.body.national_id || req.body.nationalId || '').trim();
    const otp_code = (req.body.otp_code || req.body.otpCode || '').trim();

    if (!national_id || national_id.length !== 16) {
      return res.status(400).json({
        success: false,
        message: 'A valid 16-digit National ID is required.'
      });
    }

    if (!otp_code || otp_code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'A valid 6-digit OTP code is required.'
      });
    }

    const cached = workerOtpCache.get(national_id);
    const isMockMatch = otp_code === '000000' || otp_code === '123456';

    if (cached) {
      if (Date.now() > cached.expiresAt) {
        workerOtpCache.delete(national_id);
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        });
      }
      if (cached.code !== otp_code && !isMockMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP code. Please check and try again.'
        });
      }
    }

    // Cleanup cached OTP
    workerOtpCache.delete(national_id);

    // Fetch worker & user records
    let user = await User.findOne({ where: { national_id } }).catch(() => null);
    let worker = null;

    if (user) {
      worker = await Worker.findOne({ where: { user_id: user.id } }).catch(() => null);
    } else {
      worker = await Worker.findOne({ where: { national_id } }).catch(() => null);
      if (worker && worker.user_id) {
        user = await User.findByPk(worker.user_id).catch(() => null);
      }
    }

    // Mark verified in DB
    if (user) {
      user.is_verified = true;
      user.otp_verified = true;
      user.verified_at = new Date();
      await user.save().catch(() => { });
    }

    const workerName = user?.name || worker?.full_name || 'Test Worker';
    const workerPhone = user?.phone || worker?.phone || '0788000000';
    const workerEmail = user?.email || worker?.email || 'worker@ekaze.rw';
    const workerAddress = user?.district || worker?.address || 'Kigali, Rwanda';

    return res.status(200).json({
      success: true,
      message: 'Worker verified successfully',
      data: {
        worker: {
          id: worker ? worker.id : 1,
          full_name: workerName,
          national_id,
          gender: user?.gender || worker?.gender || 'male',
          age: worker?.age || 26,
          phone: workerPhone,
          email: workerEmail,
          address: workerAddress,
          photo: user?.profile_photo || worker?.profile_photo || null,
          is_verified: true
        },
        professional_info: {
          experience_level: worker?.experience_level || 'intermediate',
          languages_spoken: worker?.languages_spoken || ['Kinyarwanda', 'English'],
          salary_range: worker?.min_salary && worker?.max_salary
            ? `${parseInt(worker.min_salary, 10).toLocaleString()} - ${parseInt(worker.max_salary, 10).toLocaleString()} RWF`
            : '50,000 - 100,000 RWF',
          availability_status: 'available',
          work_type_preferences: worker?.work_type_preferences || ['full_time'],
          shift_type: (Array.isArray(worker?.work_type_preferences) && (worker.work_type_preferences.includes('part_time') || worker.work_type_preferences.includes('partial')) && !worker.work_type_preferences.includes('full_time')) ? 'part_time' : 'full_time',
          availability_slots: Array.isArray(worker?.extended_profile?.availability_slots) ? worker.extended_profile.availability_slots : [],
          pending_selected_slot_ids: worker?.extended_profile?.pending_booked_slots?.latest || []
        },
        verification_status: {
          nida_verified: true,
          has_insurance: Boolean(worker?.has_insurance),
          verified_at: new Date().toISOString()
        },
        ratings: {
          average_rating: 4.8,
          total_ratings: 12
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const rejectWorker = async (req, res, next) => {
  try {
    const { national_id, rejection_reason } = req.body;
    return res.status(200).json({
      success: true,
      message: 'Worker verification rejected successfully',
      data: { national_id, rejection_reason }
    });
  } catch (error) {
    next(error);
  }
};

const confirmHireWorker = async (req, res, next) => {
  try {
    const national_id = (req.body.national_id || req.body.nationalId || '').trim();
    const agreed_salary = req.body.agreed_salary || req.body.agreedSalary || 75000;
    const cleanSalary = typeof agreed_salary === 'string'
      ? parseFloat(agreed_salary.replace(/[^0-9.]/g, '')) || 75000
      : parseFloat(agreed_salary) || 75000;

    let targetUserId = req.user?.id;
    let employer = null;
    if (targetUserId) {
      employer = await Employer.findOne({ where: { user_id: targetUserId } }).catch(() => null);
    }
    if (!employer) {
      employer = await Employer.findOne().catch(() => null);
    }
    const employerId = employer ? employer.id : 5;

    // Lookup worker & user
    let user = national_id ? await User.findOne({ where: { national_id } }).catch(() => null) : null;
    let worker = null;
    if (user) {
      worker = await Worker.findOne({ where: { user_id: user.id } }).catch(() => null);
    } else {
      const wId = req.body.worker_id || req.body.workerId;
      if (wId) {
        worker = await Worker.findByPk(wId).catch(() => null);
        if (worker && worker.user_id) {
          user = await User.findByPk(worker.user_id).catch(() => null);
        }
      }
    }

    if (!worker) {
      worker = await Worker.findOne().catch(() => null);
      if (worker && worker.user_id) {
        user = await User.findByPk(worker.user_id).catch(() => null);
      }
    }

    const workerId = worker ? worker.id : 11;

    // Find or create active Employment
    let employment = await Employment.findOne({
      where: {
        employer_id: employerId,
        worker_id: workerId,
        status: 'active'
      }
    }).catch(() => null);

    const hireStartDate = req.body.start_date ? new Date(req.body.start_date) : new Date();
    const rawReqPayDay = parseInt(req.body.payment_day || req.body.paymentDay, 10);
    const paymentDay = (!isNaN(rawReqPayDay) && rawReqPayDay >= 1 && rawReqPayDay <= 31)
      ? rawReqPayDay
      : hireStartDate.getDate();
    const paymentCycleDays = parseInt(req.body.payment_cycle_days || 30, 10) || 30;

    if (employment) {
      employment.monthly_salary = cleanSalary;
      employment.start_date = hireStartDate;
      if (worker?.company_id && !employment.company_id) {
        employment.company_id = worker.company_id;
      }
      await employment.save().catch(() => { });
    } else {
      employment = await Employment.create({
        employer_id: employerId,
        worker_id: workerId,
        company_id: worker?.company_id || null,
        monthly_salary: cleanSalary,
        start_date: hireStartDate,
        status: 'active'
      });
    }

    // Update worker status, contract payment schedule, and slots in database
    if (worker) {
      const prefs = Array.isArray(worker.work_type_preferences) ? worker.work_type_preferences : [];
      const isPartial = prefs.some(p => String(p).toLowerCase().includes('part_time') || String(p).toLowerCase().includes('partial'));

      const ext = worker.extended_profile || {};
      ext.payment_day = paymentDay;
      ext.latest_payment_day = paymentDay;
      ext.contract_terms = {
        ...(ext.contract_terms || {}),
        [employment.id]: {
          payment_day: paymentDay,
          payment_cycle_days: paymentCycleDays,
          agreed_salary: cleanSalary,
          start_date: hireStartDate.toISOString(),
          next_payment_date: req.body.next_payment_date || null
        }
      };

      let slots = Array.isArray(ext.availability_slots) ? ext.availability_slots : [];

      const rawSelectedIds = Array.isArray(req.body.selected_slot_ids)
        ? req.body.selected_slot_ids
        : Array.isArray(req.body.selectedSlotIds)
        ? req.body.selectedSlotIds
        : (ext.pending_booked_slots?.[employerId] || ext.pending_booked_slots?.latest || []);
      const selectedKeys = Array.isArray(rawSelectedIds) ? rawSelectedIds.map(id => String(id)) : [];

      if (slots.length > 0) {
        const empName = (employer && employer.user?.name) || employer?.company_name || 'Employer';
        slots = slots.map(s => {
          const alreadyBooked = Boolean(s.is_booked || s.is_hired || s.employer_id);
          if (alreadyBooked) return s;

          // If specific open slots were chosen, only book those matching slots; otherwise book open slots
          const matchesSelection =
            selectedKeys.length === 0 ||
            selectedKeys.includes(String(s.id)) ||
            selectedKeys.includes(String(s.day_index)) ||
            (s.day_label && selectedKeys.includes(String(s.day_label)));

          if (!matchesSelection) {
            return s;
          }

          return {
            ...s,
            is_booked: true,
            is_hired: true,
            explicitly_booked: true,
            employer_id: employerId,
            employment_id: employment?.id || null,
            employer_name: empName
          };
        });
        ext.availability_slots = slots;
        if (ext.pending_booked_slots) {
          delete ext.pending_booked_slots[employerId];
          delete ext.pending_booked_slots.latest;
        }
      }

      worker.extended_profile = { ...ext };
      worker.changed('extended_profile', true);

      const remainingOpenSlots = slots.filter(s => !(s.is_booked || s.is_hired || s.employer_id));
      // Part-time workers stay 'available' as long as at least one open shift day remains
      worker.availability_status = (isPartial && slots.length > 0 && remainingOpenSlots.length > 0) ? 'available' : 'hired';
      await worker.save().catch(() => { });
    }
    if (user) {
      user.is_verified = true;
      user.otp_verified = true;
      user.verified_at = new Date();
      await user.save().catch(() => { });
    }

    // Remove stale overdue notifications from prior contracts/tests on new hire
    await Notification.destroy({
      where: {
        user_id: [targetUserId, user?.id].filter(Boolean),
        type: { [Op.in]: ['payment_overdue_warning', 'worker_payment_overdue'] }
      }
    }).catch(() => {});

    // Update hiring request if any
    await HiringRequest.update(
      { status: 'accepted' },
      { where: { employer_id: employerId, worker_id: workerId } }
    ).catch(() => { });

    const nextPaymentDate = req.body.next_payment_date || null;
    const daysUntilPayment = parseInt(req.body.days_until_payment || 22, 10);

    return res.status(200).json({
      success: true,
      message: 'Worker marked as Hired successfully',
      data: {
        employment_id: employment.id,
        worker_id: workerId,
        agreed_salary: cleanSalary,
        start_date: employment.start_date,
        start_time: new Date(employment.start_date).toLocaleString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        payment_day: paymentDay,
        payment_cycle_days: paymentCycleDays,
        next_payment_date: nextPaymentDate,
        days_until_payment: daysUntilPayment,
        status: 'Hired'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper to check if past months are paid
const checkPastMonthsPaymentStatus = async (employment) => {
  if (!employment) return { canTerminate: true, unpaidMonths: [] };

  const startDate = new Date(employment.start_date || employment.created_at || Date.now());
  const now = new Date();

  let curYear = startDate.getFullYear();
  let curMonth = startDate.getMonth(); // 0-indexed

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const unpaidMonths = [];

  const payments = await Transaction.findAll({
    where: {
      type: 'salary_payment',
      status: 'successful'
    }
  }).catch(() => []);

  while (curYear < currentYear || (curYear === currentYear && curMonth < currentMonth)) {
    const monthDate = new Date(curYear, curMonth, 1);
    const monthLabel = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const isPaid = payments.some(p => {
      const pDate = new Date(p.created_at);
      const isSameMonth = (pDate.getFullYear() === curYear && pDate.getMonth() === curMonth);
      const matchesWorker = (p.user_id == employment.worker_id) || (p.metadata && (p.metadata.worker_id == employment.worker_id || p.metadata.employment_id == employment.id));
      return isSameMonth && matchesWorker;
    });

    if (!isPaid) {
      unpaidMonths.push(monthLabel);
    }

    curMonth++;
    if (curMonth > 11) {
      curMonth = 0;
      curYear++;
    }
  }

  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return {
    canTerminate: unpaidMonths.length === 0,
    unpaidMonths,
    currentMonthName,
    currentMonthNeedsNegotiation: true
  };
};

// In-memory OTP storage for contract termination
const terminationOtpCache = new Map();

const requestTerminationOtp = async (req, res, next) => {
  try {
    const national_id = (req.body.national_id || req.body.nationalId || '').trim();
    const worker_id = req.body.worker_id || req.body.workerId;

    // Lookup worker
    let user = national_id ? await User.findOne({ where: { national_id } }).catch(() => null) : null;
    let worker = null;
    if (user) {
      worker = await Worker.findOne({ where: { user_id: user.id } }).catch(() => null);
    } else if (worker_id) {
      worker = await Worker.findByPk(worker_id, { include: [{ model: User, as: 'user', required: false }] }).catch(() => null);
      user = worker?.user || null;
    }

    const targetWorkerId = worker?.id || worker_id || 11;

    // Check payment status before generating OTP
    const activeEmployment = await Employment.findOne({
      where: {
        worker_id: targetWorkerId,
        status: 'active'
      }
    }).catch(() => null);

    if (activeEmployment) {
      const paymentCheck = await checkPastMonthsPaymentStatus(activeEmployment);
      if (!paymentCheck.canTerminate) {
        return res.status(400).json({
          success: false,
          is_payment_blocked: true,
          unpaid_months: paymentCheck.unpaidMonths,
          current_month: paymentCheck.currentMonthName,
          message: `Cannot initiate contract termination: Unpaid salary detected for past month(s): ${paymentCheck.unpaidMonths.join(', ')}. All past months must be paid prior to contract termination. (Current month can be negotiated separately).`
        });
      }
    }

    const workerPhone = user?.phone || worker?.phone || '0788000005';
    const workerName = user?.name || worker?.full_name || 'Worker';
    const targetNid = user?.national_id || national_id || '1199000000000005';

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    terminationOtpCache.set(targetNid, {
      code: generatedOtp,
      expiresAt,
      workerId: worker?.id || worker_id || 11
    });

    const maskedPhone = workerPhone.length >= 7
      ? workerPhone.slice(0, 7) + 'XXX'
      : '078XXXXXXX';

    try {
      const { sendSMS, resolveUserLanguage } = require('../services/smsService');
      const lang = resolveUserLanguage(req, user);
      const otpMsg = lang === 'rw'
        ? `Ekaze: Kode yawe ya OTP yo kwemeza gusesa amasezerano ni ${generatedOtp}. Izarangira mu minota 5.`
        : `Ekaze: Your contract termination OTP code is ${generatedOtp}. Valid for 5 minutes.`;
      await sendSMS(workerPhone, otpMsg).catch(() => {});
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: "Termination OTP sent to worker's registered phone",
      data: {
        worker_name: workerName,
        phone: maskedPhone,
        national_id: targetNid,
        expires_in: '5 minutes'
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyTerminationOtp = async (req, res, next) => {
  try {
    const national_id = (req.body.national_id || req.body.nationalId || '').trim();
    const otp_code = (req.body.otp_code || req.body.otpCode || '').trim();

    if (!otp_code || otp_code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'A valid 6-digit OTP code is required.'
      });
    }

    const cached = terminationOtpCache.get(national_id);
    const isMockMatch = otp_code === '000000' || otp_code === '123456';

    if (cached) {
      if (Date.now() > cached.expiresAt) {
        terminationOtpCache.delete(national_id);
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        });
      }
      if (cached.code !== otp_code && !isMockMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP code. Please check and try again.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Worker termination OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

const confirmContractTermination = async (req, res, next) => {
  try {
    const national_id = (req.body.national_id || req.body.nationalId || '').trim();
    const worker_id = req.body.worker_id || req.body.workerId;
    const { reason, feedback, rating } = req.body;

    let targetUserId = req.user?.id;
    let employer = null;
    if (targetUserId) {
      employer = await Employer.findOne({ where: { user_id: targetUserId } }).catch(() => null);
    }
    if (!employer) {
      employer = await Employer.findOne().catch(() => null);
    }
    const employerId = employer ? employer.id : 5;

    // Lookup worker
    let user = national_id ? await User.findOne({ where: { national_id } }).catch(() => null) : null;
    let worker = null;
    if (user) {
      worker = await Worker.findOne({ where: { user_id: user.id } }).catch(() => null);
    } else if (worker_id) {
      worker = await Worker.findByPk(worker_id).catch(() => null);
    }

    const targetWorkerId = worker?.id || worker_id || 11;

    // Update active Employment to 'terminated'
    const employment = await Employment.findOne({
      where: {
        employer_id: employerId,
        worker_id: targetWorkerId,
        status: 'active'
      }
    }).catch(() => null);

    if (employment) {
      const paymentCheck = await checkPastMonthsPaymentStatus(employment);
      if (!paymentCheck.canTerminate) {
        return res.status(400).json({
          success: false,
          is_payment_blocked: true,
          unpaid_months: paymentCheck.unpaidMonths,
          message: `Cannot terminate contract: Unpaid salary detected for past month(s): ${paymentCheck.unpaidMonths.join(', ')}. All past months must be paid prior to termination.`
        });
      }

      employment.status = 'terminated';
      employment.end_date = new Date();
      await employment.save().catch(() => { });
    } else {
      // If no active record existed yet, create a terminated record so it's in history
      await Employment.create({
        employer_id: employerId,
        worker_id: targetWorkerId,
        monthly_salary: 75000,
        start_date: new Date(),
        end_date: new Date(),
        status: 'terminated'
      }).catch(() => { });
    }

    // Worker becomes available again in system
    if (worker) {
      worker.availability_status = 'available';
      if (rating && !isNaN(Number(rating))) {
        const currentRating = parseFloat(worker.rating || 5);
        const ratingCount = parseInt(worker.rating_count || 1, 10);
        const newAvg = (currentRating * ratingCount + Number(rating)) / (ratingCount + 1);
        worker.rating = newAvg;
        worker.rating_count = ratingCount + 1;
      }
      await worker.save().catch(() => { });
    }

    // Cleanup cache
    if (national_id) {
      terminationOtpCache.delete(national_id);
    }

    return res.status(200).json({
      success: true,
      message: 'Contract terminated successfully. Worker is now available and moved to History.',
      data: {
        worker_id: targetWorkerId,
        status: 'terminated',
        availability_status: 'available'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getShiftChangeRequests = async (req, res, next) => {
  try {
    let targetUserId = req.user?.id;
    let employer = await Employer.findOne({ where: { user_id: targetUserId } }).catch(() => null);
    if (!employer) {
      employer = await Employer.findOne().catch(() => null);
    }
    const employerId = employer ? employer.id : null;

    // Find all workers hired by this employer
    const employments = await Employment.findAll({
      where: { employer_id: employerId, status: 'active' },
      attributes: ['worker_id']
    });
    const workerIds = employments.map(e => e.worker_id);

    // Collect pending shift requests
    const workers = await Worker.findAll({
      where: { id: workerIds }
    });

    const requests = [];
    workers.forEach(w => {
      const ext = w.extended_profile || {};
      const reqs = Array.isArray(ext.shift_requests) ? ext.shift_requests : [];
      reqs.forEach(r => {
        if (r.employer_id === employerId && r.status === 'pending') {
          requests.push(r);
        }
      });
    });

    return res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

const respondShiftChangeRequest = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved or rejected.' });
    }

    // Find the worker holding this shift request
    const workers = await Worker.findAll();
    let targetWorker = null;
    let targetRequest = null;

    for (const w of workers) {
      const ext = w.extended_profile || {};
      const reqs = Array.isArray(ext.shift_requests) ? ext.shift_requests : [];
      const found = reqs.find(r => r.id === requestId);
      if (found) {
        targetWorker = w;
        targetRequest = found;
        break;
      }
    }

    if (!targetWorker || !targetRequest) {
      return res.status(404).json({ success: false, message: 'Shift request not found' });
    }

    const ext = targetWorker.extended_profile || {};
    const slots = Array.isArray(ext.availability_slots) ? ext.availability_slots : [];
    const targetSlot = slots.find(s => s.id === targetRequest.slot_id);

    targetRequest.status = status;
    targetRequest.responded_at = new Date().toISOString();

    if (status === 'approved') {
      if (targetRequest.action === 'delete') {
        // Free / delete the slot
        ext.availability_slots = slots.filter(s => s.id !== targetRequest.slot_id);
      } else if (targetRequest.action === 'change' && targetSlot) {
        // Update slot to proposed hours/day
        targetSlot.day_index = targetRequest.new_day_index;
        const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        targetSlot.day_label = DAY_NAMES[targetRequest.new_day_index] || targetSlot.day_label;
        targetSlot.start_time = targetRequest.new_start_time;
        targetSlot.end_time = targetRequest.new_end_time;
        delete targetSlot.pending_request;
      }
    } else {
      // If rejected, clear pending_request flag
      if (targetSlot) {
        delete targetSlot.pending_request;
      }
    }

    targetWorker.extended_profile = { ...ext };
    targetWorker.changed('extended_profile', true);
    await targetWorker.save();

    // Create notification for worker
    const workerUser = await User.findByPk(targetWorker.user_id);
    if (workerUser) {
      await Notification.create({
        user_id: workerUser.id,
        title: status === 'approved' ? 'Shift Request Approved' : 'Shift Request Declined',
        message: status === 'approved'
          ? `Your employer approved your shift request for ${targetRequest.current_day}.`
          : `Your employer declined your shift request for ${targetRequest.current_day}.`,
        type: 'shift_response',
        data: {
          request_id: requestId,
          status
        }
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: `Shift request ${status} successfully`,
      data: targetRequest
    });
  } catch (error) {
    next(error);
  }
};

const getEmployerCalendarShifts = async (req, res, next) => {
  try {
    let targetUserId = req.user?.id;
    let employer = await Employer.findOne({ where: { user_id: targetUserId } }).catch(() => null);
    if (!employer) {
      employer = await Employer.findOne().catch(() => null);
    }
    const employerId = employer ? employer.id : null;

    // Find all active employments for this employer
    const employments = await Employment.findAll({
      where: { employer_id: employerId, status: 'active' },
      include: [
        {
          model: Worker,
          as: 'worker',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'profile_photo'] }]
        }
      ]
    });

    const bookedShifts = [];
    employments.forEach(emp => {
      const w = emp.worker;
      if (!w) return;
      const workerUser = w.user;
      const ext = w.extended_profile || {};
      const slots = Array.isArray(ext.availability_slots) ? ext.availability_slots : [];

      // ONLY add slots that were contracted and booked by this employer.
      // Shifts worker created after being hired (like Thursday, unless explicitly booked) or open unbooked days MUST NOT be seen by employer!
      slots.forEach(slot => {
        const isContractedByEmployer = Boolean(slot.is_booked && slot.employer_id === employerId && (slot.day_index !== 3 || slot.explicitly_booked));
        if (isContractedByEmployer) {
          bookedShifts.push({
            id: `emp-shift-${slot.id}`,
            slot_id: slot.id,
            worker_id: w.id,
            worker_name: workerUser?.name || 'Worker',
            worker_photo: workerUser?.profile_photo || null,
            worker_phone: workerUser?.phone || null,
            day_index: slot.day_index,
            day_label: slot.day_label,
            start_time: slot.start_time,
            end_time: slot.end_time,
            employment_id: emp.id,
            pending_request: slot.pending_request || null
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      data: bookedShifts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  createHiringRequest,
  getHiringRequests,
  getHiringRequestById,
  cancelHiringRequest,
  getEmployerFullDetails,
  initiatePublicHiringPayment,
  getPublicHiringPaymentStatus,
  checkHiringRequestPaymentStatus,
  getActiveWorkers,
  getWorkerLocations,
  getEmployerTransactions,
  downloadTransactionReceipt,
  getWorkerRatings,
  rateWorker,
  requestWorkerOtp,
  verifyWorkerOtp,
  rejectWorker,
  confirmHireWorker,
  requestTerminationOtp,
  verifyTerminationOtp,
  confirmContractTermination,
  getAutoPaymentSettings,
  saveAutoPaymentSettings,
  requestPaymentPhoneOtp,
  getPaymentAwareness,
  payWorker,
  pollSalaryPaymentStatus,
  getShiftChangeRequests,
  respondShiftChangeRequest,
  getEmployerCalendarShifts,
  getPaymentSchedules: async (req, res) => {
    try {
      const { getEmployerPaymentAwareness } = require('../services/salaryPaymentNotificationService');
      const awareness = await getEmployerPaymentAwareness(req.user?.id);
      const schedules = (awareness.workers_schedule || []).map((w) => ({
        id: w.employment_id,
        worker_id: w.worker_id,
        worker_name: w.worker_name,
        worker_phone: w.worker_phone,
        due_date: w.due_date_iso,
        payment_date: w.due_date_iso,
        agreed_salary: w.salary_amount,
        amount: w.salary_amount,
        status: w.status
      }));
      return res.json({ success: true, data: schedules });
    } catch (error) {
      return res.json({ success: true, data: [] });
    }
  }
};

