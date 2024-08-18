const express = require('express');
const router = express.Router();
const { csaw_createApplication,
    csaw_getApplications,
    csaw_updateApplication,
    csaw_deleteApplication } = require('../controllers/ChainsawApplicationController');

router.post('/csaw_createApplication', csaw_createApplication);
router.get('/csaw_getApplications', csaw_getApplications);
router.put('/csaw_updateApplication/:id', csaw_updateApplication);
router.delete('/csaw_deleteApplication/:id', csaw_deleteApplication);

module.exports = router;
