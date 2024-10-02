const mongoose = require('mongoose');

const adminIdCounterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 }
});

const AdminIdCounter = mongoose.model('AdminIdCounter', adminIdCounterSchema);

module.exports = AdminIdCounter;
