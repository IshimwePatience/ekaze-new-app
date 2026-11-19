const { User, Company, Worker, Employer, Employment, Transaction, Incident } = require('../models');
const { Op } = require('sequelize');

const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.count() || 0;
    const workersCount = await User.count({ where: { role: 'worker' } }) || 0;
    const employersCount = await User.count({ where: { role: 'employer' } }) || 0;
    const companiesCount = await Company.count() || 0;
    const supervisorsCount = await User.count({ where: { role: 'supervisor' } }) || 0;
    const policeCount = await User.count({ where: { role: 'police' } }) || 0;
    const adminsCount = await User.count({ where: { role: 'admin' } }) || 0;
    const activeUsers = await User.count({ where: { status: 'active' } }) || 0;
    const pendingUsers = await User.count({ where: { status: 'pending' } }) || 0;
    const suspendedUsers = await User.count({ where: { status: 'suspended' } }) || 0;

    // Companies stats
    const approvedCompanies = await Company.count({ where: { verification_status: 'approved' } }) || 0;
    const pendingCompanies = await Company.count({ where: { verification_status: 'pending' } }) || 0;
    const rejectedCompanies = await Company.count({ where: { verification_status: 'rejected' } }) || 0;

    // Workers & Employments stats
    const activeEmployments = await Employment.count({ where: { status: 'active' } }).catch(() => 0) || 0;
    const completedEmployments = await Employment.count({ where: { status: 'completed' } }).catch(() => 0) || 0;
    const totalEmployments = await Employment.count().catch(() => 0) || 0;
    const companyRegisteredWorkers = await Worker.count({ where: { company_id: { [Op.ne]: null } } }).catch(() => 0) || 0;
    const nidaVerifiedWorkers = await User.count({ where: { role: 'worker', is_verified: true } }).catch(() => workersCount) || workersCount;
    const insuredWorkers = await Worker.count({ where: { has_insurance: true } }).catch(() => 0) || workersCount;
    const availableWorkers = Math.max(0, workersCount - activeEmployments);

    // Transactions & Revenue stats
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalTransactions = await Transaction.count() || 0;
    const completedTransactions = await Transaction.count({ where: { status: 'successful' } }) || 0;
    const pendingTransactions = await Transaction.count({ where: { status: 'pending' } }) || 0;
    const failedTransactions = await Transaction.count({ where: { status: 'failed' } }) || 0;

    const totalRevenueNum = parseFloat(await Transaction.sum('amount', { where: { status: 'successful' } }) || 0);

    // Admin revenue from company licensing and registration/card fees
    const registrationRevenueNum = parseFloat(await Transaction.sum('amount', {
      where: {
        status: 'successful',
        type: { [Op.in]: ['company_fee', 'card_payment'] }
      }
    }) || 0);

    // Admin revenue from freelance contact access / hiring fees
    const freelanceContactRevenueNum = parseFloat(await Transaction.sum('amount', {
      where: {
        status: 'successful',
        type: { [Op.in]: ['hiring_fee', 'contact_unlock'] }
      }
    }) || 0);

    const todayRevenueNum = parseFloat(await Transaction.sum('amount', {
      where: {
        status: 'successful',
        created_at: { [Op.gte]: startOfToday }
      }
    }) || 0);
    const thisMonthRevenueNum = parseFloat(await Transaction.sum('amount', {
      where: {
        status: 'successful',
        created_at: { [Op.gte]: startOfMonth }
      }
    }) || 0);

    // Incidents stats
    const totalIncidents = await Incident.count() || 0;
    const openIncidents = await Incident.count({ where: { status: 'reported' } }) || 0;
    const investigatingIncidents = await Incident.count({ where: { status: 'under_investigation' } }) || 0;
    const resolvedIncidents = await Incident.count({ where: { status: 'resolved' } }) || 0;
    const closedIncidents = await Incident.count({ where: { status: 'dismissed' } }) || 0;
    const todayIncidents = await Incident.count({
      where: {
        created_at: { [Op.gte]: startOfToday }
      }
    }) || 0;

    // Recent items
    const recentCompanies = await Company.findAll({
      limit: 5,
      order: [['created_at', 'DESC']]
    });
    const recentTransactions = await Transaction.findAll({
      limit: 5,
      order: [['created_at', 'DESC']]
    });
    const recentIncidents = await Incident.findAll({
      limit: 5,
      order: [['created_at', 'DESC']]
    });

    const data = {
      statistics: {
        users: {
          total: totalUsers,
          supervisors: supervisorsCount,
          admins: adminsCount,
          companies: companiesCount,
          employers: employersCount,
          workers: workersCount,
          police: policeCount,
          active: activeUsers,
          pending: pendingUsers,
          suspended: suspendedUsers
        },
        companies: {
          total: companiesCount,
          approved: approvedCompanies,
          pending: pendingCompanies,
          rejected: rejectedCompanies,
          active_today: approvedCompanies
        },
        workers: {
          total: workersCount,
          freelance: Math.max(0, workersCount - companyRegisteredWorkers),
          company_registered: companyRegisteredWorkers,
          available: availableWorkers,
          employed: activeEmployments,
          unavailable: 0,
          nida_verified: nidaVerifiedWorkers,
          with_insurance: insuredWorkers
        },
        employers: {
          total: employersCount,
          paid: employersCount,
          unpaid: 0,
          active_hirers: employersCount
        },
        employments: {
          total: totalEmployments,
          active: activeEmployments,
          completed: completedEmployments,
          average_duration_days: 0
        },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: pendingTransactions,
          failed: failedTransactions,
          total_revenue: totalRevenueNum,
          registration_revenue: registrationRevenueNum,
          freelance_contact_revenue: freelanceContactRevenueNum,
          today_revenue: todayRevenueNum,
          this_month_revenue: thisMonthRevenueNum
        },
        incidents: {
          total: totalIncidents,
          open: openIncidents,
          under_investigation: investigatingIncidents,
          resolved: resolvedIncidents,
          closed: closedIncidents,
          critical: 0,
          reported_today: todayIncidents
        },
        system_usage: {
          total_users: totalUsers,
          active_percentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
          pending_percentage: totalUsers > 0 ? Math.round((pendingUsers / totalUsers) * 100) : 0,
          suspended_percentage: totalUsers > 0 ? Math.round((suspendedUsers / totalUsers) * 100) : 0,
          workers_percentage: totalUsers > 0 ? Math.round((workersCount / totalUsers) * 100) : 0,
          employers_percentage: totalUsers > 0 ? Math.round((employersCount / totalUsers) * 100) : 0,
          companies_percentage: totalUsers > 0 ? Math.round((companiesCount / totalUsers) * 100) : 0,
          officers_percentage: totalUsers > 0 ? Math.round(((supervisorsCount + policeCount) / totalUsers) * 100) : 0,
          admins_percentage: totalUsers > 0 ? Math.round((adminsCount / totalUsers) * 100) : 0,
          worker_nida_verified_percentage: workersCount > 0 ? Math.round((nidaVerifiedWorkers / workersCount) * 100) : 0,
          worker_insured_percentage: workersCount > 0 ? Math.round((insuredWorkers / workersCount) * 100) : 0,
          worker_employed_percentage: workersCount > 0 ? Math.round((activeEmployments / workersCount) * 100) : 0,
          financial_registration_share: totalRevenueNum > 0 ? Math.round((registrationRevenueNum / totalRevenueNum) * 100) : 0,
          financial_freelance_share: totalRevenueNum > 0 ? Math.round((freelanceContactRevenueNum / totalRevenueNum) * 100) : 0,
          incident_resolution_rate: totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0
        }
      },
      recent_activities: {
        recent_companies: recentCompanies,
        recent_workers: [],
        recent_transactions: recentTransactions,
        recent_incidents: recentIncidents
      },
      revenue_breakdown: {},
      workers_by_district: [
        { district: 'Kigali', count: workersCount }
      ]
    };

    return res.status(200).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

