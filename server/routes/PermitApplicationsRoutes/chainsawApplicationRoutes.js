const express = require('express');
const router = express.Router();
const { csaw_createApplication,
    csaw_getApplications,
    csaw_updateApplication,
    csaw_deleteApplication,
    csaw_saveDraft } = require('../../controllers/permitApplicationControllers/ChainsawApplicationController');

router.post('/csaw_createApplication', csaw_createApplication);
router.get('/csaw_getApplications', csaw_getApplications);
router.put('/csaw_updateApplication/:id', csaw_updateApplication);
router.delete('/csaw_deleteApplication/:id', csaw_deleteApplication);
router.post('/csaw_saveDraft', csaw_saveDraft);

module.exports = router;
