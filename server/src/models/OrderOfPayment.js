const mongoose = require('mongoose');

const OrderOfPaymentSchema = new mongoose.Schema({
   OOPStatus: {
      type: String,
      required: true,
      enum: [
         'PendingSignature',
         'PendingApproval',
         'OOPApproved',
         'Rejected',
         'AwaitingPayment',
         'PaymentProofSubmitted',
         'PaymentProofRejected',
         'PaymentProofApproved',
      ]
   },
   PaymentComplete: {
      type: Boolean,
      default: false
   },
   approvedOOP: {
      type: Boolean,
      default: false
   }
});

module.exports = mongoose.model('OrderOfPayment', OrderOfPaymentSchema);
