const mongoose = require('mongoose');

const CSAWPermitSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationType: { type: String, required: true },
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
  isOwner: { type: Boolean, required: true },
  isTenureHolder: { type: Boolean, required: true },
  isBusinessOwner: { type: Boolean, required: true },
  isPLTPRHolder: { type: Boolean, required: true },
  isWPPHolder: { type: Boolean, required: true },
  files: {
    officialReceipt: [String],
    deedOfSale: [String],
    specialPowerOfAttorney: [String],
    forestTenureAgreement: [String],
    businessPermit: [String],
    certificateOfRegistration: [String],
    woodProcessingPlantPermit: [String],
  },
  dateOfSubmission: { type: Date, default: Date.now },
  status: { type: String, required: true },
}, { timestamps: true });

const CSAWPermit = mongoose.model('CSAWPermit', CSAWPermitSchema);

module.exports = CSAWPermit;
