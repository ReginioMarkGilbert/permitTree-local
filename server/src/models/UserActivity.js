const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel'
   },
   userModel: {
      type: String,
      required: true,
      enum: ['User', 'Admin']
   },
   type: {
      type: String,
      required: true,
      enum: [
         'LOGIN',
         'LOGOUT',
         'PROFILE_UPDATE',
         'PASSWORD_CHANGE',
         'APPLICATION_SUBMIT',
         'PAYMENT_MADE',
         'DOCUMENT_UPLOAD',
         'ACCOUNT_CREATED',
         'PERMIT_RECEIVED',
         'EMAIL_VERIFIED',
         'SETTINGS_UPDATED'
      ]
   },
   timestamp: {
      type: Date,
      default: Date.now
   },
   details: {
      type: String
   },
   metadata: {
      ip: String,
      userAgent: String,
      location: String,
      deviceType: String,
      applicationId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Permit'
      },
      documentType: String,
      amount: Number,
      isAdmin: Boolean,
      userType: String
   }
}, {
   timestamps: true,
   index: { userId: 1, timestamp: -1 }
});

const UserActivity = mongoose.model('UserActivity', UserActivitySchema);

module.exports = UserActivity;
