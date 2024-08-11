const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signup, login, logout } = require('../controllers/userAuthControllers');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

// Protect routes with JWT
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});

router.get('/admin', passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']), (req, res) => {
    res.status(200).json({ message: 'Welcome Admin' });
});

module.exports = router;
