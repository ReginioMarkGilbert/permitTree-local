const mongoose = require('mongoose');

const ChainsawApplicationSchema = new mongoose.Schema({
    customId: { type: String, unique: true },
    store: { type: mongoose.Schema.Types.Mixed, required: true },
    // Owner details
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    fileNames: { type: [String], default: [] },
    // chainsaw details
    brand: { type: mongoose.Schema.Types.Mixed, required: true },
    model: { type: mongoose.Schema.Types.Mixed, required: true },
    serialNumber: { type: mongoose.Schema.Types.Mixed, required: true },
    dateOfAcquisition: { type: Date, required: true },
    powerOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    dateOfSubmission: { type: Date, default: Date.now },
    status: { type: String, default: 'For Review' }
});

const ChainsawApplication = mongoose.model('ChainsawApplication', ChainsawApplicationSchema);

module.exports = ChainsawApplication;
