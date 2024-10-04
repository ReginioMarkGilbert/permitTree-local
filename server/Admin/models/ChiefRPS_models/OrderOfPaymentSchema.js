const mongoose = require('mongoose');

const OrderOfPaymentSchema = new mongoose.Schema({
    applicationId: { type: String, required: true },
    applicantName: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Pending Signature', 'Awaiting Payment', 'Completed'],
        default: 'Pending Signature'
    },
    totalAmount: { type: Number, required: true },
    items: [{
        description: String,
        amount: Number
    }],
    signatures: {
        chiefRPS: { type: Date },
        technicalServices: { type: Date }
    },
    paymentDate: { type: Date },
    receiptNumber: { type: String }
});

module.exports = mongoose.model('OrderOfPayment', OrderOfPaymentSchema);
