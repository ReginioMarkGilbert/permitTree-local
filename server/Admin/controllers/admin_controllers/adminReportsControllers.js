const { User } = require('../../../User/modules/userAuthModule');
const { Application } = require('../../../User/modules/PermitApplicationsModules/chainsawApplicationModule');
const moment = require('moment');

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

const getUserGraph = async (req, res) => {
    try {
        const { timeFilter } = req.query;
        let startDate;
        let dateFormat;

        switch (timeFilter) {
            case 'day':
                startDate = moment().startOf('day');
                dateFormat = "%Y-%m-%d %H:00:00";
                break;
            case 'week':
                startDate = moment().startOf('week');
                dateFormat = "%Y-%m-%d";
                break;
            case 'month':
                startDate = moment().startOf('month');
                dateFormat = "%Y-%m-%d";
                break;
            case 'all':
            default:
                startDate = moment(0); // Unix epoch start
                dateFormat = "%Y-%m-%d";
                break;
        }

        const userGraph = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    users: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            },
            {
                $group: {
                    _id: null,
                    data: {
                        $push: {
                            date: "$_id",
                            users: { $sum: "$users" }
                        }
                    },
                    totalUsers: { $sum: "$users" }
                }
            },
            {
                $project: {
                    _id: 0,
                    data: 1,
                    totalUsers: 1
                }
            }
        ]);

        res.json(userGraph[0] || { data: [], totalUsers: 0 });
    } catch (error) {
        console.error('Error fetching user graph data:', error);
        res.status(500).json({ message: 'Error fetching user graph data' });
    }
};

module.exports = {
    getTotalUsers,
    getApplicationsForReview,
    getApplicationsReturned,
    getUserGraph
};
