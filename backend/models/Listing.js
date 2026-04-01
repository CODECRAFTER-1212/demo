const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Books', 'Electronics', 'Furniture', 'Stationery', 'Appliances'],
    },
    images: {
      type: [String],
      required: [true, 'Please add at least one image URL'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    area: {
      type: String,
      required: [true, 'Please add an area/campus'],
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching
listingSchema.index({ title: 'text', category: 1 });

module.exports = mongoose.model('Listing', listingSchema);
