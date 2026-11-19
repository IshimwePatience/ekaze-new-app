const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protectOptional } = require('../middleware/auth');

router.post('/chat', protectOptional, aiController.sendMessage);
router.get('/conversations', protectOptional, aiController.getConversations);
router.get('/conversations/:id', protectOptional, aiController.getConversationMessages);
router.delete('/conversations/:id', protectOptional, aiController.deleteConversation);

module.exports = router;
