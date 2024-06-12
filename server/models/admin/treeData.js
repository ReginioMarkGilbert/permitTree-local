const mongoose = require('mongoose');

const treeDataSchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true },
    count: { type: Number, required: true }
});

const TreeData = mongoose.model('TreeData', treeDataSchema);

module.exports = TreeData;