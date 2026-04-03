const Message = require('../models/Message');

// Build a deterministic room key from two user IDs + listing ID
const buildRoom = (uid1, uid2, listingId) => {
  const sorted = [uid1.toString(), uid2.toString()].sort().join('_');
  return `${sorted}_${listingId}`;
};

// @desc  Get chat history between logged-in user and seller for a listing
// @route GET /api/chat/:listingId/:sellerId
// @access Private
const getMessages = async (req, res, next) => {
  try {
    const { listingId, sellerId } = req.params;
    const room = buildRoom(req.user._id, sellerId, listingId);

    const messages = await Message.find({ room })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json({ room, messages });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all conversations for the logged-in user (latest message per room)
// @route GET /api/chat/conversations
// @access Private
const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .populate('listing', 'title images price')
      .sort({ createdAt: -1 });

    // Group by room — keep only latest message per room
    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      if (!seen.has(msg.room)) {
        seen.add(msg.room);
        conversations.push(msg);
      }
    }

    res.status(200).json({ conversations });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages, getMyConversations, buildRoom };
