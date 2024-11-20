const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
   filename: String,
   contentType: String,
   data: Buffer
});

const InspectionSchema = new mongoose.Schema({
   permitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permit',
      required: true
   },
   applicationNumber: {
      type: String,
      required: true
   },
   applicationType: {
      type: String,
      required: true
   },
   scheduledDate: {
      type: Date,
      required: true
   },
   scheduledTime: {
      type: String,
      required: true
   },
   location: {
      type: String,
      required: true
   },
   inspectionStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Rescheduled', 'Cancelled'],
      default: 'Pending'
   },
   inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
   },
   findings: {
      result: {
         type: String,
         enum: ['Pass', 'Fail', 'Needs Modification'],
      },
      observations: String,
      recommendations: String,
      attachments: [FileSchema]
   },
   history: [{
      action: String,
      timestamp: {
         type: Date,
         default: Date.now
      },
      notes: String,
      performedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Admin'
      }
   }]
}, { timestamps: true });

module.exports = mongoose.model('Inspection', InspectionSchema);
