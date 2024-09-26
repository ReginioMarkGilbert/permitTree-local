const User = require('../../../User/models/userAuthSchema');
const Admin = require('../../models/adminAuthSchema');

const getAllUsers = async (req, res) => {
    try {
        const regularUsers = await User.find().select('-password');
        const chiefRPSUsers = await Admin.find({ role: 'ChiefRPS' }).select('-password');

        const allUsers = [
            ...regularUsers.map(user => ({
                ...user.toObject(),
                userType: user.role === 'user' ? 'Client' : user.role
            })),
            ...chiefRPSUsers.map(user => ({...user.toObject(), userType: 'Personnel'}))
        ];

        res.json(allUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { userType, ...updateData } = req.body;

        let updatedUser;
        if (userType === 'Personnel') {
            updatedUser = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        } else {
            updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        }

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        const admin = await Admin.findById(id);

        if (user) {
            await User.findByIdAndDelete(id);
        } else if (admin) {
            await Admin.findByIdAndDelete(id);
        } else {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};
