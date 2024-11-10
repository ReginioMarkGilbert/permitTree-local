const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
   certificateNumber: {
      type: String,
      required: true,
      unique: true
   },
   applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permit',
      required: true
   },
   applicationType: {
      type: String,
      required: true,
      enum: ['Chainsaw Registration', 'Certificate of Verification', 'Private Tree Plantation Registration',
         'Public Land Tree Cutting Permit', 'Private Land Timber Permit', 'Tree Cutting and/or Earth Balling Permit']
   },
   status: {
      type: String,
      enum: ['Pending Signature', 'Signed', 'Released'],
      default: 'Pending Signature'
   },
   dateCreated: {
      type: Date,
      default: Date.now
   },
   dateIssued: Date,
   expiryDate: Date,
   signedBy: {
      PENRO: {
         userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
         signature: String,
         dateSigned: Date
      }
   },
   certificateData: {
      registrationType: String,
      ownerName: String,
      address: String,
      chainsawDetails: {
         brand: String,
         model: String,
         serialNumber: String,
         dateOfAcquisition: Date,
         powerOutput: String,
         maxLengthGuidebar: String,
         countryOfOrigin: String,
         purchasePrice: Number
      },
      purpose: String,
      otherDetails: mongoose.Schema.Types.Mixed
   },
   uploadedCertificate: {
      fileUrl: String,
      uploadDate: Date,
      metadata: {
         certificateType: String,
         issueDate: Date,
         expiryDate: Date,
         remarks: String
      }
   }
}, {
   timestamps: true
});

module.exports = mongoose.model('Certificate', CertificateSchema);
