const mongoose = require('mongoose');
const Permit = require('./Permit');

const FileSchema = new mongoose.Schema({
   filename: String,
   contentType: String,
   data: Buffer
});

const PLTPPermitSchema = new mongoose.Schema({
   applicationNumber: { type: String, required: true, unique: true },
   applicationType: { type: String, required: true, default: 'Private Land Timber Permit' },
   name: { type: String, required: true },
   address: { type: String, required: true },
   contactNumber: { type: String, required: true },
   plantedTrees: { type: Boolean, required: true },
   naturallyGrown: { type: Boolean, required: true },
   standing: { type: Boolean, required: true },
   blownDown: { type: Boolean, required: true },
   withinPrivateLand: { type: Boolean, required: true },
   withinTenuredForestLand: { type: Boolean, required: true },
   posingDanger: { type: Boolean, required: true },
   forPersonalUse: { type: Boolean, required: true },
   purpose: { type: String, required: true },
   files: {
      letterOfIntent: [FileSchema],
      lguEndorsement: [FileSchema],
      titleCertificate: [FileSchema],
      darCertificate: [FileSchema],
      specialPowerOfAttorney: [FileSchema],
      ptaResolution: [FileSchema]
   },
   dateOfSubmission: { type: Date, default: Date.now },
   status: { type: String, required: true },
   applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const PLTPPermit = Permit.discriminator('PLTPPermit', PLTPPermitSchema);

module.exports = mongoose.model('PLTPPermit');
