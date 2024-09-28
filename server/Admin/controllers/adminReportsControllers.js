const User = require('../../User/models/userAuthSchema');
const Application = require('../../User/models/PermitApplications/ChainsawApplicationSchema');

const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        res.json({ totalUsers });
    } catch (error) {
        console.error('Error fetching total users:', error);
        res.status(500).json({ message: 'Error fetching total users' });
    }
};

const getApplicationsForReview = async (req, res) => {
    try {
        const applicationsForReview = await Application.countDocuments({ status: 'Submitted' });
        res.json({ applicationsForReview });
    } catch (error) {
        console.error('Error fetching applications for review:', error);
        res.status(500).json({ message: 'Error fetching applications for review' });
    }
};

const getApplicationsReturned = async (req, res) => {
    try {
        const applicationsReturned = await Application.countDocuments({ status: 'Returned' });
        res.json({ applicationsReturned });
    } catch (error) {
        console.error('Error fetching returned applications:', error);
        res.status(500).json({ message: 'Error fetching returned applications' });
    }
};

module.exports = {
    getTotalUsers,
    getApplicationsForReview,
    getApplicationsReturned
};
