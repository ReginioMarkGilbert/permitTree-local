const mongoose = require('mongoose');

const SA_ManageUserSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: false
    },
    company: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'ChiefRPS', 'superadmin']
    },
    userType: {
        type: String,
        required: true,
        enum: ['Client', 'Personnel']
    }
}, { timestamps: true });

module.exports = mongoose.model('SA_ManageUser', SA_ManageUserSchema);
