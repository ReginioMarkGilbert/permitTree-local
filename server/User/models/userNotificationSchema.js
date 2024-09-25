const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    type: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserNotification', userNotificationSchema);
