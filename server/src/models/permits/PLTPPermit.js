const mongoose = require('mongoose');
const Permit = require('./Permit');

const PLTPPermitSchema = new mongoose.Schema({
   location: { type: String, required: true },
   treeSpecies: [{ type: String, required: true }],
   numberOfTrees: { type: Number, required: true },
   purposeOfCutting: { type: String, required: true },
   publicLandType: {
      type: String,
      required: true,
      enum: ['Plaza', 'Public Park', 'School Premises', 'Political Subdivision']
   },
   supportingDocuments: {
      requestLetter: [String],
      siteInspectionReport: [String],
      treeInventory: [String],
      publicLandCertification: [String]
   }
});

const PLTPPermit = Permit.discriminator('PLTPPermit', PLTPPermitSchema);

module.exports = mongoose.model('PLTPPermit');
