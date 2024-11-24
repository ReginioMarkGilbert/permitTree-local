const AnalyticsService = require('../services/analyticsService');
const FinancialAnalyticsService = require('../services/financialAnalyticsService');
const UserAnalyticsService = require('../services/userAnalyticsService');
const DashboardStatsService = require('../services/dashboardStatsService');

const analyticsResolvers = {
    Query: {
        getApplicationAnalytics: async (_, { timeFilter }) => {
            return await AnalyticsService.getApplicationAnalytics(timeFilter);
        },
        getFinancialAnalytics: async (_, { timeFilter }) => {
            return await FinancialAnalyticsService.getFinancialAnalytics(timeFilter);
        },
        getUserAnalytics: async (_, { timeFilter }) => {
            return await UserAnalyticsService.getUserAnalytics(timeFilter);
        },
        getDashboardStats: async () => {
            return await DashboardStatsService.getDashboardStats();
        }
    }
};

module.exports = analyticsResolvers;
