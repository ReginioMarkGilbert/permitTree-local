const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicationType: {
        type: String,
        required: true,
        enum: ['Chainsaw', 'Lumber Dealer', 'Plantation', 'Tree Cutting']
    },
    status: {
        type: String,
        required: true,
        enum: ['Draft', 'Submitted', 'In Review', 'Additional Info Required', 'Approved', 'Rejected', 'Expired']
    },
    userId: {
        type: Number,
        ref: 'User',
        required: true
    },
    applicationData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    submissionDate: Date,
    lastUpdated: Date,
    expiryDate: Date,
}, { timestamps: true });

applicationSchema.index({ applicationType: 1, status: 1 });
applicationSchema.index({ userId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
