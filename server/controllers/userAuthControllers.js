const User = require('../models/userAuthSchema');
const UserIdCounter = require('../models/UserIdcounterSchema');
const Admin = require('../models/admin/adminAuthSchema');
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
        // Generate JWT token here
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'User created successfully', user: newUser, token: `Bearer ${token}`, user: newUser });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // First, try to find the user in the 'User' collection
        let user = await User.findOne({ username });

        // If the user is not found in the 'User' collection, check the 'Admin' collection
        if (!user) {
            user = await Admin.findOne({ username });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Payload for JWT token
        const payload = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role // User or Admin role
        };

        // Generate JWT token
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

const createAdmin = async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { username, password, firstName, lastName } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'admin'
        });

        await newUser.save();
        res.status(201).json({ message: 'Admin created successfully', newUser });
    } catch (err) {
        console.error('Create admin error:', err);
        res.status(500).json({ message: 'Failed to create admin' });
    }
};

module.exports = {
    signup,
    login,
    logout,
    createAdmin // Add this line to export the createAdmin function
};
