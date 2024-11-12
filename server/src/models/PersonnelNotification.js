const mongoose = require('mongoose');

const PersonnelNotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'PENDING_TECHNICAL_REVIEW',
      'PENDING_RECEIVING_CLERK_RECORD',

      'PENDING_CHIEF_REVIEW',
      'PENDING_PENRCENR_APPROVAL',

      'PENDING_INSPECTION',

      'PENDING_PERMIT_CREATION',
      'PENDING_PERMIT_SIGNING',
      'PENDING_PERMIT_RELEASE',

      'APPLICATION_RETURNED',
      'APPLICATION_APPROVED',

      'OOP_PENDING_APPROVAL',
      'OOP_PENDING_SIGNATURE',
      'PAYMENT_PENDING_VERIFICATION',

      'APPLICATION_RECORDED'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permit'
    },
    oopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OOP'
    },
    stage: String,
    status: String,
    remarks: String,
    actionRequired: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PersonnelNotification', PersonnelNotificationSchema);
