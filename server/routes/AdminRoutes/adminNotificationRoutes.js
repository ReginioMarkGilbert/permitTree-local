const express = require('express');
const router = express.Router();
const { sendNotificationToUser } = require('../../controllers/adminControllers/adminNotificationControllers');
const passport = require('passport');

router.post('/send-notification', passport.authenticate('jwt', { session: false }), sendNotificationToUser);

module.exports = router;
