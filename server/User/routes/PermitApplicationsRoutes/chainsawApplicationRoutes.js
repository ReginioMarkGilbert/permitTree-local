const express = require('express');
const router = express.Router();
const passport = require('passport');
const fileUpload = require('express-fileupload');
const {
    csaw_createApplication,
    csaw_getApplications,
    csaw_updateApplication,
    csaw_deleteApplication,
    csaw_saveDraft,
    resetCounter,
    csaw_getApplicationById,
    submitDraft,
    unsubmitApplication
} = require('../../controllers/permitApplicationControllers/ChainsawApplicationController');

router.post('/csaw_createApplication', passport.authenticate('jwt', { session: false }), csaw_createApplication);
router.get('/csaw_getApplications', passport.authenticate('jwt', { session: false }), csaw_getApplications);
router.put('/csaw_updateApplication/:id',
    passport.authenticate('jwt', { session: false }),
    csaw_updateApplication
);
router.delete('/csaw_deleteApplication/:id', passport.authenticate('jwt', { session: false }), csaw_deleteApplication);
router.post('/csaw_saveDraft', passport.authenticate('jwt', { session: false }), csaw_saveDraft);
router.post('/resetCounterChainsaw', passport.authenticate('jwt', { session: false }), resetCounter);
router.get('/csaw_getApplicationById/:id', passport.authenticate('jwt', { session: false }), csaw_getApplicationById);
router.put('/csaw_submitDraft/:id', passport.authenticate('jwt', { session: false }), submitDraft);
router.put('/csaw_unsubmitApplication/:id', passport.authenticate('jwt', { session: false }), unsubmitApplication);

module.exports = router;