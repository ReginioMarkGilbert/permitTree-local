const User = require('../models/User');
const moment = require('moment');

class UserAnalyticsService {
    static async getUserAnalytics(timeFilter) {
        try {
            const dateRange = this.getDateRange(timeFilter);

            // Get all users
            const users = await User.find({
                createdAt: { $gte: dateRange.start, $lte: dateRange.end }
            });

            // Calculate total users
            const totalUsers = await User.countDocuments();

            // Calculate active users (users who logged in within last 30 days)
            const activeUsers = await User.countDocuments({
                lastLoginDate: {
                    $gte: moment().subtract(30, 'days').toDate()
                }
            });

            // Calculate new users per day for the week
            const newUsers = this.calculateNewUsersPerDay(users);

            // Calculate user status distribution
            const usersByStatus = this.calculateUserStatusDistribution(users);

            return {
                totalUsers,
                activeUsers,
                newUsers,
                usersByStatus
            };
        } catch (error) {
            console.error('Error in getUserAnalytics:', error);
            throw error;
        }
    }

    static getDateRange(timeFilter) {
        const end = moment();
        let start;

        switch (timeFilter) {
            case 'week':
                start = moment().subtract(1, 'week');
                break;
            case 'month':
                start = moment().subtract(1, 'month');
                break;
            case 'year':
                start = moment().subtract(1, 'year');
                break;
            case 'all':
                start = moment(0);
                break;
            default:
                start = moment().subtract(1, 'week');
        }

        return { start: start.toDate(), end: end.toDate() };
    }

    static calculateNewUsersPerDay(users) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const usersByDay = new Array(7).fill(0);

        users.forEach(user => {
            const dayIndex = moment(user.createdAt).day();
            usersByDay[dayIndex]++;
        });

        return days.map((day, index) => ({
            day,
            count: usersByDay[index]
        }));
    }

    static calculateUserStatusDistribution(users) {
        const statusCount = users.reduce((acc, user) => {
            const status = user.isActive ? 'Active' : 'Inactive';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(statusCount).map(([status, count]) => ({
            id: status,
            label: status,
            value: count
        }));
    }
}

module.exports = UserAnalyticsService;
