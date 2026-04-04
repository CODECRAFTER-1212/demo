const express = require('express');
const router = express.Router();
const {
  getSellerReviews,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:sellerId', getSellerReviews);
router.post('/:sellerId', protect, addReview);

router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
