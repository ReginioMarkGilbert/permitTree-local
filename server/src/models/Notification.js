const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      // Application Related
      'APPLICATION_SUBMITTED',
      'APPLICATION_UNDER_REVIEW',
      'APPLICATION_ACCEPTED',
      'APPLICATION_RETURNED',
      'APPLICATION_APPROVED',
      'APPLICATION_REJECTED',
      'APPLICATION_NEEDS_REVIEW',
      'APPLICATION_ACCEPTED_BY_TECHNICAL',
      'APPLICATION_RETURNED_BY_TECHNICAL',
      'APPLICATION_WITH_RECEIVING_CLERK',
      'APPLICATION_RECORDED',
      'APPLICATION_WITH_CHIEF',
      'APPLICATION_REVIEWED_BY_CHIEF',
      'APPLICATION_WITH_PENRCENR',
      'APPLICATION_APPROVED_BY_PENRCENR',
      'APPLICATION_FOR_INSPECTION',
      'APPLICATION_INSPECTION_COMPLETE',

      // OOP Related
      'OOP_CREATED',
      'OOP_SIGNED',
      'OOP_APPROVED',
      'OOP_READY_FOR_PAYMENT',
      'OOP_NEEDS_APPROVAL',
      'OOP_NEEDS_SIGNATURE',

      // Payment Related
      'PAYMENT_RECEIVED',
      'PAYMENT_VERIFIED',
      'PAYMENT_REJECTED',
      'OR_ISSUED',

      // Permit Related
      'PERMIT_READY',
      'PERMIT_SIGNED',
      'PERMIT_RELEASED'
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
    remarks: String
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

module.exports = mongoose.model('Notification', NotificationSchema);
