const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({

    userId: { type: Number, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },

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
    // console.log('Entered password:', enteredPassword);
    // console.log('User password:', this.password);
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
