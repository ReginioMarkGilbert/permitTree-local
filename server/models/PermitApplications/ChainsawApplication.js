const mongoose = require('mongoose');

const ChainsawApplicationSchema = new mongoose.Schema({
    customId: { type: String, unique: true, required: true },
    applicationType: { type: String, required: true, default: 'Chainsaw Registration' }, // Set default application type
    registrationType: { type: String, required: true }, // New field for registration type
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
    dateOfSubmission: { type: Date, default: Date.now },
    status: { type: String, required: true } // Add status field
});

module.exports = mongoose.model('ChainsawApplication', ChainsawApplicationSchema);
