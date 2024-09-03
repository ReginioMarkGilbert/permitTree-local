const express = require('express');
const router = express.Router();
const passport = require('passport');
const { resetCounter, getTreeData, updateTreeData, createTreeData, getAdminData } = require('../../controllers/adminControllers/adminControllers');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.post('/resetCounter', resetCounter);

router.get('/getTreeData', getTreeData);
router.put('/updateTreeData', updateTreeData);
router.post('/createTreeData', createTreeData);

router.get('/admin-data', passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']), getAdminData);

module.exports = router;
