const Notification = require('../models/adminNotificationSchema');

const sendNotificationToUser = async (req, res) => {
    try {
        const { userId, message, applicationId } = req.body;
        const notification = new Notification({
            userId,
            message,
            applicationId
        });
        await notification.save();
        res.status(201).json({ message: 'Notification sent successfully', notification });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: 'Error sending notification' });
    }
};

module.exports = {
    sendNotificationToUser
};
