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
  },
  Mutation: {
    addProtectedArea: async (_, { input }) => {
      try {
        console.log('Adding protected area with input:', input);
        const result = await GISService.addProtectedArea(input);
        console.log('Protected area added:', result);
        return result;
      } catch (error) {
        console.error('Error adding protected area:', error);
        throw new Error('Failed to add protected area');
      }
    }
  }
};

module.exports = gisResolvers;
