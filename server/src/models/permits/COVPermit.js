const mongoose = require('mongoose');
const Permit = require('./Permit');

const FileSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer
});

const COVPermitSchema = new mongoose.Schema({
  applicationNumber: { type: String, required: true, unique: true },
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
    letterOfIntent: [FileSchema],
    tallySheet: [FileSchema],
    forestCertification: [FileSchema],
    orCr: [FileSchema],
    driverLicense: [FileSchema],
    specialPowerOfAttorney: [FileSchema]
  },
  dateOfSubmission: { type: Date, default: Date.now },
  status: { type: String, required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const COVPermit = Permit.discriminator('COVPermit', COVPermitSchema);

module.exports = mongoose.model('COVPermit');
