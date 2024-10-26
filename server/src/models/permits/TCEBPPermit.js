const mongoose = require('mongoose');
const Permit = require('./Permit');

const FileSchema = new mongoose.Schema({
   filename: String,
   contentType: String,
   data: Buffer
});

const TCEBPPermitSchema = new mongoose.Schema({
   applicationNumber: { type: String, required: true, unique: true },
   applicationType: { type: String, required: true, default: 'Tree Cutting and/or Earth Balling Permit' },
   requestType: { type: String, required: true, enum: ['Cutting', 'Inventory'] },
   name: { type: String, required: true },
   address: { type: String, required: true },
   contactNumber: { type: String, required: true },
   purpose: { type: String, required: true },
   files: {
      letterOfIntent: [FileSchema],
      lguEndorsement: [FileSchema],
      landTenurial: [FileSchema],
      siteDevelopmentPlan: [FileSchema],
      environmentalCompliance: [FileSchema],
      fpic: [FileSchema],
      ownerConsent: [FileSchema],
      pambClearance: [FileSchema]
   },
   dateOfSubmission: { type: Date, default: Date.now },
   // status: { type: String, required: true, enum: ['Draft', 'Submitted', 'Returned', 'Accepted', 'Rejected', 'In Progress', 'Approved', 'Completed'] },
   applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   currentStage: {
      type: String,
      required: true,
      enum: [
         'Submitted',
         'TechnicalStaffReview',
         'ReturnedByTechnicalStaff',
         'ForRecordByReceivingClerk',
         'ChiefRPSReview',
         'ForInspectionByTechnicalStaff',
         'ApprovedByTechnicalStaff'
      ],
      default: 'Submitted'
   }
});

const TCEBPPermit = Permit.discriminator('TCEBPPermit', TCEBPPermitSchema);

module.exports = TCEBPPermit;
