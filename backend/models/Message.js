const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // A unique room key = sorted(senderId, receiverId) + listingId
    room: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
