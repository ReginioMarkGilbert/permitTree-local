const AnalyticsService = require('../services/analyticsService');

const analyticsResolvers = {
    Query: {
        getApplicationAnalytics: async (_, { timeFilter }) => {
            return await AnalyticsService.getApplicationAnalytics(timeFilter);
        }
    }
};

module.exports = analyticsResolvers; 
