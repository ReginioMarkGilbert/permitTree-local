const express = require('express');
const router = express.Router();
const { getUserDetails, updateUserDetails } = require('../../controllers/userControllers/userProfileControllers');

router.get('/profile', getUserDetails);
router.put('/profile', updateUserDetails);

module.exports = router;