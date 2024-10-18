const mongoose = require('mongoose');
const Permit = require('./Permit');

const FileSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer
});

const CSAWPermitSchema = new mongoose.Schema({
  applicationNumber: { type: String, required: true, unique: true },
  applicationType: { type: String, required: true, enum: ['Chainsaw Registration'] },
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
    officialReceipt: [FileSchema],
    deedOfSale: [FileSchema],
    specialPowerOfAttorney: [FileSchema],
    forestTenureAgreement: [FileSchema],
    businessPermit: [FileSchema],
    certificateOfRegistration: [FileSchema],
    woodProcessingPlantPermit: [FileSchema],
  },
  dateOfSubmission: { type: Date, default: Date.now },
  status: { type: String, required: true },
});

const CSAWPermit = Permit.discriminator('CSAWPermit', CSAWPermitSchema);

module.exports = mongoose.model('CSAWPermit');
