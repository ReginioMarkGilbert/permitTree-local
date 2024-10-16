const mongoose = require('mongoose');
const Permit = require('./Permit');

const TCEBPPermitSchema = new mongoose.Schema({
   projectName: { type: String, required: true },
   projectLocation: { type: String, required: true },
   treeSpecies: [{ type: String, required: true }],
   numberOfTrees: { type: Number, required: true },
   cuttingMethod: { type: String, required: true },
   dispositionPlan: { type: String, required: true },
   agencyName: { type: String, required: true },
   supportingDocuments: {
      projectProposal: [String],
      environmentalComplianceCertificate: [String],
      treeInventory: [String]
   }
});

const TCEBPPermit = Permit.discriminator('TCEBPPermit', TCEBPPermitSchema);

module.exports = mongoose.model('TCEBPPermit');
