const express = require('express');
const router = express.Router();
const { createAdmin, getAdmins } = require('../controllers/adminAuthControllers');

// http://localhost:3000/api/admin/create-admin
router.post('/create-admin', createAdmin);
// http://localhost:3000/api/admin/admins
router.get('/admins', getAdmins);

module.exports = router;
