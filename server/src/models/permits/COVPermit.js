const mongoose = require('mongoose');
const Permit = require('./Permit');

const COVPermitSchema = new mongoose.Schema({
   treeSpecies: { type: String, required: true },
   quantity: { type: Number, required: true },
   location: { type: String, required: true },
   purposeOfTransport: { type: String, required: true },
   destinationAddress: { type: String, required: true },
   supportingDocuments: {
      proofOfOwnership: [String],
      transportationPermit: [String]
   }
});

const COVPermit = Permit.discriminator('COVPermit', COVPermitSchema);

module.exports = mongoose.model('COVPermit');
