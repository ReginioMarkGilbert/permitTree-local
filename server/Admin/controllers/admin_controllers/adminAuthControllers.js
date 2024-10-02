const Admin = require('../../models/admin_models/adminAuthSchema');
const AdminIdCounter = require('../../models/admin_models/adminIdCounterSchema');
const jwt = require('jsonwebtoken');

// Existing createAdmin method
const createAdmin = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role } = req.body;

        // Generate adminId
        const adminIdCounter = await AdminIdCounter.findOneAndUpdate(
            { name: 'adminId' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );

        const newAdmin = new Admin({
            adminId: adminIdCounter.value,
            username,
            email,
            password,
            firstName,
            lastName,
            role: role === 'superadmin' ? 'superadmin' : 'ChiefRPS'
        });

        await newAdmin.save();
        res.status(201).send('Admin created successfully');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// New method to get all admin accounts
const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ role: 'admin' });
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAdmin,
    getAdmins
};
