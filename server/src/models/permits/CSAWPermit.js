const mongoose = require('mongoose');
const Permit = require('./Permit');

const CSAWPermitSchema = new mongoose.Schema({
   registrationType: { type: String, required: true, enum: ['New', 'Renewal'] },
   chainsawStore: { type: String, required: true },
   brand: { type: String, required: true },
   model: { type: String, required: true },
   serialNumber: { type: String, required: true },
   powerOutput: { type: String, required: true },
   maxLengthGuidebar: { type: String, required: true },
   countryOfOrigin: { type: String, required: true },
   purchasePrice: { type: Number, required: true },
   dateOfAcquisition: { type: Date, required: true },
   supportingDocuments: {
      officialReceipt: [String],
      deedOfSale: [String],
      specialPowerOfAttorney: [String],
      forestTenureAgreement: [String],
      businessPermit: [String],
      certificateOfRegistration: [String],
      woodProcessingPlantPermit: [String]
   }
});

const CSAWPermit = Permit.discriminator('CSAWPermit', CSAWPermitSchema);

module.exports = mongoose.model('CSAWPermit');
