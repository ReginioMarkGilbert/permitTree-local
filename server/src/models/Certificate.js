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
      enum: ['Pending Signature', 'Complete Signatures', 'Stamped Certificate', 'Released', 'Expired', 'Renewed'],
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

// Add a method to check if certificate is expired
CertificateSchema.methods.isExpired = function() {
   return this.expiryDate && new Date() > this.expiryDate;
};

// Add pre-save middleware to check expiration
CertificateSchema.pre('save', async function(next) {
   // Check if expiry date has passed
   if (this.expiryDate && new Date() > this.expiryDate) {
      this.certificateStatus = 'Expired';

      // Update associated permit
      try {
         await mongoose.model('Permit').findByIdAndUpdate(
            this.applicationId,
            {
               $set: {
                  status: 'Expired',
                  currentStage: 'ForRenewal'
               }
            }
         );
      } catch (error) {
         console.error('Error updating permit on certificate expiration:', error);
      }
   }
   next();
});

// Add a new method to sync status with permit
CertificateSchema.methods.syncWithPermit = async function(permit) {
   if (permit.status === 'Expired' && permit.currentStage === 'ForRenewal') {
      this.certificateStatus = 'Expired';
      await this.save();
   }
};

module.exports = mongoose.model('Certificate', CertificateSchema);
