const User = require('../models/userAuthSchema');
const UserIdCounter = require('../models/UserIdcounterSchema');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const signup = async (req, res) => {
    const { firstName, lastName, password } = req.body;
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;

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
        const userIdCounter = await UserIdCounter.findOneAndUpdate(
            { name: 'userId' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );

        const newUser = new User({
            userId: userIdCounter.value,
            firstName,
            lastName,
            username,
            password
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token: `Bearer ${token}` });
    } catch (err) {
        console.error('Login error:', err);
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