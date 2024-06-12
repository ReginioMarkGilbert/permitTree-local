const express = require('express');
const router = express.Router();
const { resetCounter, getTreeData, updateTreeData, createTreeData } = require('../../controllers/adminControllers/admin_controllers');

router.post('/resetCounter', resetCounter);

router.get('/getTreeData', getTreeData);
router.put('/updateTreeData', updateTreeData);
router.post('/createTreeData', createTreeData);

module.exports = router;
