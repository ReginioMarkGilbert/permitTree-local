const Permit = require('../models/permits/Permit');
const moment = require('moment');

class AnalyticsService {
    static async getApplicationAnalytics(timeFilter) {
        try {
            // Get date range based on time filter
            const dateRange = this.getDateRange(timeFilter);

            // Get applications within date range
            const applications = await Permit.find({
                dateOfSubmission: { $gte: dateRange.start, $lte: dateRange.end }
            });

            // Calculate application types distribution
            const applicationTypes = this.calculateApplicationTypes(applications);

            // Calculate status distribution
            const statusData = this.calculateStatusDistribution(applications);

            // Calculate weekly volume
            const weeklyVolume = this.calculateWeeklyVolume(applications);

            return {
                applicationTypes,
                statusData,
                weeklyVolume
            };
        } catch (error) {
            console.error('Error in getApplicationAnalytics:', error);
            throw error;
        }
    }

    static calculateWeeklyVolume(applications) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const volumeByDay = new Array(7).fill(0);

        applications.forEach(app => {
            const dayIndex = moment(app.dateOfSubmission).day();
            volumeByDay[dayIndex]++;
        });

        return days.map((day, index) => ({
            day,
            count: volumeByDay[index]
        }));
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
                start = moment(0); // Beginning of time
                break;
            default:
                start = moment().subtract(1, 'week');
        }

        return { start: start.toDate(), end: end.toDate() };
    }

    static calculateApplicationTypes(applications) {
        const typeCount = applications.reduce((acc, app) => {
            acc[app.applicationType] = (acc[app.applicationType] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(typeCount).map(([type, count]) => ({
            id: type,
            label: type,
            value: count
        }));
    }

    static calculateStatusDistribution(applications) {
        const statusCount = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(statusCount).map(([status, count]) => ({
            id: status,
            label: status,
            value: count
        }));
    }
}

module.exports = AnalyticsService;
