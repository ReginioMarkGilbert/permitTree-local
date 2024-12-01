const mongoose = require('mongoose');

const PermitSchema = new mongoose.Schema({
   applicationType: {
      type: String,
      required: true,
      enum: [
         'Chainsaw Registration', // CSAW
         'Certificate of Verification', // COV
         'Private Tree Plantation Registration', // PTPR
         'Public Land Tree Cutting Permit', // PLTCP
         'Private Land Timber Permit', // PLTP
         'Tree Cutting and/or Earth Balling Permit' // TCEBP
      ]
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
      enum: ['Draft', 'Submitted', 'In Progress', 'Returned', 'Accepted', 'Released', 'Completed', 'Rejected', 'Expired', 'Renewed']
   },
   currentStage: {
      type: String,
      required: true,
      enum: [
         'Draft',
         'Submitted',

         'TechnicalStaffReview',
         'ReturnedByTechnicalStaff',

         'ForRecordByReceivingClerk',

         'ChiefRPSReview',
         'CENRPENRReview',

         'ForInspectionByTechnicalStaff',
         'AuthenticityApprovedByTechnicalStaff',
         'ApprovedByTechnicalStaff',

         'InspectionReportForReviewByChief',
         'InspectionReportForReviewByPENRCENROfficer',

         'PendingSignatureByChief',
         'PendingSignatureByPENRCENROfficer',

         'PendingRelease',
         'Released',

         'ReceivingClerkReview',
         'ReturnedByReceivingClerk',

         'ForRenewal',
         'Renewed'
      ]
   },
   acceptedByTechnicalStaff: { type: Boolean, default: false },
   approvedByTechnicalStaff: { type: Boolean, default: false },

   acceptedByReceivingClerk: { type: Boolean, default: false },
   recordedByReceivingClerk: { type: Boolean, default: false },

   acceptedByPENRCENROfficer: { type: Boolean, default: false },
   approvedByPENRCENROfficer: { type: Boolean, default: false },

   reviewedByChief: { type: Boolean, default: false },

   awaitingOOP: { type: Boolean, default: false },
   OOPCreated: { type: Boolean, default: false }, // for Created OOP tab in Chief/PENRCENROfficer/Accountant Dashboards

   hasInspectionReport: { type: Boolean, default: false },
   InspectionReportsReviewedByChief: { type: Boolean, default: false },
   InspectionReportsReviewedByPENRCENROfficer: { type: Boolean, default: false },

   awaitingPermitCreation: { type: Boolean, default: false },
   PermitCreated: { type: Boolean, default: false },

   certificateSignedByPENRCENROfficer: { type: Boolean, default: false },

   certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
   hasCertificate: { type: Boolean, default: false },

   history: [{
      stage: String,
      status: String,
      timestamp: Date,
      notes: String,
      actionBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      }
   }],
   dateOfSubmission: { type: Date, default: Date.now },
   lastUpdated: { type: Date, default: Date.now },

}, { timestamps: true });

// Initialize history as an array if missing before save
PermitSchema.pre('save', function (next) {
   if (!this.history) {
      this.history = [];
   }
   next();
});

module.exports = mongoose.model('Permit', PermitSchema);
