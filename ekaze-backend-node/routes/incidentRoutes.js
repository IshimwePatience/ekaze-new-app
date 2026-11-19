const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/statistics', incidentController.getIncidentStatistics);
router.post('/', incidentController.createIncident);
router.get('/', incidentController.getIncidents);
router.put('/:id', incidentController.updateIncident);
router.delete('/:id', incidentController.deleteIncident);

module.exports = router;

