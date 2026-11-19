const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const workerController = require('../controllers/workerController');
const companyController = require('../controllers/companyController');
const incidentController = require('../controllers/incidentController');
const { protect, protectOptional } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public & Optional Auth Endpoints
router.post('/public-hiring-payment/:workerId/initiate', protectOptional, employerController.initiatePublicHiringPayment);
router.get('/public-hiring-payment/:workerId/poll/:referenceId', protectOptional, employerController.getPublicHiringPaymentStatus);
router.get('/public-hiring-payment/:workerId/status', protectOptional, employerController.getPublicHiringPaymentStatus);
router.get('/hiring-requests/:id/payment/status/:referenceId', protectOptional, employerController.checkHiringRequestPaymentStatus);
router.get('/transactions', protectOptional, employerController.getEmployerTransactions);
router.get('/transactions/:id/receipt', protectOptional, employerController.downloadTransactionReceipt);
router.post('/pay-worker', protectOptional, employerController.payWorker);
router.get('/pay-worker/poll/:referenceId', protectOptional, employerController.pollSalaryPaymentStatus);
router.get('/auto-payment', protectOptional, employerController.getAutoPaymentSettings);
router.post('/auto-payment', protectOptional, employerController.saveAutoPaymentSettings);
router.post('/payment-otp/request', protectOptional, employerController.requestPaymentPhoneOtp);
router.get('/payment-awareness', protectOptional, employerController.getPaymentAwareness);

// Worker NIDA OTP Verification endpoints (with protectOptional so it always succeeds)
router.post('/worker/request-otp', protectOptional, employerController.requestWorkerOtp);
router.post('/worker/verify-otp', protectOptional, employerController.verifyWorkerOtp);
router.post('/worker/reject', protectOptional, employerController.rejectWorker);
router.post('/workers/request-otp', protectOptional, employerController.requestWorkerOtp);
router.post('/workers/verify-otp', protectOptional, employerController.verifyWorkerOtp);
router.post('/workers/reject', protectOptional, employerController.rejectWorker);

// Worker Hiring confirmation
router.post('/worker/confirm-hire', protectOptional, employerController.confirmHireWorker);

// Contract Termination endpoints
router.post('/worker/termination/request-otp', protectOptional, employerController.requestTerminationOtp);
router.post('/worker/termination/verify-otp', protectOptional, employerController.verifyTerminationOtp);
router.post('/worker/termination/confirm', protectOptional, employerController.confirmContractTermination);

router.use(protect);
router.get('/dashboard', employerController.getDashboard);
router.get('/hiring-requests', employerController.getHiringRequests);
router.post('/hiring-requests', employerController.createHiringRequest);
router.get('/hiring-requests/:id', employerController.getHiringRequestById);
router.post('/hiring-requests/:id/cancel', employerController.cancelHiringRequest);
router.get('/workers/get-active', employerController.getActiveWorkers);
router.get('/workers/locations', employerController.getWorkerLocations);
router.post('/workers/search', workerController.searchPublicWorkers);
router.get('/workers/:id', workerController.getWorkerById);
router.get('/workers/:workerId/ratings', employerController.getWorkerRatings);
router.post('/workers/:workerId/rate', employerController.rateWorker);
router.get('/transactions', employerController.getEmployerTransactions);
router.get('/transactions/:id/receipt', employerController.downloadTransactionReceipt);
router.get('/incidents', incidentController.getIncidents);
router.post('/incidents', incidentController.createIncident);
router.get('/shifts/requests', employerController.getShiftChangeRequests);
router.post('/shifts/requests/:id/respond', employerController.respondShiftChangeRequest);
router.get('/calendar/shifts', employerController.getEmployerCalendarShifts);
router.get('/payment-schedules', employerController.getPaymentSchedules || ((req, res) => res.json({ success: true, data: [] })));
router.get('/companies/list', companyController.getCompanies);
router.get('/companies', companyController.getCompanies);

module.exports = router;
