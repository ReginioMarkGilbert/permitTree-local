const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   type: {
      type: String,
      required: true,
      enum: ['LOGIN', 'PROFILE_UPDATE', 'PASSWORD_CHANGE']
   },
   timestamp: {
      type: Date,
      default: Date.now
   },
   details: {
      type: String
   }
}, { timestamps: true });

// Index for faster queries
UserActivitySchema.index({ userId: 1, timestamp: -1 });

const UserActivity = mongoose.model('UserActivity', UserActivitySchema);

module.exports = UserActivity;
