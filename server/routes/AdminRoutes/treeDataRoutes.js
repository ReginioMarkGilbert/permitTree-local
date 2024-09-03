const express = require('express');
const router = express.Router();
const passport = require('passport');
const { resetCounter, getTreeData, updateTreeData, createTreeData } = require('../../controllers/adminControllers/treeDataControllers');

router.post('/resetCounter', resetCounter);

router.get('/getTreeData', getTreeData);
router.put('/updateTreeData', updateTreeData);
router.post('/createTreeData', createTreeData);

module.exports = router;
