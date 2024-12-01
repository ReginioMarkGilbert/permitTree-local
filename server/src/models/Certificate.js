const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
   certificateNumber: { type: String, required: true, unique: true },
   applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permit', required: true },
   applicationNumber: { type: String },
   applicationType: {
      type: String,
      required: true,
      enum: ['Chainsaw Registration', 'Certificate of Verification', 'Private Tree Plantation Registration',
         'Public Land Tree Cutting Permit', 'Private Land Timber Permit', 'Tree Cutting and/or Earth Balling Permit']
   },
   certificateStatus: {
      type: String,
      enum: ['Pending Signature', 'Complete Signatures', 'Released'],
      default: 'Pending Signature'
   },
   dateCreated: { type: Date, default: Date.now },
   dateIssued: Date,
   expiryDate: Date,

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
      fileData: Buffer,
      filename: String,
      contentType: String,
      uploadDate: {
         type: Date,
         default: Date.now
      },
      metadata: {
         certificateType: String,
         issueDate: Date,
         expiryDate: Date,
         remarks: String
      }
   },
   oopId: { type: mongoose.Schema.Types.ObjectId, ref: 'OOP' },
   signature: {
      data: Buffer,
      contentType: String
   }
}, {
   timestamps: true,
   toObject: {
      virtuals: true,
      transform: function(doc, ret) {
         ret.id = ret._id.toString();
         delete ret._id;
         delete ret.__v;
         return ret;
      }
   },
   toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
         ret.id = ret._id.toString();
         delete ret._id;
         delete ret.__v;
         return ret;
      }
   }
});

CertificateSchema.virtual('orderOfPayment', {
   ref: 'OOP',
   localField: 'applicationNumber',
   foreignField: 'applicationNumber',
   justOne: true
});

module.exports = mongoose.model('Certificate', CertificateSchema);
