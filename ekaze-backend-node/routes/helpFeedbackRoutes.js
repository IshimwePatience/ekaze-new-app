const express = require('express');
const router = express.Router();
const helpFeedbackController = require('../controllers/helpFeedbackController');
const { protect, protectOptional } = require('../middleware/auth');

// Public or Authenticated submission (handles both landing page and logged in users)
router.post('/', protectOptional, helpFeedbackController.createFeedback);

// Admin-only ticket management and analytics
router.get('/stats', protect, helpFeedbackController.getFeedbackStats);
router.get('/', protect, helpFeedbackController.getAllFeedback);
router.put('/:id/status', protect, helpFeedbackController.updateFeedbackStatus);
router.delete('/:id', protect, helpFeedbackController.deleteFeedback);

module.exports = router;
