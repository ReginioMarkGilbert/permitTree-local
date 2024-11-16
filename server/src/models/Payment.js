const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
   oopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OOP',
      required: true
   },
   status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
   },
   amount: {
      type: Number,
      required: true
   },
   paymentMethod: {
      type: String,
      enum: ['GCASH'],
      required: true
   },
   transactionId: String,
   paymentDetails: {
      fullName: {
         type: String,
         required: true
      },
      email: {
         type: String,
         required: true
      },
      phoneNumber: {
         type: String,
         required: true
      },
      address: {
         type: String,
         required: true
      }
   },
   expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 3600000) // 1 hour from creation
   }
}, {
   timestamps: true
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
