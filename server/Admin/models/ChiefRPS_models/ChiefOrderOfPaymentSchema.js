const mongoose = require('mongoose');

const OrderOfPaymentSchema = new mongoose.Schema({
    applicationId: { type: String, required: true },
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
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        filename: String,
        contentType: String,
        data: Buffer
    },
    orNumber: String
});

module.exports = mongoose.model('OrderOfPayment', OrderOfPaymentSchema);
