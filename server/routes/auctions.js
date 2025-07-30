const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Auction = require('../models/Auction');
const User = require('../models/User');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Get all auctions with filters
router.get('/', async (req, res) => {
  try {
    const { livestockType, search, minPrice, maxPrice, status = 'all', sortBy = 'endDate', order = 'asc' } = req.query;
    
    let query = {};
    
    // Livestock type filter
    if (livestockType && livestockType !== 'all') {
      query.livestockType = livestockType;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Price filter
    if (minPrice || maxPrice) {
      query.startingBid = {};
      if (minPrice) query.startingBid.$gte = parseFloat(minPrice);
      if (maxPrice) query.startingBid.$lte = parseFloat(maxPrice);
    }
    
    // Status filter
    if (status === 'live') {
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
      query.isActive = true;
    } else if (status === 'upcoming') {
      const now = new Date();
      query.startDate = { $gt: now };
      query.isActive = true;
    } else if (status === 'ended') {
      const now = new Date();
      query.endDate = { $lt: now };
    }
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    
    const auctions = await Auction.find(query)
      .populate('seller', 'name farmName rating')
      .populate('winner', 'name')
      .sort(sortOptions)
      .limit(20);
    
    res.json(auctions);
  } catch (error) {
    console.error('Get auctions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single auction
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name farmName rating totalSales')
      .populate('winner', 'name')
      .populate('bids.bidder', 'name');
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Increment views
    auction.views += 1;
    await auction.save();
    
    res.json(auction);
  } catch (error) {
    console.error('Get auction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new auction
router.post('/', authenticateToken, upload.array('images', 5), [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('livestockType').isIn(['Cow', 'Horse', 'Buffalo', 'Sheep', 'Goat', 'Pig', 'Chicken', 'Duck', 'Other']).withMessage('Invalid livestock type'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
  body('age').isInt({ min: 0 }).withMessage('Age must be a positive number'),
  body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('startingBid').isFloat({ min: 0 }).withMessage('Starting bid must be a positive number'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const { 
      title, description, livestockType, breed, age, weight, healthStatus,
      startingBid, startDate, endDate, location, minBidIncrement 
    } = req.body;
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (start <= now) {
      return res.status(400).json({ message: 'Start date must be in the future' });
    }
    
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    const auction = new Auction({
      seller: req.user._id,
      title,
      description,
      livestockType,
      breed,
      age: parseInt(age),
      weight: parseFloat(weight),
      healthStatus: healthStatus || 'Good',
      images: imageUrls,
      startingBid: parseFloat(startingBid),
      currentBid: parseFloat(startingBid),
      minBidIncrement: parseFloat(minBidIncrement) || 100,
      startDate: start,
      endDate: end,
      location: JSON.parse(location || '{}')
    });

    await auction.save();
    
    const populatedAuction = await Auction.findById(auction._id)
      .populate('seller', 'name farmName rating');
    
    res.status(201).json({
      message: 'Auction created successfully',
      auction: populatedAuction
    });

  } catch (error) {
    console.error('Create auction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Place bid
router.post('/:id/bid', authenticateToken, [
  body('amount').isFloat({ min: 0 }).withMessage('Bid amount must be a positive number'),
  body('mobileNumber').isMobilePhone('en-IN').withMessage('Valid mobile number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Check if auction is live
    if (!auction.isLive()) {
      return res.status(400).json({ message: 'Auction is not live' });
    }
    
    // Check if user is not the seller
    if (auction.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }
    
    const { amount, mobileNumber } = req.body;
    const bidAmount = parseFloat(amount);
    
    // Check if bid is higher than current bid
    const currentHighestBid = auction.getHighestBid();
    const minBid = currentHighestBid ? currentHighestBid.amount + auction.minBidIncrement : auction.startingBid;
    
    if (bidAmount < minBid) {
      return res.status(400).json({ 
        message: `Bid must be at least ₹${minBid}`,
        minBid: minBid
      });
    }
    
    // Add bid with mobile number
    auction.bids.push({
      bidder: req.user._id,
      amount: bidAmount,
      bidTime: new Date(),
      mobileNumber: mobileNumber
    });
    
    auction.currentBid = bidAmount;
    await auction.save();
    
    // Create notification for seller
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: auction.seller,
      type: 'bid',
      title: 'New Bid Placed',
      message: `A new bid of ₹${bidAmount} has been placed on your auction "${auction.title}"`,
      data: {
        auction: auction._id,
        buyer: req.user._id,
        amount: bidAmount
      }
    });
    
    const updatedAuction = await Auction.findById(req.params.id)
      .populate('seller', 'name farmName rating')
      .populate('bids.bidder', 'name');
    
    res.json({
      message: 'Bid placed successfully',
      auction: updatedAuction
    });

  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update auction
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    if (auction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this auction' });
    }
    
    // Check if auction has started
    if (auction.startDate <= new Date()) {
      return res.status(400).json({ message: 'Cannot update auction that has already started' });
    }

    const updateData = { ...req.body };
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = newImageUrls;
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('seller', 'name farmName rating');

    res.json({
      message: 'Auction updated successfully',
      auction: updatedAuction
    });

  } catch (error) {
    console.error('Update auction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete auction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    if (auction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this auction' });
    }
    
    // Check if auction has started
    if (auction.startDate <= new Date()) {
      return res.status(400).json({ message: 'Cannot delete auction that has already started' });
    }

    await Auction.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Auction deleted successfully' });

  } catch (error) {
    console.error('Delete auction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's auctions
router.get('/user/my-auctions', authenticateToken, async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate('winner', 'name')
      .sort({ createdAt: -1 });
    
    res.json(auctions);
  } catch (error) {
    console.error('Get user auctions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bids
router.get('/user/my-bids', authenticateToken, async (req, res) => {
  try {
    const auctions = await Auction.find({
      'bids.bidder': req.user._id
    })
    .populate('seller', 'name farmName')
    .populate('winner', 'name')
    .sort({ createdAt: -1 });
    
    res.json(auctions);
  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 