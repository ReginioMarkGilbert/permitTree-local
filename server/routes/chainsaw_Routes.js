const express = require('express');
const router = express.Router();
const { csaw_createApplication,
    csaw_getApplications,
    csaw_updateApplication,
    csaw_deleteApplication } = require('../controllers/ChainsawApplicationController');

const { getNotifications, markNotificationAsRead } = require('../controllers/NotificationController');

router.post('/csaw_createApplication', csaw_createApplication);
router.get('/csaw_getApplications', csaw_getApplications);
router.put('/csaw_updateApplication/:id', csaw_updateApplication);
router.delete('/csaw_deleteApplication/:id', csaw_deleteApplication);

router.get('/getNotifications', getNotifications);
router.put('/markNotificationAsRead/:id/read', markNotificationAsRead);

module.exports = router;
