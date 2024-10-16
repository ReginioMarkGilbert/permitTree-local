const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
   certificateNumber: { type: String, required: true, unique: true },
   permitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permit', required: true },
   status: { type: String, required: true, enum: ['Pending', 'Approved', 'Issued'] },
   dateIssued: Date,
   expiryDate: Date,
   signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
   }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
