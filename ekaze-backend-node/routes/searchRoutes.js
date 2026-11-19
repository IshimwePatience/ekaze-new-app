const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { globalSearch } = require('../controllers/searchController');

// Global search strictly isolated per user session & role
router.get('/', protect, globalSearch);

module.exports = router;
