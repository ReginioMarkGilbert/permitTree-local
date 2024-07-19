const express = require('express');
const UserProfile = require('../models/userProfileSchema');
const router = express.Router();

router.get('/user', async (req, res) => {
    try {
        const user = await UserProfile.findById(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;