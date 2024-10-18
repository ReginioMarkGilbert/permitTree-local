const mongoose = require('mongoose');
const Permit = require('./Permit');

const FileSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer
});

const PTPRPermitSchema = new mongoose.Schema({
   applicationNumber: { type: String, required: true, unique: true },
   applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   applicationType: { type: String, required: true, enum: ['Private Tree Plantation Registration'] },
   ownerName: { type: String, required: true },
   address: { type: String, required: true },
   contactNumber: { type: String, required: true },
   lotArea: { type: Number, required: true },
   treeSpecies: [{ type: String }],
   totalTrees: { type: Number, required: true },
   treeSpacing: { type: String, required: true },
   yearPlanted: { type: Number, required: true },
   files: {
      letterRequest: [FileSchema],
      titleOrTaxDeclaration: [FileSchema],
      darCertification: [FileSchema],
      specialPowerOfAttorney: [FileSchema]
   },
   dateOfSubmission: { type: Date, default: Date.now },
   status: { type: String, required: true }
});

const PTPRPermit = Permit.discriminator('PTPRPermit', PTPRPermitSchema);

module.exports = mongoose.model('PTPRPermit');
