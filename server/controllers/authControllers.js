const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcrypt');

const signup = async (req, res) => {
    const { username, password, phone, email } = req.body;
    const user = await User.findOne({ username });
    if (user) {
        return res.status(400).json({ message: 'User already exists' });
    }
    try {
        const hashpassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashpassword, phone, email });
        await newUser.save();
        return res.json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const login = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: 'Login failed' });
            return res.status(200).json({ message: 'Login successful', user });
        });
    })(req, res, next);
};

const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ message: 'Logged out' });
    });
};

module.exports = {
    signup,
    login,
    logout
};