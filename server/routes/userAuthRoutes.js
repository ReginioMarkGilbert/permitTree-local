const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signup, login, logout } = require('../controllers/userAuthControllers');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

// Protect routes with JWT
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;

