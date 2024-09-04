const mongoose = require('mongoose');

const UserIdCounterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 }
});

module.exports = mongoose.model('UserIdCounter', UserIdCounterSchema);