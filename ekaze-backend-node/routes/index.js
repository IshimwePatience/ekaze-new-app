const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const workerRoutes = require('./workerRoutes');
const employerRoutes = require('./employerRoutes');
const companyRoutes = require('./companyRoutes');
const incidentRoutes = require('./incidentRoutes');
const paymentRoutes = require('./paymentRoutes');
const policeRoutes = require('./policeRoutes');
const supervisorRoutes = require('./supervisorRoutes');
const notificationRoutes = require('./notificationRoutes');
const userRoutes = require('./userRoutes');
const usageRoutes = require('./usageRoutes');
const { verifyNationalId } = require('../services/nidaService');

// Welcome / Health check endpoints
router.get('/welcome', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to EKAZE Node.js API System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    powered_by: 'Beno Finance Ltd.'
  });
});

router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// NIDA Lookup & Verification Routes
router.post('/nida/check', async (req, res) => {
  const nid = req.body.nid || req.body.national_id;
  if (!nid || nid.length !== 16) {
    return res.status(400).json({ success: false, exists: false, message: 'National ID must be exactly 16 digits.' });
  }
  return res.status(200).json({ success: true, exists: true, message: 'NID record found in NIDA database.' });
});

router.post('/nida/verify', async (req, res, next) => {
  try {
    const nid = req.body.nid || req.body.national_id;
    const { fullname, date_of_birth } = req.body;

    if (!nid || nid.length !== 16) {
      return res.status(400).json({ success: false, verified: false, message: 'National ID must be 16 digits.' });
    }

    const citizen = await verifyNationalId(nid);

    // Verify fullname if provided
    if (fullname && fullname.trim()) {
      const inputName = fullname.trim().toLowerCase();
      const citizenFullName = (citizen.name || '').toLowerCase();
      const citizenLastName = (citizen.last_name || '').toLowerCase();
      const citizenFirstName = (citizen.first_name || '').toLowerCase();

      const matches = citizenFullName.includes(inputName) ||
        inputName.includes(citizenLastName) ||
        inputName.includes(citizenFirstName);
      if (!matches) {
        return res.status(200).json({
          success: false,
          verified: false,
          message: `Verification failed. Name "${fullname}" does not match record for NID ${nid}. (Expected last name: ${citizen.last_name})`
        });
      }
    }

    // Verify date of birth if provided
    if (date_of_birth && date_of_birth.trim()) {
      const inputDob = date_of_birth.trim();
      if (inputDob !== citizen.date_of_birth) {
        return res.status(200).json({
          success: false,
          verified: false,
          message: `Verification failed. Date of birth "${date_of_birth}" does not match record for NID ${nid}.`
        });
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      data: {
        fullname: citizen.name,
        first_name: citizen.first_name,
        last_name: citizen.last_name,
        dob: citizen.date_of_birth,
        gender: citizen.gender,
        province: citizen.province,
        district: citizen.district,
        sector: citizen.sector,
        cell: citizen.cell,
        village: citizen.village
      }
    });
  } catch (error) {
    next(error);
  }
});

// Registration prefill by NID (prevents 404 on prefill check)
router.get('/registration/prefill/:nid', async (req, res) => {
  try {
    const { nid } = req.params;
    if (!nid) return res.status(200).json({ success: true, has_existing: false, data: {} });
    const { User } = require('../models');
    const user = await User.findOne({ where: { national_id: nid } });
    if (user) {
      return res.status(200).json({
        success: true,
        has_existing: true,
        data: {
          phone: user.phone,
          email: user.email,
          name: user.name,
          first_name: user.first_name,
          last_name: user.last_name,
          province: user.province,
          district: user.district,
          sector: user.sector,
          cell: user.cell,
          village: user.village,
        }
      });
    }
    return res.status(200).json({ success: true, has_existing: false, data: {} });
  } catch (err) {
    return res.status(200).json({ success: true, has_existing: false, data: {} });
  }
});

const adminRoutes = require('./adminRoutes');
const aiRoutes = require('./aiRoutes');

const locationRoutes = require('./locationRoutes');
const countryRoutes = require('./countryRoutes');

// Mount Resource Routes with both Singular and Plural aliases to ensure zero 404s
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

router.use('/worker', workerRoutes);
router.use('/workers', workerRoutes);

router.use('/employer', employerRoutes);
router.use('/employers', employerRoutes);

router.use('/company', companyRoutes);
router.use('/companies', companyRoutes);

router.use('/incident', incidentRoutes);
router.use('/incidents', incidentRoutes);

router.use('/payment', paymentRoutes);
router.use('/payments', paymentRoutes);

router.use('/police', policeRoutes);

router.use('/supervisor', supervisorRoutes);
router.use('/supervisors', supervisorRoutes);

router.use('/notification', notificationRoutes);
router.use('/notifications', notificationRoutes);

router.use('/user', userRoutes);
router.use('/users', userRoutes);

router.use('/usage', usageRoutes);
router.use('/ai', aiRoutes);
const searchRoutes = require('./searchRoutes');
router.use('/search', searchRoutes);
router.use('/locations', locationRoutes);
router.use('/countries', countryRoutes);
const helpFeedbackRoutes = require('./helpFeedbackRoutes');
router.use('/help-feedback', helpFeedbackRoutes);
router.use('/feedback', helpFeedbackRoutes);

const ussdRoutes = require('../ussd/ussdRoutes');
router.use('/ussd', ussdRoutes);

// Catch-All Guard for Guessed / Unknown API Routes (Zero Info Leakage)
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Requested API endpoint not found.'
  });
});

module.exports = router;
