const GISService = require('../services/gisService');
const GraphQLJSON = require('graphql-type-json');

const gisResolvers = {
  JSON: GraphQLJSON,
  Query: {
    getGISData: async () => {
      try {
        return await GISService.getGISData();
      } catch (error) {
        console.error('Error fetching GIS data:', error);
        throw new Error('Failed to fetch GIS data');
      }
    }
  }
};

module.exports = gisResolvers;
