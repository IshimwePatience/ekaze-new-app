const { User, Worker, Company, Employer, Incident, Employment, Supervisor } = require('../models');
const { Op } = require('sequelize');

const getSupervisorDashboard = async (req, res, next) => {
  try {
    const supervisorDistrict = req.user?.district || 'Gasabo';
    const districtLower = supervisorDistrict.toLowerCase();

    // 1. Incidents in this district
    const incidentWhere = {
      [Op.or]: [
        { district: { [Op.iLike]: `%${supervisorDistrict}%` } },
        { incident_location: { [Op.iLike]: `%${supervisorDistrict}%` } }
      ]
    };

    const totalIncidents = await Incident.count({ where: incidentWhere }).catch(() => 0);
    const activeIncidents = await Incident.count({
      where: {
        ...incidentWhere,
        status: { [Op.in]: ['reported', 'investigating', 'under_investigation', 'pending'] }
      }
    }).catch(() => 0);
    const resolvedIncidents = await Incident.count({
      where: {
        ...incidentWhere,
        status: { [Op.in]: ['resolved', 'closed'] }
      }
    }).catch(() => 0);

    const recentIncidents = await Incident.findAll({
      where: incidentWhere,
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'incident_type', 'status', 'severity', 'created_at', 'location', 'incident_location']
    }).catch(() => []);

    // 2. Workforce in this district
    const allWorkers = await Worker.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'district', 'sector', 'address']
        },
        {
          model: Employment,
          as: 'employments',
          required: false,
          include: [{ model: Employer, as: 'employer', include: [{ model: User, as: 'user', attributes: ['id', 'district'] }] }]
        }
      ]
    }).catch(() => []);

    const districtWorkers = allWorkers.filter(w => {
      const u = w.user;
      if (!u) return false;
      const userDist = (u.district || '').toLowerCase();
      const userAddr = (u.address || '').toLowerCase();
      const userSec = (u.sector || '').toLowerCase();
      
      const inUserDistrict = userDist.includes(districtLower) || userAddr.includes(districtLower) || userSec.includes(districtLower);
      
      const inEmployerDistrict = (w.employments || []).some(emp => {
        const empDist = (emp.employer?.user?.district || emp.employer?.district || '').toLowerCase();
        return empDist.includes(districtLower);
      });

      return inUserDistrict || inEmployerDistrict;
    });

    let hiredCount = 0;
    let terminatedCount = 0;

    districtWorkers.forEach(w => {
      const emps = w.employments || [];
      const hasActive = emps.some(e => e.status === 'active') || w.availability_status === 'hired';
      const hasTerminated = !hasActive && emps.some(e => e.status === 'terminated' || e.status === 'completed');

      if (hasActive) {
        hiredCount++;
      } else if (hasTerminated) {
        terminatedCount++;
      }
    });

    return res.status(200).json({
      success: true,
      district: supervisorDistrict,
      data: {
        district: supervisorDistrict,
        incidents: {
          total: totalIncidents,
          active: activeIncidents,
          resolved: resolvedIncidents,
          recent: recentIncidents
        },
        workforce: {
          total: districtWorkers.length,
          hired: hiredCount,
          terminated: terminatedCount
        },
        statistics: {
          district_incidents: totalIncidents,
          active_incidents: activeIncidents,
          resolved_incidents: resolvedIncidents,
          hired_workforce: hiredCount,
          terminated_contracts: terminatedCount,
          total_district_workforce: districtWorkers.length,
          // Legacy mappings for backwards compatibility
          users: { total: districtWorkers.length, new_this_month: 0 },
          sessions: { active: activeIncidents, change: 0 },
          revenue: { formatted_total: `${hiredCount} Hired`, formatted_month: `${terminatedCount} Terminated` },
          system_health: { percentage: 100, change: 0 }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSupervisorProfileDetails = async (req, res, next) => {
  try {
    let supervisor = null;
    try {
      if (Supervisor) {
        supervisor = await Supervisor.findOne({
          where: { user_id: req.user.id },
          include: [{ model: User, as: 'user' }]
        });
      }
    } catch (e) {
      // Ignore DB lookup error and use req.user fallback
    }

    return res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role || 'supervisor',
        province: req.user.province || 'Kigali City',
        district: req.user.district || 'Gasabo',
        sector: req.user.sector || 'Remera',
        assigned_district: supervisor?.assigned_district || req.user.district || 'Gasabo',
        assigned_province: supervisor?.assigned_province || req.user.province || 'Kigali City',
        user: req.user,
        supervisor: supervisor
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDistrictWorkers = async (req, res, next) => {
  try {
    const { User, Worker, Company, Employer, Employment, Supervisor } = require('../models');
    const { Op } = require('sequelize');

    const supervisorDistrict = req.user?.district || 'Gasabo';
    const { search, employment_type, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * pageSize;

    const workerWhere = {};
    if (employment_type === 'freelance') {
      workerWhere.company_id = null;
    } else if (employment_type === 'company') {
      workerWhere.company_id = { [Op.ne]: null };
    }

    const allWorkers = await Worker.findAll({
      where: workerWhere,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'national_id', 'profile_photo', 'gender', 'province', 'district', 'sector', 'cell', 'village', 'status', 'is_verified']
        },
        {
          model: Company,
          as: 'company',
          required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email'] }]
        },
        {
          model: Employment,
          as: 'employments',
          required: false,
          include: [{ model: Employer, as: 'employer', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email'] }] }]
        }
      ],
      order: [['created_at', 'DESC']]
    }).catch(err => {
      console.error('Error fetching district workers:', err);
      return [];
    });

    const districtLower = (supervisorDistrict || 'Gasabo').toLowerCase();

    // Strictly match workers in this supervisor's district
    const districtWorkers = allWorkers.filter(w => {
      const u = w.user;
      if (!u) return false;
      const userDist = (u.district || '').toLowerCase();
      const userAddr = (u.address || '').toLowerCase();
      const userSec = (u.sector || '').toLowerCase();
      
      const inUserDistrict = userDist.includes(districtLower) || userAddr.includes(districtLower) || userSec.includes(districtLower);
      
      const inEmployerDistrict = (w.employments || []).some(emp => {
        const empDist = (emp.employer?.user?.district || emp.employer?.district || '').toLowerCase();
        return empDist.includes(districtLower);
      });

      return inUserDistrict || inEmployerDistrict;
    });

    // Apply search filter
    const searchFiltered = districtWorkers.filter(w => {
      if (!search || !search.trim()) return true;
      const s = search.trim().toLowerCase();
      const name = (w.user?.name || '').toLowerCase();
      const phone = (w.user?.phone || '').toLowerCase();
      const email = (w.user?.email || '').toLowerCase();
      const nid = (w.user?.national_id || '').toLowerCase();
      return name.includes(s) || phone.includes(s) || email.includes(s) || nid.includes(s);
    });

    const activeTab = req.query.tab === 'terminated' ? 'terminated' : 'hired';

    const formattedAll = searchFiltered.map((w) => {
      const isFreelance = !w.company_id || !w.company;
      const companyUser = w.company?.user;
      const companyPhone = companyUser?.phone || w.company?.registration_number || 'N/A';

      const employments = (w.employments || []).map((emp) => ({
        id: emp.id,
        status: emp.status,
        monthly_salary: emp.monthly_salary,
        start_date: emp.start_date,
        end_date: emp.end_date,
        employer_name: emp.employer?.company_name || emp.employer?.user?.name || 'Assigned Employer',
        employer_phone: emp.employer?.user?.phone || emp.employer?.emergency_contact || 'N/A',
        employer_type: emp.employer?.employer_type || 'individual'
      }));

      // Active contract
      const hasActive = employments.some(e => e.status === 'active') || w.availability_status === 'hired';
      
      // Contract terminated: must have an employment with status 'terminated' or 'completed' and not currently active
      const hasTerminated = !hasActive && employments.some(e => e.status === 'terminated' || e.status === 'completed');

      let contractStatus = 'none';
      if (hasActive) {
        contractStatus = 'hired';
      } else if (hasTerminated) {
        contractStatus = 'terminated';
      }

      return {
        id: w.id,
        worker_id: w.id,
        user_id: w.user?.id || w.user_id,
        name: w.user?.name || 'Unnamed Worker',
        email: w.user?.email || 'N/A',
        phone: w.user?.phone || 'N/A',
        national_id: w.user?.national_id || 'N/A',
        profile_photo: w.user?.profile_photo || null,
        gender: w.user?.gender || 'N/A',
        district: w.user?.district || supervisorDistrict,
        sector: w.user?.sector || 'Remera',
        cell: w.user?.cell || '',
        village: w.user?.village || '',
        skills: w.skills || ['General Labor'],
        professions: w.professions || [],
        experience_years: w.experience_years || 2,
        contract_status: contractStatus,
        availability_status: contractStatus,
        user_status: w.user?.status || 'active',
        is_verified: w.user?.is_verified ?? true,
        is_freelance: isFreelance,
        employment_type: isFreelance ? 'freelance' : 'company',
        company: isFreelance ? null : {
          id: w.company.id,
          name: w.company.company_name,
          registration_number: w.company.registration_number,
          tin_number: w.company.tin_number,
          phone: companyPhone,
          contact_person: w.company.contact_person
        },
        assigned_employers: employments
      };
    });

    const hiredWorkers = formattedAll.filter(w => w.contract_status === 'hired');
    const terminatedWorkers = formattedAll.filter(w => w.contract_status === 'terminated');

    const targetWorkers = activeTab === 'terminated' ? terminatedWorkers : hiredWorkers;
    const pagedWorkers = targetWorkers.slice(offset, offset + pageSize);

    return res.status(200).json({
      success: true,
      district: supervisorDistrict,
      active_tab: activeTab,
      counts: {
        hired: hiredWorkers.length,
        terminated: terminatedWorkers.length
      },
      data: pagedWorkers,
      pagination: {
        total: targetWorkers.length,
        current_page: pageNum,
        per_page: pageSize,
        last_page: Math.ceil(targetWorkers.length / pageSize) || 1,
        from: targetWorkers.length > 0 ? offset + 1 : 0,
        to: Math.min(offset + pageSize, targetWorkers.length)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupervisorDashboard,
  getSupervisorProfileDetails,
  getDistrictWorkers
};
