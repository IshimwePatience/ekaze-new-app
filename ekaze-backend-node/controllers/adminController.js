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

module.exports = {
  getAdminDashboard
};
