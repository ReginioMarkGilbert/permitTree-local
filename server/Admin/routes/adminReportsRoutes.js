const express = require('express');
const router = express.Router();
const { getTotalUsers, getApplicationsForReview } = require('../controllers/adminReportsControllers');
const { authenticateToken } = require('../../middleware/authMiddleware');

router.get('/total-users', authenticateToken, getTotalUsers);
router.get('/applications-for-review', authenticateToken, getApplicationsForReview);

module.exports = router;
