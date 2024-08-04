const express = require('express');
const passport = require('passport');
const UserProfile = require('../models/userProfileSchema');
const router = express.Router();

router.get('/user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = await UserProfile.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;