const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authenticateToken } = require('../../../middleware/authMiddleware');
const {
    csaw_createApplication,
    getAllApplications, // Use the new generic function
    csaw_updateApplication,
    csaw_deleteApplication,
    csaw_saveDraft,
    resetCounter,
    csaw_getApplicationById,
    submitDraft,
    unsubmitApplication,
    submitReturnedApplication
} = require('../../controllers/permitApplicationControllers/ChainsawApplicationController');

router.post('/csaw_createApplication', passport.authenticate('jwt', { session: false }), csaw_createApplication);
// router.get('/csaw_getApplications', passport.authenticate('jwt', { session: false }), csaw_getApplications);
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
router.put('/csaw_submitReturnedApplication/:id', authenticateToken, submitReturnedApplication);

// Update this route to use the generic function
router.get('/getAllApplications', passport.authenticate('jwt', { session: false }), getAllApplications);

module.exports = router;
