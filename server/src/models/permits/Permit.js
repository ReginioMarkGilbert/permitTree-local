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
      enum: ['Draft', 'Submitted', 'Returned', 'Accepted', 'Rejected', 'In Progress', 'Approved', 'Completed']
   },
   currentStage: {
      type: String,
      required: true,
      enum: [
         'Draft',
         'Submitted',

         'TechnicalStaffReview',
         'ReturnedByTechnicalStaff',
         'AuthenticityApprovedByTechnicalStaff',

         'ReceivingClerkReview',
         'ReturnedByReceivingClerk',
         'ForRecordByReceivingClerk',

         'CENRPENRReview',
         'ReturnedByPENRCENROfficer',

         'ChiefRPSReview',

         'AwaitingOOP',

         'ForInspectionByTechnicalStaff',
         'ApprovedByTechnicalStaff',

         'PendingRelease',
         'Released'
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

   awaitingPermitCreation: { type: Boolean, default: false },
   PermitCreated: { type: Boolean, default: false },
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
   lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Add a pre-save hook to ensure history is always an array
PermitSchema.pre('save', function (next) {
   if (!this.history) {
      this.history = [];
   }
   next();
});

module.exports = mongoose.model('Permit', PermitSchema);
