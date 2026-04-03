const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/chat/:listingId/:sellerId  — fetch message history
router.get('/:listingId/:sellerId', protect, getMessages);

module.exports = router;
