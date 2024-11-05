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
    enum: ['PendingSignature', 'Approved', 'Rejected'],
    default: 'PendingSignature'
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

// Change to pre-validate hook
oopSchema.pre('validate', async function(next) {
  try {
    if (!this.billNo) {
      this.billNo = await generateBillNo();
    }
    next();
  } catch (error) {
    next(error);
  }
});

const OOP = mongoose.model('OOP', oopSchema);
module.exports = OOP;
