const User = require('../../User/models/userAuthSchema');

const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        res.json({ totalUsers });
    } catch (error) {
        console.error('Error fetching total users:', error);
        res.status(500).json({ message: 'Error fetching total users' });
    }
};

module.exports = {
    getTotalUsers
};
