const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Organization email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'INR', // ₹
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'ENTERPRISE'],
      default: 'FREE',
    },
    subscriptionStatus: {
      type: String,
      enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'],
      default: 'ACTIVE',
    },
    subscriptionStartDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year free
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
