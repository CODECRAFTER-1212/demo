const Listing = require('../models/Listing');

// @desc    Get all pending listings
// @route   GET /api/admin/pending
// @access  Private/Admin
const getPendingListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: 'pending' })
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve listing
// @route   PUT /api/admin/:id/approve
// @access  Private/Admin
const approveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    listing.status = 'approved';
    const approvedListing = await listing.save();

    res.status(200).json(approvedListing);
  } catch (error) {
    next(error);
  }
};

// @desc    Reject listing
// @route   PUT /api/admin/:id/reject
// @access  Private/Admin
const rejectListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    listing.status = 'rejected';
    const rejectedListing = await listing.save();

    res.status(200).json(rejectedListing);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingListings,
  approveListing,
  rejectListing,
};
