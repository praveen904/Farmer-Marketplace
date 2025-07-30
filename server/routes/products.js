const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
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

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, organic, sortBy = 'createdAt', order = 'desc', location, district } = req.query;
    
    let query = { isAvailable: true };
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Organic filter
    if (organic === 'true') {
      query.isOrganic = true;
    }
    
    // Location filter
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    // District filter
    if (district) {
      query['location.district'] = { $regex: district, $options: 'i' };
    }
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    
    const products = await Product.find(query)
      .populate('seller', 'name farmName rating')
      .sort(sortOptions)
      .limit(20);
    
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name farmName rating totalSales')
      .populate('reviews.user', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Increment views
    product.views += 1;
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/', authenticateToken, upload.array('images', 5), [
  body('name').trim().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Poultry', 'Processed', 'Organic', 'Other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('unit').isIn(['kg', 'pound', 'dozen', 'piece', 'litre', 'gallon', 'bag']).withMessage('Invalid unit')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const { name, description, category, price, quantity, unit, location, isOrganic, harvestDate, expiryDate } = req.body;
    
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    const product = new Product({
      seller: req.user._id,
      name,
      description,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      unit,
      images: imageUrls,
      location: JSON.parse(location || '{}'),
      isOrganic: isOrganic === 'true',
      harvestDate: harvestDate || null,
      expiryDate: expiryDate || null
    });

    await product.save();
    
    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'name farmName rating');
    
    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updateData = { ...req.body };
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = newImageUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('seller', 'name farmName rating');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Purchase product
router.post('/:id/purchase', authenticateToken, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email phone');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ message: 'Product is not available for purchase' });
    }

    const { quantity } = req.body;
    
    if (quantity > product.quantity) {
      return res.status(400).json({ 
        message: `Only ${product.quantity} ${product.unit} available. Requested: ${quantity} ${product.unit}` 
      });
    }

    // Update product quantity
    product.quantity -= quantity;
    
    // Mark as unavailable if quantity becomes 0
    if (product.quantity === 0) {
      product.isAvailable = false;
    }

    await product.save();
    
    // Create purchase notification for seller
    const notification = new Notification({
      recipient: product.seller._id,
      type: 'purchase',
      title: 'New Purchase',
      message: `${req.user.name} purchased ${quantity} ${product.unit} of ${product.name}`,
      data: {
        product: product._id,
        buyer: req.user._id,
        quantity: quantity,
        amount: product.price * quantity
      }
    });

    await notification.save();

    res.json({
      message: 'Purchase successful',
      product: product,
      notification: notification
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product quantity (for farmers)
router.patch('/:id/quantity', authenticateToken, [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { quantity } = req.body;
    
    product.quantity = quantity;
    product.isAvailable = quantity > 0;
    
    await product.save();
    
    const updatedProduct = await Product.findById(req.params.id)
      .populate('seller', 'name farmName rating');

    res.json({
      message: 'Quantity updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review to product
router.post('/:id/reviews', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { rating, comment } = req.body;
    
    // Check if user already reviewed
    const existingReview = product.reviews.find(review => 
      review.user.toString() === req.user._id.toString()
    );
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    product.reviews.push({
      user: req.user._id,
      rating: parseInt(rating),
      comment
    });

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();
    
    const updatedProduct = await Product.findById(req.params.id)
      .populate('seller', 'name farmName rating')
      .populate('reviews.user', 'name');

    res.json({
      message: 'Review added successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 