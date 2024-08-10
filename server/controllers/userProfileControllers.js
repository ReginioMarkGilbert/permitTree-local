// controllers/userControllers.js
const User = require('../models/userProfileSchema');

const getUserDetails = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
};


const updateUserDetails = async (req, res) => {
    const { username, email, phone, profilePhoto } = req.body;
    try {
        const user = await User.findById(req.user.id); // Assuming user ID is stored in the session
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.username = username;
        user.email = email;
        user.phone = phone;
        user.profilePhoto = profilePhoto;
        await user.save();
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserDetails,
    updateUserDetails
};
