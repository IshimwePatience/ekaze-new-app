const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { protect, protectOptional } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/incidents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `incident-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

router.get('/dashboard', protect, authorize('worker'), workerController.getWorkerDashboard);
router.get('/profile', protect, authorize('worker'), workerController.getWorkerProfile);
router.get('/employments', protectOptional, workerController.getWorkerEmployments);
router.get('/ratings', protect, authorize('worker'), workerController.getWorkerRatings);

// Transactions endpoints for worker
router.get('/transactions/statistics', protect, authorize('worker'), workerController.getWorkerTransactionStatistics);
router.get('/transactions/export', protect, authorize('worker'), workerController.exportWorkerTransactions);
router.get('/transactions/:id', protect, authorize('worker'), workerController.getWorkerTransactionDetails);
router.get('/transactions', protect, authorize('worker'), workerController.getWorkerTransactions);
router.post('/withdraw/request-otp', protect, authorize('worker'), workerController.requestWithdrawalOtp);
router.post('/withdraw', protect, authorize('worker'), workerController.requestWorkerWithdrawal);

// Extended profile endpoints for worker (Work History & profile details)
router.get('/extended-profile', protect, authorize('worker'), workerController.getExtendedProfile);
router.put('/extended-profile', protect, authorize('worker'), workerController.updateExtendedProfile);

// Contract Details, Download & Termination endpoints for worker
router.get('/employment/:id', protectOptional, workerController.getWorkerEmploymentById);
router.get('/employment/:id/contract', protectOptional, workerController.downloadWorkerEmploymentContract);
router.get('/employment/:id/contract/html', protectOptional, workerController.viewWorkerEmploymentContractHtml);
router.post('/employment/:id/terminate', protectOptional, workerController.terminateWorkerEmploymentContract);
router.post('/employment/termination/request-otp', protectOptional, workerController.requestWorkerTerminationOtp);
router.post('/employment/termination/verify-otp', protectOptional, workerController.verifyWorkerTerminationOtp);
router.post('/employment/termination/confirm', protectOptional, workerController.confirmWorkerContractTermination);

// Worker Incident endpoints
router.get('/incidents', protectOptional, workerController.getWorkerIncidents);
router.post('/incidents', protectOptional, upload.any(), workerController.createWorkerIncident);
router.get('/incidents/:id', protectOptional, workerController.getWorkerIncidentById);

// Availability schedule endpoints (must be defined before /:id)
router.get('/availability', protect, authorize('worker'), workerController.getAvailabilitySlots);
router.post('/availability', protect, authorize('worker'), workerController.saveAvailabilitySlots);
router.post('/availability/slot', protect, authorize('worker'), workerController.addAvailabilitySlot);
router.get('/availability/week', protect, authorize('worker'), workerController.getAvailabilityWeekView);
router.delete('/availability/:id', protect, authorize('worker'), workerController.deleteAvailabilitySlot);
router.post('/availability/:id/request-change', protect, authorize('worker'), workerController.requestShiftChange);
router.put('/availability', protect, authorize('worker'), workerController.updateAvailability);

router.get('/verify/:id', workerController.verifyWorkerCardPublic);
router.post('/search/public', workerController.searchPublicWorkers);
router.get('/:id/public', workerController.getPublicWorkerDetails);
router.get('/', workerController.getWorkers);
router.get('/:id', workerController.getWorkerById);

module.exports = router;
