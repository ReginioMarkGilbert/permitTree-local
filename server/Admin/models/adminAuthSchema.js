const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

// Check if the model already exists before defining it
const AdminSchema = new mongoose.Schema({
    adminId: { type: Number, unique: true }, // Add adminId field
    username: { type: String, required: true, unique: true },
    // email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] },
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

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
