const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const companyController = require('../controllers/companyController');
const { protect, protectOptional } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Public printable card view (accessible via window.open with token)
router.get('/workers/business-cards/print', protectOptional, companyController.printBusinessCards);
router.get('/workers/business-cards/data', protectOptional, companyController.getWorkersCardsData);

router.use(protect);
router.get('/dashboard', companyController.getCompanyDashboard);
router.get('/analytics', companyController.getAnalytics);

// Business cards generate (placed before :id parameterized routes)
router.post('/workers/business-cards/generate', companyController.generateBusinessCards);
router.post('/workers', upload.any(), companyController.createCompanyWorker);

// Admin adjust company trial
router.post('/:id/adjust-trial', companyController.adjustCompanyTrial);

router.get('/workers/list', companyController.getCompanyWorkers);
router.get('/workers/:id/history', companyController.getCompanyWorkerHistory);
router.get('/workers/:id', companyController.getCompanyWorkerById);
router.put('/workers/:id', upload.any(), companyController.updateCompanyWorker);
router.post('/workers/:id', upload.any(), companyController.updateCompanyWorker);
router.post('/workers/:id/suspend', companyController.suspendCompanyWorker);
router.post('/workers/:id/reactivate', companyController.reactivateCompanyWorker);
router.post('/workers/:id/mark-available', companyController.markCompanyWorkerAvailable);
router.delete('/workers/:id', companyController.deleteCompanyWorker);
router.get('/workers', companyController.getCompanyWorkers);
router.get('/list', companyController.getCompanies);
router.get('/companies/list', companyController.getCompanies);

// Employer endpoints
router.get('/employers/statistics', companyController.getCompanyEmployerStatistics);
router.get('/employers/:id/workers', companyController.getCompanyEmployerWorkers);
router.get('/employers/:id', companyController.getCompanyEmployerDetails);
router.get('/employers', companyController.getCompanyEmployers);

// Hiring Requests endpoints
router.get('/hiring-requests/statistics', companyController.getCompanyHiringRequestStatistics);
router.get('/hiring-requests/:id', companyController.getCompanyHiringRequestById);
router.post('/hiring-requests/:id/accept', companyController.acceptCompanyHiringRequest);
router.post('/hiring-requests/:id/reject', companyController.rejectCompanyHiringRequest);
router.get('/hiring-requests', companyController.getCompanyHiringRequests);

// Wallet endpoints
router.get('/wallet', companyController.getCompanyWallet);
router.post('/wallet/withdraw', companyController.withdrawCompanyWallet);
router.put('/wallet/account', companyController.updateCompanyWalletAccount);

// Fee endpoints
router.get('/fees', companyController.getCompanyFees);
router.post('/fees', companyController.createCompanyFee);
router.put('/fees/:id', companyController.updateCompanyFee);

// Transaction endpoints (specific routes before parameterized :id)
router.get('/transactions/statistics', companyController.getCompanyTransactionStatistics);
router.get('/transactions/export', companyController.exportCompanyTransactions);
router.get('/transactions/:id', companyController.getCompanyTransactionById);
router.get('/transactions', companyController.getCompanyTransactions);

// Incident endpoints (specific routes before parameterized :id)
router.get('/incidents/statistics', companyController.getCompanyIncidentStatistics);
router.get('/incidents/worker/:workerId', companyController.getCompanyWorkerIncidents);
router.get('/incidents/:id', companyController.getCompanyIncidentById);
router.get('/incidents', companyController.getCompanyIncidents);
router.post('/incidents', companyController.createCompanyIncident);
router.put('/incidents/:id', companyController.updateCompanyIncident);
router.delete('/incidents/:id', companyController.deleteCompanyIncident);

module.exports = router;

