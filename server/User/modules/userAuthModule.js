const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
// const UserIdCounter = require('../models/UserIdcounterSchema');
// const Admin = require('../../Admin/models/admin_models/adminAuthSchema');
const { Admin } = require('../../Admin/AdminModules/adminAuthModule');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: {
    type: String,
    enum: [
      'superadmin',
      'Chief_RPS',
      'user',
      'Technical_Staff',
      'Chief_TSD',
      'Recieving_Clerk',
      'Releasing_Clerk',
      'Accountant',
      'Bill_Collector',
      'PENR_CENR_Officer'
    ],
    default: 'user'
  },
  email: { type: String, required: false, unique: false },
  phone: { type: String, required: false, match: [/^\d{11}$/, 'Please fill a valid phone number'] },
  company: { type: String, required: false },
  address: { type: String, required: false },
  profilePicture: {
    data: Buffer,
    contentType: String
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

const UserIdCounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

const UserIdCounter = mongoose.model('UserIdCounter', UserIdCounterSchema);

// Validation middleware
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

// Route handlers
router.post('/signup', validateSignup, async (req, res) => {
  const { firstName, lastName, password, createdAt } = req.body;
  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;

  const validatePassword = (password) => {
    return /[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8;
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
      password,
      createdAt: createdAt ? new Date(createdAt) : undefined
    });

    await newUser.save();
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'User created successfully', user: newUser, token: `Bearer ${token}` });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = await Admin.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', { expiresIn: '2h' });

    res.status(200).json({ message: 'Login successful', token: `Bearer ${token}` });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: 'Logged out' });
  });
});

router.get('/user-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});

router.put('/user-profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
});

router.get('/admin', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'ChiefRPS') {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.status(200).json({ message: 'Welcome Admin' });
});

module.exports = {
  router,
  User
};
