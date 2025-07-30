const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  livestockType: {
    type: String,
    enum: ['Cow', 'Horse', 'Buffalo', 'Sheep', 'Goat', 'Pig', 'Chicken', 'Duck', 'Other'],
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  healthStatus: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  images: [{
    type: String,
    required: true
  }],
  startingBid: {
    type: Number,
    required: true,
    min: 0
  },
  currentBid: {
    type: Number,
    default: 0
  },
  minBidIncrement: {
    type: Number,
    default: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    city: String,
    state: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSold: {
    type: Boolean,
    default: false
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bids: [{
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    bidTime: {
      type: Date,
      default: Date.now
    },
    mobileNumber: {
      type: String,
      required: true
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
auctionSchema.index({ title: 'text', description: 'text', livestockType: 'text', breed: 'text' });

// Method to get highest bid
auctionSchema.methods.getHighestBid = function() {
  if (this.bids.length === 0) return null;
  return this.bids.reduce((highest, bid) => bid.amount > highest.amount ? bid : highest);
};

// Method to check if auction is live
auctionSchema.methods.isLive = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

module.exports = mongoose.model('Auction', auctionSchema); 