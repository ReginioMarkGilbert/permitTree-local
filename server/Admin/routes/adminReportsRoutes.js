const express = require('express');
const router = express.Router();
const { getTotalUsers } = require('../controllers/adminReportsControllers');
const { authenticateToken } = require('../../middleware/authMiddleware');

router.get('/total-users', authenticateToken, getTotalUsers);

module.exports = router;
