const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationAsRead } = require('../../controllers/userControllers/NotificationController');

router.get('/getNotifications', getNotifications);
router.put('/markNotificationAsRead/:id/read', markNotificationAsRead);

module.exports = router;