const express = require('express');
const router = express.Router();
const { getAllApplications, getApplicationById, getFile } = require('../../controllers/adminControllers/adminDashboardControllers');
const passport = require('passport');

// Route to get dashboard statistics
// router.get('/dashboard-stats', passport.authenticate('jwt', { session: false }), isAdmin, getDashboardStats);

// Route to get all applications
router.get('/all-applications', getAllApplications);
router.get('/getApplicationById/:id', getApplicationById);
router.get('/file/:applicationId/:fileType/:fileIndex', getFile);

module.exports = router;
