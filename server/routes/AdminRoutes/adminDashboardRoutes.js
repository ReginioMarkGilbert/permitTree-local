const express = require('express');
const router = express.Router();
const { getAllApplications } = require('../../controllers/adminControllers/adminDashboardControllers');
const passport = require('passport');
// const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');

// Route to get dashboard statistics
// router.get('/dashboard-stats', passport.authenticate('jwt', { session: false }), isAdmin, getDashboardStats);

// Route to get all applications
router.get('/all-applications', getAllApplications);

module.exports = router;
