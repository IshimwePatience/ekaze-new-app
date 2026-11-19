const { Op, Sequelize } = require('sequelize');
const {
  User,
  Worker,
  Employer,
  Company,
  Incident,
  Transaction,
  HiringRequest,
  Employment,
  Supervisor,
  Police,
} = require('../models');

/**
 * Strict Role-Based Global Search
 * Rules:
 * 1. Employer: can ONLY search and get workers they paid for or hired (via Employment or paid HiringRequest), nothing else.
 * 2. Admin: ONLY role that can search any User across the entire platform, filtering to that user on navigation.
 * 3. District (Supervisor/Police): can search workers and employers who hired those workers strictly in their own assigned district.
 * 4. Worker: can search only their own employment contracts and incidents.
 */
const globalSearch = async (req, res, next) => {
  try {
    const rawQuery = (req.query.q || req.query.search || '').trim();
    if (!rawQuery) {
      return res.status(200).json({
        success: true,
        count: 0,
        results: [],
        message: 'Empty query provided'
      });
    }

    const q = rawQuery;
    const role = (req.user?.role || 'employer').toLowerCase();
    const userId = req.user?.id;
    const results = [];
    const matchOp = Op.iLike;

    // ─────────────────────────────────────────────────────────────
    // 1. EMPLOYER ROLE SEARCH
    // Allowed to search and get ONLY workers they paid for or hired!
    // ─────────────────────────────────────────────────────────────
    if (role === 'employer') {
      const employerProfile = await Employer.findOne({ where: { user_id: userId } });
      const employerId = employerProfile?.id;

      if (employerId) {
        const foundWorkerIds = new Set();

        // A. Search Workers currently or previously hired via Employment table
        try {
          const employments = await Employment.findAll({
            where: { employer_id: employerId },
            include: [
              {
                model: Worker,
                as: 'worker',
                required: true,
                include: [
                  {
                    model: User,
                    as: 'user',
                    required: true,
                    where: {
                      [Op.or]: [
                        { name: { [matchOp]: `%${q}%` } },
                        { phone: { [matchOp]: `%${q}%` } },
                        { district: { [matchOp]: `%${q}%` } },
                      ]
                    },
                    attributes: ['id', 'name', 'phone', 'district', 'profile_photo']
                  }
                ],
                attributes: ['id', 'experience_level', 'availability_status']
              }
            ],
            limit: 6
          });

          employments.forEach((emp) => {
            const w = emp.worker;
            const u = w?.user;
            if (w && !foundWorkerIds.has(w.id)) {
              foundWorkerIds.add(w.id);
              results.push({
                id: `hired-worker-${w.id}`,
                title: u?.name || 'Hired Worker',
                desc: `Hired Worker • ${u?.district || 'Household'} • Salary: ${emp.monthly_salary ? Number(emp.monthly_salary).toLocaleString() + ' RWF' : 'Active'}`,
                path: `/employer?tab=active&workerId=${w.id}`,
                category: 'My Hired Workers',
                type: 'worker',
              });
            }
          });
        } catch (err) {
          console.warn('Employer employment search notice:', err.message);
        }

        // B. Search Workers the employer has paid for or contracted via HiringRequest
        try {
          const paidRequests = await HiringRequest.findAll({
            where: {
              employer_id: employerId,
              [Op.or]: [
                { fee_paid: true },
                { status: 'accepted' },
                { status: 'completed' },
              ]
            },
            include: [
              {
                model: Worker,
                as: 'worker',
                required: true,
                include: [
                  {
                    model: User,
                    as: 'user',
                    required: true,
                    where: {
                      [Op.or]: [
                        { name: { [matchOp]: `%${q}%` } },
                        { phone: { [matchOp]: `%${q}%` } },
                      ]
                    },
                    attributes: ['id', 'name', 'phone', 'district', 'profile_photo']
                  }
                ],
                attributes: ['id', 'experience_level']
              }
            ],
            limit: 6
          });

          paidRequests.forEach((reqItem) => {
            const w = reqItem.worker;
            const u = w?.user;
            if (w && !foundWorkerIds.has(w.id)) {
              foundWorkerIds.add(w.id);
              results.push({
                id: `paid-worker-${w.id}`,
                title: u?.name || 'Contracted Worker',
                desc: `Paid Placement • ${u?.district || 'Domestic'} • Offered: ${reqItem.offered_salary ? Number(reqItem.offered_salary).toLocaleString() + ' RWF' : 'Contracted'}`,
                path: `/employer?tab=active&workerId=${w.id}`,
                category: 'Paid & Contracted Workers',
                type: 'worker',
              });
            }
          });
        } catch (err) {
          console.warn('Employer paid requests search notice:', err.message);
        }

        // C. Search Employer's Hiring Contracts by notes or status
        try {
          const hiringRequests = await HiringRequest.findAll({
            where: {
              employer_id: employerId,
              [Op.or]: [
                { notes: { [matchOp]: `%${q}%` } },
                Sequelize.where(Sequelize.cast(Sequelize.col('HiringRequest.status'), 'text'), { [matchOp]: `%${q}%` })
              ]
            },
            limit: 5,
            include: [
              {
                model: Worker,
                as: 'worker',
                include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }]
              }
            ]
          });

          hiringRequests.forEach((hr) => {
            const workerName = hr.worker?.user?.name || 'Worker Contract';
            results.push({
              id: `contract-${hr.id}`,
              title: `Contract #${hr.id}: ${workerName}`,
              desc: `Status: ${hr.status?.toUpperCase() || 'PENDING'} • Fee Paid: ${hr.fee_paid ? 'Yes' : 'No'}`,
              path: `/employer?tab=request`,
              category: 'My Hiring Requests',
              type: 'contract',
            });
          });
        } catch (err) {
          console.warn('Employer contract search notice:', err.message);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. ADMIN ROLE SEARCH
    // ONLY role allowed to search any User across the entire platform
    // ─────────────────────────────────────────────────────────────
    else if (role === 'admin') {
      // Search Any User on the Platform
      try {
        const users = await User.findAll({
          where: {
            [Op.or]: [
              { name: { [matchOp]: `%${q}%` } },
              { email: { [matchOp]: `%${q}%` } },
              { phone: { [matchOp]: `%${q}%` } },
              { national_id: { [matchOp]: `%${q}%` } },
            ]
          },
          limit: 6,
          attributes: ['id', 'name', 'email', 'role', 'status', 'district']
        });

        users.forEach((u) => {
          results.push({
            id: `admin-user-${u.id}`,
            title: u.name || u.email || `User #${u.id}`,
            desc: `Role: ${u.role?.toUpperCase()} • Email: ${u.email || 'N/A'} • District: ${u.district || 'Rwanda'}`,
            path: `/admin?tab=users&search=${encodeURIComponent(u.name || u.email || '')}`,
            category: 'User Accounts (IAM)',
            type: 'user',
          });
        });
      } catch (err) {
        console.warn('Admin user search notice:', err.message);
      }

      // Search Companies
      try {
        const companies = await Company.findAll({
          where: {
            [Op.or]: [
              { company_name: { [matchOp]: `%${q}%` } },
              { tin_number: { [matchOp]: `%${q}%` } },
              { contact_person: { [matchOp]: `%${q}%` } },
            ]
          },
          limit: 4,
          attributes: ['id', 'company_name', 'tin_number', 'verification_status']
        });

        companies.forEach((c) => {
          results.push({
            id: `admin-comp-${c.id}`,
            title: c.company_name || 'Staffing Agency',
            desc: `TIN: ${c.tin_number || 'N/A'} • Status: ${c.verification_status || 'Active'}`,
            path: `/admin?tab=companies`,
            category: 'Staffing Agencies',
            type: 'company',
          });
        });
      } catch (err) {
        console.warn('Admin company search notice:', err.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. DISTRICT SUPERVISOR & POLICE SEARCH
    // Strictly search Workers and Employers who hired those workers in their own District
    // ─────────────────────────────────────────────────────────────
    else if (role === 'supervisor' || role === 'police') {
      let assignedDistrict = req.user?.district;

      if (role === 'supervisor') {
        const sup = await Supervisor.findOne({ where: { user_id: userId } });
        if (sup?.assigned_district) assignedDistrict = sup.assigned_district;
      } else if (role === 'police') {
        const pol = await Police.findOne({ where: { user_id: userId } });
        if (pol?.jurisdiction_district) assignedDistrict = pol.jurisdiction_district;
      }

      const districtName = assignedDistrict || 'Kigali';

      // A. Search Domestic Workers registered or located in this District
      try {
        const districtWorkers = await Worker.findAll({
          include: [
            {
              model: User,
              as: 'user',
              required: true,
              where: {
                district: { [matchOp]: `%${districtName}%` },
                [Op.or]: [
                  { name: { [matchOp]: `%${q}%` } },
                  { phone: { [matchOp]: `%${q}%` } },
                  { national_id: { [matchOp]: `%${q}%` } },
                ]
              },
              attributes: ['id', 'name', 'phone', 'district', 'sector', 'national_id', 'profile_photo']
            }
          ],
          limit: 5,
          attributes: ['id', 'experience_level', 'availability_status']
        });

        districtWorkers.forEach((w) => {
          const u = w.user;
          results.push({
            id: `dist-worker-${w.id}`,
            title: `${u?.name || 'Worker'} (District: ${u?.district || districtName})`,
            desc: `Phone: ${u?.phone || 'N/A'} • Sector: ${u?.sector || 'Local'} • NID: ${u?.national_id || 'Verified'}`,
            path: `/${role}?tab=workers&workerId=${w.id}`,
            category: `Workers in ${districtName}`,
            type: 'worker',
          });
        });
      } catch (err) {
        console.warn('District worker search notice:', err.message);
      }

      // B. Search Employers who hired workers in this District
      try {
        const districtEmployments = await Employment.findAll({
          include: [
            {
              model: Worker,
              as: 'worker',
              required: true,
              include: [
                {
                  model: User,
                  as: 'user',
                  required: true,
                  where: { district: { [matchOp]: `%${districtName}%` } },
                  attributes: ['id', 'name', 'district']
                }
              ]
            },
            {
              model: Employer,
              as: 'employer',
              required: true,
              include: [
                {
                  model: User,
                  as: 'user',
                  required: true,
                  where: {
                    [Op.or]: [
                      { name: { [matchOp]: `%${q}%` } },
                      { phone: { [matchOp]: `%${q}%` } },
                      { district: { [matchOp]: `%${q}%` } },
                    ]
                  },
                  attributes: ['id', 'name', 'phone', 'district', 'profile_photo']
                }
              ],
              attributes: ['id', 'company_name']
            }
          ],
          limit: 5
        });

        const seenEmployerIds = new Set();
        districtEmployments.forEach((emp) => {
          const employer = emp.employer;
          const u = employer?.user;
          const wUser = emp.worker?.user;
          if (employer && !seenEmployerIds.has(employer.id)) {
            seenEmployerIds.add(employer.id);
            results.push({
              id: `dist-emp-${employer.id}`,
              title: `${u?.name || employer.company_name || 'Employer'} (Hired in ${districtName})`,
              desc: `Employer Contact: ${u?.phone || 'N/A'} • Hired Worker: ${wUser?.name || 'Staff'} • Salary: ${emp.monthly_salary ? Number(emp.monthly_salary).toLocaleString() + ' RWF' : 'Active'}`,
              path: `/${role}?tab=inspections&employerId=${employer.id}`,
              category: `Employers in ${districtName}`,
              type: 'employer',
            });
          }
        });
      } catch (err) {
        console.warn('District employer employment search notice:', err.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. WORKER ROLE SEARCH
    // Strictly search own contracts and incident reports
    // ─────────────────────────────────────────────────────────────
    else if (role === 'worker') {
      const workerProfile = await Worker.findOne({ where: { user_id: userId } });
      const workerId = workerProfile?.id;

      if (workerId) {
        // A. Search Worker's Contracts
        try {
          const contracts = await HiringRequest.findAll({
            where: {
              worker_id: workerId,
              [Op.or]: [
                { notes: { [matchOp]: `%${q}%` } },
                Sequelize.where(Sequelize.cast(Sequelize.col('HiringRequest.status'), 'text'), { [matchOp]: `%${q}%` })
              ]
            },
            include: [
              {
                model: Employer,
                as: 'employer',
                include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }]
              }
            ],
            limit: 5
          });

          contracts.forEach((c) => {
            const empName = c.employer?.user?.name || c.employer?.company_name || 'Household Employer';
            results.push({
              id: `w-contract-${c.id}`,
              title: `Job Contract #${c.id} - ${empName}`,
              desc: `Status: ${c.status?.toUpperCase()} • Wage: ${c.offered_salary ? Number(c.offered_salary).toLocaleString() + ' RWF' : 'N/A'}${c.notes ? ` • "${c.notes.slice(0, 35)}..."` : ''}`,
              path: `/worker?tab=contracts`,
              category: 'My Jobs & Contracts',
              type: 'contract',
            });
          });
        } catch (err) {
          console.warn('Worker contract search notice:', err.message);
        }

        // B. Search Worker's Incidents
        try {
          const incidents = await Incident.findAll({
            where: {
              [Op.or]: [
                { worker_id: workerId },
                { reporter_id: userId }
              ],
              [Op.or]: [
                { title: { [matchOp]: `%${q}%` } },
                { description: { [matchOp]: `%${q}%` } },
                { incident_type: { [matchOp]: `%${q}%` } },
              ]
            },
            limit: 5
          });

          incidents.forEach((inc) => {
            results.push({
              id: `w-inc-${inc.id}`,
              title: inc.title || `Incident #${inc.id}`,
              desc: `Type: ${inc.incident_type || 'General'} • Status: ${inc.status || 'Reported'}`,
              path: `/worker?tab=incidents`,
              category: 'Incident Reports',
              type: 'incident',
            });
          });
        } catch (err) {
          console.warn('Worker incident search notice:', err.message);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. COMPANY ROLE SEARCH
    // Search agency workforce and placement requests
    // ─────────────────────────────────────────────────────────────
    else if (role === 'company') {
      const companyProfile = await Company.findOne({ where: { user_id: userId } });
      const companyId = companyProfile?.id;

      if (companyId) {
        try {
          const companyWorkers = await Worker.findAll({
            where: { company_id: companyId },
            include: [
              {
                model: User,
                as: 'user',
                where: {
                  [Op.or]: [
                    { name: { [matchOp]: `%${q}%` } },
                    { phone: { [matchOp]: `%${q}%` } },
                    { national_id: { [matchOp]: `%${q}%` } },
                  ]
                },
                attributes: ['id', 'name', 'phone', 'national_id', 'profile_photo']
              }
            ],
            limit: 6
          });

          companyWorkers.forEach((w) => {
            const u = w.user;
            results.push({
              id: `c-worker-${w.id}`,
              title: u?.name || `Worker #${w.id}`,
              desc: `NID: ${u?.national_id || 'N/A'} • Status: ${w.availability_status || 'available'}`,
              path: `/company?tab=workers&workerId=${w.id}`,
              category: 'Company Workforce',
              type: 'worker',
            });
          });
        } catch (err) {
          console.warn('Company worker search notice:', err.message);
        }

        try {
          const hiringRequests = await HiringRequest.findAll({
            where: {
              company_id: companyId,
              [Op.or]: [
                { notes: { [matchOp]: `%${q}%` } },
                Sequelize.where(Sequelize.cast(Sequelize.col('HiringRequest.status'), 'text'), { [matchOp]: `%${q}%` })
              ]
            },
            limit: 5
          });

          hiringRequests.forEach((hr) => {
            results.push({
              id: `c-hr-${hr.id}`,
              title: `Placement Order #${hr.id}`,
              desc: `Status: ${hr.status?.toUpperCase()} • Offered: ${hr.offered_salary || 'N/A'} RWF`,
              path: `/company?tab=requests`,
              category: 'Placement Orders',
              type: 'order',
            });
          });
        } catch (err) {
          console.warn('Company request search notice:', err.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      role: role,
      count: results.length,
      results: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch
};
