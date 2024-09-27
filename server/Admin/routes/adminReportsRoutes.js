const express = require('express');
const router = express.Router();
const { getTotalUsers, getApplicationsForReview, getApplicationsReturned } = require('../controllers/adminReportsControllers');
const { authenticateToken } = require('../../middleware/authMiddleware');

router.get('/total-users', authenticateToken, getTotalUsers);
router.get('/applications-for-review', authenticateToken, getApplicationsForReview);
router.get('/applications-returned', authenticateToken, getApplicationsReturned);

module.exports = router;
