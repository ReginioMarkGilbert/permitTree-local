const mongoose = require('mongoose');
const { generateBillNo } = require('../utils/billNumberGenerator');

const oopSchema = new mongoose.Schema({
  billNo: {
    type: String,
    required: true,
    unique: true
  },
  applicationId: {
    type: String,
    required: true,
    ref: 'Permit'
  },
  date: {
    type: Date,
    default: Date.now
  },
  namePayee: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  natureOfApplication: {
    type: String,
    required: true
  },
  items: [{
    legalBasis: String,
    description: String,
    amount: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  signatures: {
    chiefRPS: Date,
    technicalServices: Date
  },
  rpsSignatureImage: String,
  tsdSignatureImage: String
}, {
  timestamps: true
});

// Pre-save middleware to generate bill number
oopSchema.pre('save', async function(next) {
  if (!this.billNo) {
    this.billNo = await generateBillNo();
  }
  next();
});

const OOP = mongoose.model('OOP', oopSchema);
module.exports = OOP;
