const User = require('../../models/User/userAuthSchema');
const UserIdCounter = require('../../models/User/UserIdcounterSchema');
const Admin = require('../../models/Admin/adminAuthSchema');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

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
            // { expiresIn: '7d' }
        );

        res.status(201).json({ message: 'User created successfully', user: newUser, token: `Bearer ${token}` });
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

const getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userDetails = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            company: user.company,
            profilePicture: user.profilePicture && user.profilePicture.data
                ? {
                    data: user.profilePicture.data.toString('base64'),
                    contentType: user.profilePicture.contentType
                }
                : null
        };

        res.status(200).json({ user: userDetails });
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ message: 'Error fetching user details' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, email, phone, company, address, removeProfilePicture } = req.body;

        let updateData = {
            firstName,
            lastName,
            email,
            phone,
            company,
            address
        };

        if (removeProfilePicture === 'true') {
            updateData.profilePicture = null;
        } else if (req.files && req.files.profilePicture) {
            const file = req.files.profilePicture;
            updateData.profilePicture = {
                data: file.data,
                contentType: file.mimetype
            };
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ message: 'Error updating user profile', error: err.message });
    }
};

module.exports = {
    signup,
    login,
    logout,
    createAdmin,
    getUserDetails,
    updateUserProfile
};
