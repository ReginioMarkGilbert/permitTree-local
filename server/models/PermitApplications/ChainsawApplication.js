const mongoose = require('mongoose');

const ChainsawApplicationSchema = new mongoose.Schema({
    applicationType: { type: String, default: 'Chainsaw Registration', required: true },
    registrationType: { type: String, required: true },
    chainsawStore: { type: String, required: true },
    ownerName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, required: true },
    dateOfAcquisition: { type: Date, required: true },
    powerOutput: { type: String, required: true },
    maxLengthGuidebar: { type: String, required: true },
    countryOfOrigin: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    files: [{ type: String }],
    dateOfSubmission: { type: Date, required: true },
    status: { type: String, required: true },
    uploadedRequirements: { type: String, default: 'No' }
}, { timestamps: true });

module.exports = mongoose.model('ChainsawApplication', ChainsawApplicationSchema);
