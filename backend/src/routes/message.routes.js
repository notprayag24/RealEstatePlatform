// src/routes/message.routes.js - Message Routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getConversations,
  getMessages,
  getOrCreateConversation,
  sendMessage,
  markAsRead,
  archiveConversation,
} = require('../controllers/message.controller');

router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getMessages);
router.post('/conversation', protect, getOrCreateConversation);
router.post('/', protect, sendMessage);
router.put('/:messageId/read', protect, markAsRead);
router.put('/conversation/:conversationId/archive', protect, archiveConversation);

module.exports = router;