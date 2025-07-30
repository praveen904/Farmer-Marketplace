const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const router = express.Router();

// Get platform statistics
router.get('/', async (req, res) => {
  try {
    const [activeFarmers, productsListed, liveAuctions, happyCustomers] = await Promise.all([
      // Count verified farmers
      User.countDocuments({ isVerified: true }),
      
      // Count available products
      Product.countDocuments({ isAvailable: true }),
      
      // Count live auctions
      Auction.countDocuments({ 
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }),
      
      // Count users with sales (as a proxy for happy customers)
      User.countDocuments({ totalSales: { $gt: 0 } })
    ]);

    res.json({
      activeFarmers,
      productsListed,
      liveAuctions,
      happyCustomers
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 