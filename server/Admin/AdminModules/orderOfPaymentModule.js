const mongoose = require('mongoose');

const OrderOfPaymentSchema = new mongoose.Schema({
   applicationId: { type: String, required: true },
   customId: { type: String, required: true, unique: true },
   applicantName: { type: String, required: true },
   billNo: { type: String, required: true, unique: true },
   dateCreated: { type: Date, default: Date.now },
   address: { type: String, required: true },
   natureOfApplication: { type: String, required: true },
   status: {
      type: String,
      enum: ['Pending Signature', 'Awaiting Payment', 'Payment Proof Submitted', 'Completed'],
      default: 'Pending Signature'
   },
   totalAmount: { type: Number, required: true },
   items: [{
      legalBasis: String,
      description: String,
      amount: Number
   }],
   signatures: {
      chiefRPS: { type: Date },
      technicalServices: { type: Date }
   },
   statutoryReceiptDate: { type: Date },
   paymentDate: { type: Date },
   receiptDate: { type: Date },
   proofOfPayment: {
      filename: String,
      contentType: String,
      data: Buffer
   },
   orNumber: String,
   rpsSignatureImage: String,
   tsdSignatureImage: String // Add this line
});

const OrderOfPayment = mongoose.model('OrderOfPayment', OrderOfPaymentSchema);

module.exports = OrderOfPayment;
