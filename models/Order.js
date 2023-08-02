const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  clothType: {
    type: String,
    default: 'shirt',
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true,
  },
  orderDetails: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    merch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchandise',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    country: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['not_verified', 'verified', 'delivered'],
    default: 'not_verified',
  },
});

module.exports = mongoose.model('Order', OrderSchema);