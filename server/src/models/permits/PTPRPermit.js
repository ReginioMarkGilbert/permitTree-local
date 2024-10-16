const mongoose = require('mongoose');
const Permit = require('./Permit');

const PTPRPermitSchema = new mongoose.Schema({
   landOwner: { type: String, required: true },
   landLocation: { type: String, required: true },
   totalArea: { type: Number, required: true },
   treeSpecies: [{ type: String }],
   estimatedVolume: { type: Number },
   plantingDate: { type: Date },
   supportingDocuments: {
      proofOfLandOwnership: [String],
      plantationMap: [String],
      inventoryReport: [String]
   }
});

const PTPRPermit = Permit.discriminator('PTPRPermit', PTPRPermitSchema);

module.exports = mongoose.model('PTPRPermit');
