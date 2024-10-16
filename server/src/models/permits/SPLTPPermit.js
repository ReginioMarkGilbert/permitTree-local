const mongoose = require('mongoose');
const Permit = require('./Permit');

const SPLTPPermitSchema = new mongoose.Schema({
   landOwner: { type: String, required: true },
   landLocation: { type: String, required: true },
   treeSpecies: [{ type: String, required: true }],
   volumeToHarvest: { type: Number, required: true },
   harvestingMethod: { type: String, required: true },
   transportationMethod: { type: String, required: true },
   supportingDocuments: {
      proofOfLandOwnership: [String],
      inventoryReport: [String],
      harvestingPlan: [String]
   }
});

const SPLTPPermit = Permit.discriminator('SPLTPPermit', SPLTPPermitSchema);

module.exports = mongoose.model('SPLTPPermit');
