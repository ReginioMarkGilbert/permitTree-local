const mongoose = require('mongoose');

const PermitSchema = new mongoose.Schema({
   applicationType: {
      type: String,
      required: true,
      enum: ['CSAW', 'COV', 'PLTP', 'PTPR', 'SPLTP', 'TCEBP']
   },
   applicationNumber: { type: String, required: true, unique: true },
   applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   status: {
      type: String,
      required: true,
      enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed']
   },
   dateOfSubmission: { type: Date, default: Date.now },
   lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Add a virtual for 'id'
PermitSchema.virtual('id').get(function() {
   return this._id.toHexString();
});

// Ensure virtual fields are serialized
PermitSchema.set('toJSON', {
   virtuals: true
});

module.exports = mongoose.model('Permit', PermitSchema);