const formatAdminTransaction = (tx) => {
  const raw = tx.toJSON ? tx.toJSON() : tx;
  const statusMap = {
    successful: 'completed',
    under_review: 'review'
  };
  return {
    id: raw.id,
    transaction_id: raw.reference_id || `TXN-${raw.id}`,
    payment_reference: raw.reference_id || null,
    user_id: raw.user_id,
    amount: parseFloat(raw.amount || 0),
    fee: parseFloat(raw.fee || 0),
    transaction_type: raw.type || 'other',
    status: statusMap[raw.status] || raw.status || 'pending',
    payment_method: raw.payment_method || 'mobile_money',
    phone_number: raw.phone_number || null,
    description: raw.metadata?.description || raw.type || null,
    failure_reason: raw.metadata?.failure_reason || null,
    metadata: raw.metadata || null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    user: raw.user || null
  };
};

const normalizeStatusFilter = (status) => {
  if (!status || status === 'all') return null;
  if (status === 'completed') return 'successful';
  if (status === 'review') return 'under_review';
  return status;
};

const getAdminTransactions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page, 10) || 10));
    const offset = (page - 1) * perPage;

    const where = {};
    const rawStatus = req.params.status || req.query.status;
    const mappedStatus = normalizeStatusFilter(rawStatus);
    if (mappedStatus && ['pending', 'successful', 'failed', 'under_review'].includes(mappedStatus)) {
      where.status = mappedStatus;
    }
    if (req.query.type && req.query.type !== 'all') {
      where.type = req.query.type;
    }
    if (req.query.payment_method && req.query.payment_method !== 'all') {
      where.payment_method = req.query.payment_method;
    }
    if (req.query.from_date || req.query.to_date) {
      where.created_at = {};
      if (req.query.from_date) where.created_at[Op.gte] = new Date(req.query.from_date);
      if (req.query.to_date) {
        const end = new Date(req.query.to_date);
        end.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = end;
      }
    }
    if (req.query.min_amount || req.query.max_amount) {
      where.amount = {};
      if (req.query.min_amount) where.amount[Op.gte] = parseFloat(req.query.min_amount);
      if (req.query.max_amount) where.amount[Op.lte] = parseFloat(req.query.max_amount);
    }
    if (req.query.search) {
      where[Op.or] = [
        { reference_id: { [Op.iLike]: `%${req.query.search}%` } },
        { phone_number: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    const allowedSortFields = ['created_at', 'amount', 'status', 'id'];
    const sortBy = allowedSortFields.includes(req.query.sort_by) ? req.query.sort_by : 'created_at';
    const sortOrder = String(req.query.sort_order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'profile_photo', 'role', 'status'],
          required: false
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: perPage,
      offset
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalTransactions, totalRevenue, pendingAmount, failedAmount, todayRevenue, thisMonthRevenue] = await Promise.all([
      Transaction.count(),
      Transaction.sum('amount', { where: { status: 'successful' } }),
      Transaction.sum('amount', { where: { status: 'pending' } }),
      Transaction.sum('amount', { where: { status: 'failed' } }),
      Transaction.sum('amount', { where: { status: 'successful', created_at: { [Op.gte]: startOfToday } } }),
      Transaction.sum('amount', { where: { status: 'successful', created_at: { [Op.gte]: startOfMonth } } })
    ]);

    const lastPage = Math.max(1, Math.ceil(count / perPage));

    return res.status(200).json({
      success: true,
      data: {
        data: rows.map(formatAdminTransaction),
        current_page: page,
        total: count,
        last_page: lastPage,
        per_page: perPage,
        from: count > 0 ? offset + 1 : 0,
        to: count > 0 ? Math.min(offset + rows.length, count) : 0
      },
      summary: {
        total_transactions: totalTransactions || 0,
        total_revenue: parseFloat(totalRevenue || 0),
        pending_amount: parseFloat(pendingAmount || 0),
        failed_amount: parseFloat(failedAmount || 0),
        today_revenue: parseFloat(todayRevenue || 0),
        this_month_revenue: parseFloat(thisMonthRevenue || 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminTransactionStatistics = async (req, res, next) => {
  try {
    const allTx = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const revenueByType = {};
    const dailyMap = {};
    const methodMap = {};
    const payerMap = {};
    const statusDistribution = { completed: 0, pending: 0, failed: 0, review: 0 };

    for (const tx of allTx) {
      const amount = parseFloat(tx.amount || 0);
      const mappedStatus = tx.status === 'successful' ? 'completed' : tx.status === 'under_review' ? 'review' : tx.status;
      statusDistribution[mappedStatus] = (statusDistribution[mappedStatus] || 0) + 1;

      const typeKey = tx.type || 'other';
      if (!revenueByType[typeKey]) revenueByType[typeKey] = { count: 0, total: 0 };
      revenueByType[typeKey].count += 1;
      if (tx.status === 'successful') revenueByType[typeKey].total += amount;

      const dateKey = tx.created_at ? new Date(tx.created_at).toISOString().slice(0, 10) : 'unknown';
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, count: 0, total: 0 };
      dailyMap[dateKey].count += 1;
      if (tx.status === 'successful') dailyMap[dateKey].total += amount;

      const methodKey = tx.payment_method || 'other';
      if (!methodMap[methodKey]) methodMap[methodKey] = { payment_method: methodKey, count: 0, total: 0 };
      methodMap[methodKey].count += 1;
      if (tx.status === 'successful') methodMap[methodKey].total += amount;

      if (tx.user_id && tx.status === 'successful') {
        if (!payerMap[tx.user_id]) {
          payerMap[tx.user_id] = {
            user_id: tx.user_id,
            transaction_count: 0,
            total_spent: 0,
            user: {
              name: tx.user?.name || `User #${tx.user_id}`,
              email: tx.user?.email || ''
            }
          };
        }
        payerMap[tx.user_id].transaction_count += 1;
        payerMap[tx.user_id].total_spent += amount;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        revenue_by_type: revenueByType,
        daily_revenue: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
        payment_methods: Object.values(methodMap),
        top_payers: Object.values(payerMap).sort((a, b) => b.total_spent - a.total_spent).slice(0, 10),
        status_distribution: statusDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminTransactionById = async (req, res, next) => {
  try {
    const tx = await Transaction.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'profile_photo', 'role', 'status'],
          required: false
        }
      ]
    });
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    return res.status(200).json({ success: true, data: formatAdminTransaction(tx) });
  } catch (error) {
    next(error);
  }
};

const markAdminTransactionForReview = async (req, res, next) => {
  try {
    const tx = await Transaction.findByPk(req.params.id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    tx.status = 'under_review';
    tx.metadata = { ...(tx.metadata || {}), review_notes: req.body.review_notes || '' };
    await tx.save();
    return res.status(200).json({ success: true, data: formatAdminTransaction(tx), message: 'Transaction marked for review.' });
  } catch (error) {
    next(error);
  }
};

const refundAdminTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findByPk(req.params.id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    tx.status = 'failed';
    tx.metadata = { ...(tx.metadata || {}), refunded: true, refunded_at: new Date().toISOString() };
    await tx.save();
    return res.status(200).json({ success: true, data: formatAdminTransaction(tx), message: 'Transaction refunded.' });
  } catch (error) {
    next(error);
  }
};

const exportAdminTransactions = async (req, res, next) => {
  try {
    const rows = await Transaction.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email'], required: false }],
      order: [['created_at', 'DESC']]
    });

    if (req.query.format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="ekaze-transactions.json"');
      return res.status(200).send(JSON.stringify(rows.map(formatAdminTransaction), null, 2));
    }

    const header = 'ID,Reference,User,Email,Type,Amount,Status,Payment Method,Created At\n';
    const csvRows = rows.map((tx) => {
      const f = formatAdminTransaction(tx);
      return [
        f.id,
        `"${(f.transaction_id || '').replace(/"/g, '""')}"`,
        `"${(f.user?.name || '').replace(/"/g, '""')}"`,
        `"${(f.user?.email || '').replace(/"/g, '""')}"`,
        f.transaction_type,
        f.amount,
        f.status,
        f.payment_method,
        f.created_at ? new Date(f.created_at).toISOString() : ''
      ].join(',');
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ekaze-transactions.csv"');
    return res.status(200).send(header + csvRows.join('\n'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getAdminTransactions,
  getAdminTransactionStatistics,
  getAdminTransactionById,
  markAdminTransactionForReview,
  refundAdminTransaction,
  exportAdminTransactions
};
