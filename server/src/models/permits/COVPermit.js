const mongoose = require('mongoose');
const Permit = require('./Permit');

const COVPermitSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  applicationType: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  cellphone: { type: String, required: true },
  purpose: { type: String, required: true },
  driverName: { type: String, required: true },
  driverLicenseNumber: { type: String, required: true },
  vehiclePlateNumber: { type: String, required: true },
  originAddress: { type: String, required: true },
  destinationAddress: { type: String, required: true },
  files: {
    letterOfIntent: [String],
    tallySheet: [String],
    forestCertification: [String],
    orCr: [String],
    driverLicense: [String],
    specialPowerOfAttorney: [String]
  },
  dateOfSubmission: { type: Date, default: Date.now },
  status: { type: String, required: true },
  // Add these two fields
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationNumber: { type: String, required: true }
});

const COVPermit = Permit.discriminator('COVPermit', COVPermitSchema);

module.exports = mongoose.model('COVPermit');
