const express = require('express');
const router = express.Router();
const {
  getPendingListings,
  approveListing,
  rejectListing,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.route('/pending').get(getPendingListings);
router.route('/:id/approve').put(approveListing);
router.route('/:id/reject').put(rejectListing);

module.exports = router;
