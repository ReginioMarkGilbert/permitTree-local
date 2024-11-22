const mongoose = require('mongoose');

const AdminIdCounterSchema = new mongoose.Schema({
   name: { type: String, required: true, unique: true },
   value: { type: Number, default: 0 }
});

const AdminIdCounter = mongoose.model('AdminIdCounter', AdminIdCounterSchema);

module.exports = AdminIdCounter;
