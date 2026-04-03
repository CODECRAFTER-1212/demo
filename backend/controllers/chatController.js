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

module.exports = { getMessages, buildRoom };
