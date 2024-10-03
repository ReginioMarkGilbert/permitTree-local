const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getApplicationById } = require('../../controllers/permitApplicationControllers/AllPermitsController');
const { getAllApplications } = require('../../../Admin/controllers/admin_controllers/adminDashboardControllers');

// Route to get all applications
router.get('/getAllApplications', getAllApplications);

// Route to get a specific application by ID
router.get('/getApplicationById/:id/:applicationType?', getApplicationById);

module.exports = router;
