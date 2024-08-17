const User = require('../models/userAuthSchema');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const signup = async (req, res) => {
    const { firstName, lastName, username, password } = req.body; // Include username in the destructuring

    const validatePassword = (password) => {
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || password.length < 8) {
            return false;
        }
        return true;
    };

    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Password does not meet requirements.' });
    }

    try {
        const newUser = new User({ firstName, lastName, username, password }); // Include username when creating the user
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { loginIdentifier, password } = req.body; // Use loginIdentifier instead of separate username and email
    try {
        const user = await User.findOne({ $or: [{ username: loginIdentifier }, { email: loginIdentifier }] }); // Check both username and email
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
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role // Add role to payload
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        // console.log('Generated token:', token); // Log the generated token
        res.status(200).json({ message: 'Login successful', token: `Bearer ${token}` });
    } catch (err) {
        console.error('Login error:', err); // Log the error
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