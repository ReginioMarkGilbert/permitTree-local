const mongoose = require('mongoose');

const OrderOfPaymentSchema = new mongoose.Schema({
    applicationId: { type: String, required: true },
    applicantName: { type: String, required: true },
    billNo: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
    address: { type: String, required: true },
    natureOfApplication: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending Signature', 'Awaiting Payment', 'Completed'],
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
    paymentDate: { type: Date },
    receiptDate: { type: Date }
});

module.exports = mongoose.model('OrderOfPayment', OrderOfPaymentSchema);
