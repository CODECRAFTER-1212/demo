const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to get listings
router.route('/').get(getListings);

// Protected routes
router.route('/').post(protect, upload.array('images', 5), createListing);

// Apply `protect` manually inside the controller where needed for non-approved listings 
// But the GET single listing remains public for approved ones.
router.route('/:id').get(getListing);
router.route('/:id').put(protect, upload.array('images', 5), updateListing);
router.route('/:id').delete(protect, deleteListing);

module.exports = router;
