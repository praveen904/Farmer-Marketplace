const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
        type: {
        type: String,
        enum: ['purchase', 'bid', 'auction_end', 'system'],
        required: true
      },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction'
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    quantity: Number,
    amount: Number,

  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 