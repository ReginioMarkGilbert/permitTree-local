const mongoose = require('mongoose');

const adminDashboardSchema = new mongoose.Schema({
    // Add any admin-specific fields here if needed in the future
}, { timestamps: true });

// Add any admin-specific methods here if needed in the future

module.exports = adminDashboardSchema;
