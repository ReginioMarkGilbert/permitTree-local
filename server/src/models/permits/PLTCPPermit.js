const mongoose = require('mongoose');
const Permit = require('./Permit');

const FileSchema = new mongoose.Schema({
   filename: String,
   contentType: String,
   data: Buffer
});

const PLTCPPermitSchema = new mongoose.Schema({
   applicationNumber: { type: String, required: true, unique: true },
   applicationType: { type: String, required: true, enum: ['Public Land Tree Cutting Permit'] },
   name: { type: String, required: true },
   address: { type: String, required: true },
   contactNumber: { type: String, required: true },
   treeType: [{ type: String, required: true }],
   treeStatus: [{ type: String, required: true }],
   landType: [{ type: String, required: true }],
   posingDanger: { type: Boolean, required: true },
   forPersonalUse: { type: Boolean, required: true },
   purpose: { type: String, required: true },
   files: {
      applicationLetter: [FileSchema],
      lguEndorsement: [FileSchema],
      homeownersResolution: [FileSchema],
      ptaResolution: [FileSchema]
   },
   dateOfSubmission: { type: Date, default: Date.now },
   status: { type: String, required: true },
   applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const PLTCPPermit = Permit.discriminator('PLTCPPermit', PLTCPPermitSchema);

module.exports = mongoose.model('PLTCPPermit');
