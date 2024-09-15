const mongoose = require('mongoose');

const ChainsawApplicationSchema = new mongoose.Schema({
    // customId: { type: String, unique: true },
    applicationType: { type: String, required: true },
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
    // chainsawStore: { type: mongoose.Schema.Types.Mixed, required: true },
    dateOfSubmission: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChainsawApplication', ChainsawApplicationSchema);
