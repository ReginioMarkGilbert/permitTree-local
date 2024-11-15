const AnalyticsService = require('../services/analyticsService');
const FinancialAnalyticsService = require('../services/financialAnalyticsService');

const analyticsResolvers = {
    Query: {
        getApplicationAnalytics: async (_, { timeFilter }) => {
            return await AnalyticsService.getApplicationAnalytics(timeFilter);
        },
        getFinancialAnalytics: async (_, { timeFilter }) => {
            return await FinancialAnalyticsService.getFinancialAnalytics(timeFilter);
        }
    }
};

module.exports = analyticsResolvers;
