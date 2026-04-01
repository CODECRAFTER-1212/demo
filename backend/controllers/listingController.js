const Listing = require('../models/Listing');

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    const { title, description, price, category, city, area } = req.body;
    let images = [];
    
    // Cloudinary images
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    } else if (req.body.images) {
      // In case URLs are passed directly (for testing/dummy data)
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (images.length === 0) {
      res.status(400);
      throw new Error('Please append at least one image');
    }

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      images,
      city,
      area,
      seller: req.user.id,
    });

    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active/approved listings
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    let query = { status: 'approved' }; // Only show approved listings publicly

    // Advanced search/filtering
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('seller', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      listings,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email phone createdAt');

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    // Only allow owner or admin to see non-approved listings, else return 404
    if (listing.status !== 'approved') {
      if (
        !req.user || 
        (req.user.id !== listing.seller._id.toString() && req.user.role !== 'admin')
      ) {
        res.status(404);
        throw new Error('Listing not available');
      }
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    // Check ownership
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('User not authorized');
    }

    // Reset status to pending so it can be re-reviewed by admin if content changes
    req.body.status = 'pending';

    let updateData = { ...req.body };

    // Update images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    // Check ownership
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('User not authorized');
    }

    await listing.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
};
