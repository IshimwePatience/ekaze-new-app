const express = require('express');
const router = express.Router();
const { getStatistics } = require('../controllers/usageController');

router.get('/statistics', getStatistics);

module.exports = router;
