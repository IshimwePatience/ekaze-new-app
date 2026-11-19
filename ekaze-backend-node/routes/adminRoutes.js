const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const {
  getAdminDashboard,
  getAdminTransactions,
  getAdminTransactionStatistics,
  getAdminTransactionById,
  markAdminTransactionForReview,
  refundAdminTransaction,
  exportAdminTransactions
} = require('../controllers/adminController');
const userController = require('../controllers/userController');
const workerController = require('../controllers/workerController');
const companyController = require('../controllers/companyController');
const employerController = require('../controllers/employerController');
const incidentController = require('../controllers/incidentController');
const settingsController = require('../controllers/settingsController');
const { protect, protectOptional } = require('../middleware/auth');

// Multer setup for Admin profile photos
const profileUploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `admin-profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

router.get('/dashboard', getAdminDashboard);

// ==================== ADMIN SETTINGS ROUTES ====================
router.get('/settings/payment', protectOptional, settingsController.getPaymentSettings);
router.put('/settings/payment', protectOptional, settingsController.updatePaymentSettings);

router.get('/settings/api', protectOptional, settingsController.getApiSettings);
router.put('/settings/api/:provider', protectOptional, settingsController.updateApiSettings);

router.get('/settings', protectOptional, settingsController.getAllSettings);
router.get('/settings/:key', protectOptional, settingsController.getSettingsByKey);
router.put('/settings/:key', protectOptional, settingsController.updateSetting);
router.post('/settings/:key/toggle', protectOptional, settingsController.toggleSetting);

// ==================== ADMIN PROFILE ROUTES ====================
router.get('/profile', protectOptional, settingsController.getAdminProfile);
router.put('/profile', protectOptional, settingsController.updateAdminProfile);
router.put('/profile/password', protectOptional, settingsController.updateAdminPassword);
router.post('/profile/photo', protectOptional, upload.single('photo'), settingsController.uploadAdminPhoto);
router.delete('/profile/photo', protectOptional, settingsController.deleteAdminPhoto);

// ==================== ADMIN USER MANAGEMENT ====================
router.get('/users/statistics', userController.getStatistics);
router.get('/users/by-role/:role', userController.getUsersByRole);
router.get('/users/by-status/:status', userController.getUsersByStatus);
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.get('/users/:id/activity-logs', userController.getUserActivityLogs);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.post('/users/:id/activate', userController.activateUser);
router.post('/users/:id/suspend', userController.suspendUser);
router.post('/users/:id/verify', userController.verifyUser);
router.delete('/users/:id', userController.deleteUser);

// Admin Employer Details Routes
router.get('/employers/:id/details', employerController.getEmployerFullDetails);

// Admin Worker Management Routes
router.get('/workers', workerController.getWorkers);
router.get('/workers/:id', workerController.getWorkerById);
router.put('/workers/:id', workerController.updateWorker);
router.delete('/workers/:id', workerController.deleteWorker);
router.post('/workers/:id/suspend', workerController.suspendWorker);
router.post('/workers/:id/reactivate', workerController.reactivateWorker);

// Admin Company Management Routes
router.get('/companies', companyController.getCompanies);
router.get('/companies/:id/details', companyController.getCompanyFullDetails);
router.put('/companies/:id', companyController.updateCompany);
router.delete('/companies/:id', companyController.deleteCompany);

// Admin Incident Management Routes
router.get('/incidents/statistics', protectOptional, incidentController.getIncidentStatistics);
router.get('/incidents', protectOptional, incidentController.getIncidents);
router.put('/incidents/:id', protect, incidentController.updateIncident);
router.delete('/incidents/:id', protect, incidentController.deleteIncident);

// Admin Transaction Management Routes
router.get('/transactions/statistics', protectOptional, getAdminTransactionStatistics);
router.get('/transactions/export/data', protectOptional, exportAdminTransactions);
router.get('/transactions/by-status/:status', protectOptional, getAdminTransactions);
router.get('/transactions', protectOptional, getAdminTransactions);
router.get('/transactions/:id', protectOptional, getAdminTransactionById);
router.post('/transactions/:id/review', protectOptional, markAdminTransactionForReview);
router.post('/transactions/:id/refund', protectOptional, refundAdminTransaction);

module.exports = router;
