const Admin = require('../../models/Admin/adminAuthSchema');

// Existing createAdmin method
const createAdmin = async (req, res) => {

    try {
        const { username, email, password } = req.body;
        const newAdmin = new Admin({ username, email, password, role: 'admin' });
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
