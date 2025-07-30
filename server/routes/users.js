const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
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

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('profileImage'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('farmName').trim().notEmpty().withMessage('Farm name is required'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, farmName, address, farmType } = req.body;
    
    const updateData = {
      name,
      phone,
      farmName,
      address: JSON.parse(address || '{}'),
      farmType: farmType || req.user.farmType
    };

    // Handle profile image
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's products
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's auctions
router.get('/auctions', authenticateToken, async (req, res) => {
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
router.get('/bids', authenticateToken, async (req, res) => {
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

// Get seller profile (public)
router.get('/seller/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email -phone');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's products
    const products = await Product.find({ 
      seller: req.params.id, 
      isAvailable: true 
    }).limit(6);

    // Get user's active auctions
    const auctions = await Auction.find({ 
      seller: req.params.id, 
      isActive: true 
    }).limit(6);

    res.json({
      user,
      products,
      auctions
    });

  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users/farmers
router.get('/search', async (req, res) => {
  try {
    const { q, farmType, location } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { farmName: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (farmType && farmType !== 'all') {
      query.farmType = farmType;
    }
    
    if (location) {
      query['address.city'] = { $regex: location, $options: 'i' };
    }
    
    const users = await User.find(query)
      .select('name farmName farmType address rating totalSales')
      .sort({ rating: -1, totalSales: -1 })
      .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top sellers
router.get('/top-sellers', async (req, res) => {
  try {
    const topSellers = await User.find({ isVerified: true })
      .select('name farmName farmType address rating totalSales')
      .sort({ rating: -1, totalSales: -1 })
      .limit(10);
    
    res.json(topSellers);
  } catch (error) {
    console.error('Get top sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    req.user.password = newPassword;
    await req.user.save();
    
    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    // Delete user's products
    await Product.deleteMany({ seller: req.user._id });
    
    // Delete user's auctions
    await Auction.deleteMany({ seller: req.user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 