const User = require('../models/User');
const Permit = require('../models/permits/Permit');
const moment = require('moment');

class DashboardStatsService {
    static async getDashboardStats() {
        try {
            // Get total users
            const totalUsers = await User.countDocuments();

            // Get applications for review
            const applicationsForReview = await Permit.countDocuments({
                status: { $in: ['Submitted', 'In Progress', 'Under Review'] }
            });

            // Get applications approved today
            const today = moment().startOf('day');
            const approvedToday = await Permit.countDocuments({
                status: 'Approved',
                updatedAt: { $gte: today.toDate() }
            });

            // Get returned applications
            const applicationsReturned = await Permit.countDocuments({
                status: 'Returned'
            });

            // Calculate application increase (last 30 days vs previous 30 days)
            const thirtyDaysAgo = moment().subtract(30, 'days');
            const sixtyDaysAgo = moment().subtract(60, 'days');

            const last30DaysCount = await Permit.countDocuments({
                createdAt: { $gte: thirtyDaysAgo.toDate() }
            });

            const previous30DaysCount = await Permit.countDocuments({
                createdAt: {
                    $gte: sixtyDaysAgo.toDate(),
                    $lt: thirtyDaysAgo.toDate()
                }
            });

            const applicationIncrease = previous30DaysCount === 0
                ? 100
                : ((last30DaysCount - previous30DaysCount) / previous30DaysCount) * 100;

            return {
                totalUsers,
                applicationsForReview,
                approvedToday,
                applicationsReturned,
                applicationIncrease: Math.round(applicationIncrease)
            };
        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            throw error;
        }
    }
}

module.exports = DashboardStatsService;
