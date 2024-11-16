const Permit = require('../models/permits/Permit');
const moment = require('moment');

class AnalyticsService {
    async getApplicationAnalytics(timeFilter) {
        try {
            const startDate = this.getStartDate(timeFilter);
            const permits = await Permit.find({
                dateOfSubmission: { $gte: startDate }
            });

            return {
                applicationTypes: await this.getApplicationTypeStats(permits),
                statusData: await this.getStatusStats(permits),
                processingTimeData: await this.getProcessingTimeStats(permits),
                successRateData: await this.getSuccessRateStats(permits)
            };
        } catch (error) {
            console.error('Error in getApplicationAnalytics:', error);
            throw error;
        }
    }

    getStartDate(timeFilter) {
        switch(timeFilter) {
            case 'week':
                return moment().subtract(7, 'days').toDate();
            case 'month':
                return moment().subtract(30, 'days').toDate();
            case 'year':
                return moment().subtract(1, 'year').toDate();
            default:
                return moment().subtract(5, 'years').toDate(); // For all time
        }
    }

    async getApplicationTypeStats(permits) {
        const typeCounts = permits.reduce((acc, permit) => {
            acc[permit.applicationType] = (acc[permit.applicationType] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(typeCounts).map(([type, value]) => ({
            id: type,
            label: type,
            value
        }));
    }

    async getStatusStats(permits) {
        const statusCounts = permits.reduce((acc, permit) => {
            acc[permit.status] = (acc[permit.status] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(statusCounts).map(([status, value]) => ({
            id: status,
            label: status,
            value
        }));
    }

    async getProcessingTimeStats(permits) {
        const monthlyAvg = permits.reduce((acc, permit) => {
            if (permit.status === 'Approved') {
                const month = moment(permit.dateOfSubmission).format('MMM');
                const processingTime = moment(permit.approvalDate).diff(moment(permit.dateOfSubmission), 'days');

                if (!acc[month]) {
                    acc[month] = { total: 0, count: 0 };
                }
                acc[month].total += processingTime;
                acc[month].count += 1;
            }
            return acc;
        }, {});

        const data = Object.entries(monthlyAvg).map(([month, stats]) => ({
            x: month,
            y: Math.round(stats.total / stats.count)
        }));

        return [{
            id: "Processing Time",
            data: data
        }];
    }

    async getSuccessRateStats(permits) {
        const monthlyStats = permits.reduce((acc, permit) => {
            const month = moment(permit.dateOfSubmission).format('MMM');
            if (!acc[month]) {
                acc[month] = { total: 0, success: 0 };
            }
            acc[month].total += 1;
            if (permit.status === 'Approved') {
                acc[month].success += 1;
            }
            return acc;
        }, {});

        return Object.entries(monthlyStats).map(([month, stats]) => ({
            month,
            success: Math.round((stats.success / stats.total) * 100),
            rejection: Math.round(((stats.total - stats.success) / stats.total) * 100)
        }));
    }
}

module.exports = new AnalyticsService(); 
