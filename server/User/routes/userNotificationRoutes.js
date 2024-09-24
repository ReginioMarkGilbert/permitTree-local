const express = require('express');
const router = express.Router();
const { getUserNotifications, markNotificationAsRead } = require('../controllers/userNotificationController');
const passport = require('passport');

router.get('/notifications', passport.authenticate('jwt', { session: false }), getUserNotifications);
router.put('/notifications/:id/read', passport.authenticate('jwt', { session: false }), markNotificationAsRead);

module.exports = router;
