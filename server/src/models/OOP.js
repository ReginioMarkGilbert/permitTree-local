const mongoose = require('mongoose');

const OOPSchema = new mongoose.Schema({
   oopNumber: { type: String, required: true, unique: true },
   permitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permit',
      required: true
   },
   amount: { type: Number, required: true },
   status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Paid', 'Cancelled']
   },
   dateIssued: {
      type: Date,
      default: Date.now
   },
   datePaid: Date,
   paymentProof: String
}, { timestamps: true });

module.exports = mongoose.model('OOP', OOPSchema);
