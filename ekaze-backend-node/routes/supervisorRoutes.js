const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const incidentController = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('supervisor', 'admin'));
router.get('/dashboard', supervisorController.getSupervisorDashboard);
router.get('/statistics', supervisorController.getSupervisorDashboard);
router.get('/profile', supervisorController.getSupervisorProfileDetails);
router.get('/profile/details', supervisorController.getSupervisorProfileDetails);
router.get('/workers', supervisorController.getDistrictWorkers);
router.get('/incidents', incidentController.getIncidents);
router.get('/incidents/statistics', incidentController.getIncidentStatistics);
router.get('/incidents/:id', incidentController.getIncident);
router.put('/incidents/:id', incidentController.updateIncident);
router.delete('/incidents/:id', incidentController.deleteIncident);

module.exports = router;
