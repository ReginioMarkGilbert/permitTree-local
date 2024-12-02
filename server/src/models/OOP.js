const mongoose = require('mongoose');
const { generateBillNo } = require('../utils/billNumberGenerator');
const { generateTrackingNumber } = require('../utils/trackingNumberGenerator');

const officialReceiptSchema = new mongoose.Schema({
   orNumber: {
      type: String,
      sparse: true,
      unique: true
   },
   dateIssued: {
      type: Date,
      default: Date.now
   },
   issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   amount: {
      type: Number,
      required: function() {
         return this.orNumber != null;
      }
   },
   paymentMethod: {
      type: String,
      enum: ['GCASH', 'CASH', 'CHECK'],
      required: function() {
         return this.orNumber != null;
      }
   },
   remarks: String
});

const OR = mongoose.model('OfficialReceipt', officialReceiptSchema);

const paymentProofSchema = new mongoose.Schema({
   transactionId: {
      type: String,
      sparse: true,
      unique: true,
      required: function() {
         return this.paymentMethod != null;
      }
   },
   paymentMethod: {
      type: String,
      enum: ['GCASH']
   },
   amount: {
      type: Number,
      required: function() {
         return this.paymentMethod != null;
      }
   },
   timestamp: {
      type: Date,
      default: Date.now
   },
   referenceNumber: {
      type: String,
      required: function() {
         return this.paymentMethod != null;
      }
   },
   payerDetails: {
      name: {
         type: String,
         default: ''
      },
      email: {
         type: String,
         default: ''
      },
      phoneNumber: {
         type: String,
         default: ''
      }
   },
   status: {
      type: String,
      enum: ['SUBMITTED', 'APPROVED', 'REJECTED'],
      default: 'SUBMITTED'
   }
});

const oopSchema = new mongoose.Schema({
   billNo: {
      type: String,
      required: true,
      unique: true
   },
   applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Permit'
   },
   applicationNumber: {
      type: String,
      required: true
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
   awaitingPaymentProofApproval: {
      type: Boolean,
      default: false
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
   },
   officialReceipt: {
      type: officialReceiptSchema,
      required: false
   },
   receivedDate: {
      type: Date,
      default: Date.now
   },
   receivedTime: String,
   trackingNo: {
      type: String,
      unique: true
   },
   releasedDate: Date,
   releasedTime: String,
   paymentProof: {
      type: paymentProofSchema,
      required: false
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
      if (!this.trackingNo) {
         this.trackingNo = await generateTrackingNumber();
      }
      next();
   } catch (error) {
      console.error('Error in pre-validate hook:', error);
      next(error);
   }
});

const OOP = mongoose.model('OOP', oopSchema);
module.exports = { OOP, OR };
