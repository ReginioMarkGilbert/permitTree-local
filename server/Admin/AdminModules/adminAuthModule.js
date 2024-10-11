const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const router = express.Router();
// const jwt = require('jsonwebtoken');

// Check if the model already exists before defining it
const AdminSchema = new mongoose.Schema({
    adminId: { type: Number, unique: true }, // Add adminId field
    username: { type: String, required: true, unique: true },
    // email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'ChiefRPS', enum: ['ChiefRPS', 'superadmin'] },
    firstName: { type: String },
    lastName: { type: String }
});

AdminSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

AdminSchema.statics.login = async function (username, password) {
    const admin = await this.findOne({ username });
    if (admin) {
        const auth = await bcrypt.compare(password, admin.password);
        if (auth) {
            return admin;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect username');
};

const Admin = mongoose.model('Admin', AdminSchema);

const adminIdCounterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 }
});

const AdminIdCounter = mongoose.model('AdminIdCounter', adminIdCounterSchema);

router.post('/create-admin', async (req, res) => {
    const { username, password, role, firstName, lastName } = req.body;

    try {
        const adminIdCounter = await AdminIdCounter.findOneAndUpdate(
            { name: 'adminId' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );

        const newAdmin = new Admin({
            adminId: adminIdCounter.value,
            username,
            password,
            role,
            firstName,
            lastName
        });

        await newAdmin.save();

        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/admins', async (req, res) => {
    try {
        const admins = await Admin.find({});
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    router,
    Admin,
    AdminIdCounter
};
