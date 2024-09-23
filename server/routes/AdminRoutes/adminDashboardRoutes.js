const express = require('express');
const router = express.Router();
const { getAllApplications, getApplicationById, getFile, printApplication, updateApplicationStatus, returnApplication } = require('../../controllers/adminControllers/adminDashboardControllers');
const passport = require('passport');

// Route to get dashboard statistics
// router.get('/dashboard-stats', passport.authenticate('jwt', { session: false }), isAdmin, getDashboardStats);

// Route to get all applications
router.get('/all-applications', getAllApplications);
router.get('/getApplicationById/:id', getApplicationById);
router.get('/file/:applicationId/:fileType/:fileIndex', getFile);
router.get('/print/:id', printApplication);
router.put('/update-status/:id', updateApplicationStatus);
router.put('/return-application/:id', returnApplication);

module.exports = router;
