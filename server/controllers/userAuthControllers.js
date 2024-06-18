const User = require('../models/userAuthSchema');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const signup = async (req, res) => {
    const { username, password, phone, email } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new User({ username, password, phone, email });
        await newUser.save();
        return res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Replace $2y$ with $2a$ if present
        const correctedHash = user.password.replace(/^\$2y\$/, '$2a$');

        const isMatch = await bcrypt.compare(password, correctedHash);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(400).json({ message: 'Invalid credentials' });
        } else {
            console.log("Password match");
        }

        const payload = {
            id: user.id,
            username: user.username
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token: `Bearer ${token}` });
    } catch (err) {
        res.status(500).json({ message: 'Login failed' });
    }
};

const logout = (req, res) => {
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
