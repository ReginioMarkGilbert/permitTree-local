const express = require('express');
const { body, validationResult } = require('express-validator');
const { signup, login, logout, getUserDetails, updateUserProfile } = require('../controllers/userAuthControllers');
const roleMiddleware = require('../../middleware/roleMiddleware');
const passport = require('passport');
const router = express.Router();

const validateSignup = [
    body('firstName').isString().notEmpty(),
    body('lastName').isString().notEmpty(),
    body('password').isString().isLength({ min: 8 }),
    (req, res, next) => {
        console.log('Validating signup data...');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        console.log('Validation passed.');
        next();
    }
];

router.post('/signup', validateSignup, signup);
router.post('/login', login);
router.get('/logout', logout);
// Add a new route to get user details, protected by JWT
router.get('/user-details', passport.authenticate('jwt', { session: false }), getUserDetails);

// Protect routes with JWT
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});

router.get('/admin', passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']), (req, res) => {
    res.status(200).json({ message: 'Welcome Admin' });
});

// Add a new route to update user profile
router.put('/user-profile', passport.authenticate('jwt', { session: false }), updateUserProfile);

module.exports = router;