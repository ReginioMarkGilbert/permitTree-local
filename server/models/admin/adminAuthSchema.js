
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    // email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin', enum: ['admin'] }
});

adminSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

adminSchema.statics.login = async function (username, password) {
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

module.exports = mongoose.model('Admin', adminSchema);