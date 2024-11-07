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
   OOPstatus: {
      type: String,
      enum: ['Pending Signature',
         'For Approval',
         'Awaiting Payment',
         'Payment Proof Submitted',
         'Payment Proof Rejected',
         'Payment Proof Approved',
         'Issued OR',
         'Completed OOP'
      ],
      default: 'Pending Signature'
   },
   OOPSignedByTwoSignatories: {
      type: Boolean,
      default: false
   },
   OOPApproved: {
      type: Boolean,
      default: false
   },
   signatures: {
      chiefRPS: Date,
      technicalServices: Date
   },
   rpsSignatureImage: String,
   tsdSignatureImage: String,
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
   }
}, {
   timestamps: true
});

// Change to pre-validate hook
oopSchema.pre('validate', async function (next) {
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
