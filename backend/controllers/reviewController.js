const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all reviews for a specific seller
// @route   GET /api/reviews/:sellerId
// @access  Public
exports.getSellerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('reviewer', 'name profilePicture')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// @desc    Add a review for a seller
// @route   POST /api/reviews/:sellerId
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const sellerId = req.params.sellerId;
    const reviewerId = req.user.id;

    if (sellerId === reviewerId) {
      return res.status(400).json({ message: 'You cannot review yourself.' });
    }

    if (!rating || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ message: 'Please provide a valid rating (1-5) and a comment.' });
    }

    // Check for existing review explicitly
    const existingReview = await Review.findOne({ reviewer: reviewerId, seller: sellerId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this seller.' });
    }

    const review = await Review.create({
      reviewer: reviewerId,
      seller: sellerId,
      rating: Number(rating),
      comment
    });

    // Efficiently update seller's aggregated stats
    await User.findByIdAndUpdate(sellerId, {
      $inc: { totalRating: Number(rating), totalReviews: 1 }
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this seller.' });
    }
    next(err);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ message: 'Please provide a valid rating (1-5) and a comment.' });
    }

    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Ensure only the reviewer can update
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review.' });
    }

    const ratingDiff = Number(rating) - review.rating;

    review.rating = Number(rating);
    review.comment = comment;
    await review.save();

    // Update seller's total rating based on the difference
    if (ratingDiff !== 0) {
      await User.findByIdAndUpdate(review.seller, {
        $inc: { totalRating: ratingDiff }
      });
    }

    res.json(review);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Ensure only the reviewer can delete
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review.' });
    }

    const ratingToRemove = review.rating;
    const sellerId = review.seller;

    await review.deleteOne();

    // Efficiently update seller's aggregated stats
    await User.findByIdAndUpdate(sellerId, {
      $inc: { totalRating: -ratingToRemove, totalReviews: -1 }
    });

    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
