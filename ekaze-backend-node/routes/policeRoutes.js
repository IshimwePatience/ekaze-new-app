const express = require('express');
const router = express.Router();
const policeController = require('../controllers/policeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('police', 'admin'));

router.get('/dashboard', policeController.getPoliceDashboard);
router.get('/statistics', policeController.getPoliceStatistics);
router.get('/incidents', policeController.getPoliceIncidents);
router.get('/incidents/:id', policeController.getPoliceIncidentById);
router.get('/profile', policeController.getPoliceProfile);
router.get('/profile/details', policeController.getPoliceProfile);
router.post('/incidents/:id/assign', policeController.assignIncident);
router.post('/incidents/:id/update-status', policeController.updateIncidentStatus);
router.post('/incidents/:id/notes', policeController.addIncidentNotes);
router.get('/workers/:workerId/background', policeController.getWorkerBackground);
router.get('/reports', policeController.getPoliceReports);
router.get('/export', policeController.exportPoliceData);

module.exports = router;
