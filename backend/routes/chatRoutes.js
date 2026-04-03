const express = require('express');
const router = express.Router();
const { getMessages, getMyConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/chat/conversations — all conversations for logged-in user
// IMPORTANT: defined before /:listingId/:sellerId so 'conversations' isn't treated as a param
router.get('/conversations', protect, getMyConversations);

// GET /api/chat/:listingId/:sellerId  — fetch message history
router.get('/:listingId/:sellerId', protect, getMessages);

module.exports = router;
