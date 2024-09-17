const express = require('express');
const router = express.Router();
const passport = require('passport');
const { csaw_createApplication,
    csaw_getApplications,
    csaw_updateApplication,
    csaw_deleteApplication,
    csaw_saveDraft,
    resetCounter } = require('../../controllers/permitApplicationControllers/ChainsawApplicationController');

router.post('/csaw_createApplication', passport.authenticate('jwt', { session: false }), csaw_createApplication);
router.get('/csaw_getApplications', passport.authenticate('jwt', { session: false }), csaw_getApplications);
router.put('/csaw_updateApplication/:id', passport.authenticate('jwt', { session: false }), csaw_updateApplication);
router.delete('/csaw_deleteApplication/:id', passport.authenticate('jwt', { session: false }), csaw_deleteApplication);
router.post('/csaw_saveDraft', passport.authenticate('jwt', { session: false }), csaw_saveDraft);
router.post('/resetCounterChainsaw', passport.authenticate('jwt', { session: false }), resetCounter);

module.exports = router;
