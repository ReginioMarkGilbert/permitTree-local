const express = require('express');
const router = express.Router();
// const { authenticateToken } = require('../../middleware/authMiddleware');
const { getUserOOP } = require('../controllers/userOOPControllers');

router.get('/oop/:applicationId', getUserOOP);

module.exports = router;
