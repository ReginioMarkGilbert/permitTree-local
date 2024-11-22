const GISFeature = require('../models/GISFeature');
const GraphQLJSON = require('graphql-type-json');

const gisResolvers = {
  JSON: GraphQLJSON,
  Query: {
    getGISData: async () => {
      try {
        const features = await GISFeature.find({});

        // Group features by layer type
        const groupedFeatures = features.reduce((acc, feature) => {
          if (!acc[feature.layerType]) {
            acc[feature.layerType] = {
              type: 'FeatureCollection',
              features: []
            };
          }

          acc[feature.layerType].features.push({
            id: feature._id.toString(),
            type: feature.type,
            geometry: feature.geometry,
            properties: feature.properties
          });

          return acc;
        }, {});

        console.log('Grouped features:', JSON.stringify(groupedFeatures, null, 2));

        return {
          protectedAreas: groupedFeatures.protectedAreas || { type: 'FeatureCollection', features: [] },
          forestCover: groupedFeatures.forestCover || { type: 'FeatureCollection', features: [] },
          miningSites: groupedFeatures.miningSites || { type: 'FeatureCollection', features: [] },
          coastalResources: groupedFeatures.coastalResources || { type: 'FeatureCollection', features: [] },
          landUse: groupedFeatures.landUse || { type: 'FeatureCollection', features: [] }
        };
      } catch (error) {
        console.error('Error fetching GIS data:', error);
        throw new Error('Failed to fetch GIS data');
      }
    }
  },
  Mutation: {
    addProtectedArea: async (_, { input }) => {
      try {
        console.log('Adding protected area with input:', JSON.stringify(input, null, 2));

        // Validate input
        if (!input.name || !input.type || !input.geometry) {
          throw new Error('Missing required fields');
        }

        if (!input.geometry.coordinates || !Array.isArray(input.geometry.coordinates)) {
          throw new Error('Invalid coordinates format');
        }

        // Ensure coordinates are properly formatted
        const coordinates = input.geometry.coordinates.map(ring =>
          ring.map(coord => coord.map(Number))
        );

        const newFeature = new GISFeature({
          type: 'Feature',
          geometry: {
            type: input.geometry.type,
            coordinates: coordinates
          },
          properties: {
            name: input.name,
            type: input.type
          },
          layerType: 'protectedAreas'
        });

        console.log('Saving new feature:', JSON.stringify(newFeature.toObject(), null, 2));

        const savedFeature = await newFeature.save();
        console.log('Feature saved successfully:', savedFeature._id);

        // Return updated collection
        const protectedAreas = await GISFeature.find({ layerType: 'protectedAreas' });
        const collection = {
          type: 'FeatureCollection',
          features: protectedAreas.map(feature => ({
            id: feature._id,
            type: feature.type,
            geometry: feature.geometry,
            properties: feature.properties
          }))
        };

        console.log('Returning collection with features:', collection.features.length);
        return collection;
      } catch (error) {
        console.error('Error adding protected area:', error);
        throw new Error(`Failed to add protected area: ${error.message}`);
      }
    },

    deleteProtectedArea: async (_, { id }) => {
      try {
        console.log('Deleting protected area with ID:', id);
        if (!id) {
          throw new Error('ID is required for deletion');
        }

        const result = await GISFeature.findOneAndDelete({
          _id: id,
          layerType: 'protectedAreas'
        });

        if (!result) {
          throw new Error('Protected area not found');
        }

        console.log('Protected area deleted successfully:', id);
        return true;
      } catch (error) {
        console.error('Error deleting protected area:', error);
        throw new Error(`Failed to delete protected area: ${error.message}`);
      }
    },

    deleteAllProtectedAreas: async () => {
      try {
        console.log('Deleting all protected areas');
        const result = await GISFeature.deleteMany({ layerType: 'protectedAreas' });
        console.log('Deleted protected areas count:', result.deletedCount);
        return true;
      } catch (error) {
        console.error('Error deleting all protected areas:', error);
        throw new Error(`Failed to delete all protected areas: ${error.message}`);
      }
    },

    updateProtectedArea: async (_, { id, input }) => {
      try {
        console.log('Updating protected area:', id, input);

        const updatedFeature = await GISFeature.findByIdAndUpdate(
          id,
          {
            geometry: {
              type: input.geometry.type,
              coordinates: input.geometry.coordinates
            },
            properties: {
              name: input.name,
              type: input.type
            }
          },
          { new: true }
        );

        if (!updatedFeature) {
          throw new Error('Protected area not found');
        }

        console.log('Updated feature:', updatedFeature);

        // Return updated collection
        const protectedAreas = await GISFeature.find({ layerType: 'protectedAreas' });
        const collection = {
          type: 'FeatureCollection',
          features: protectedAreas.map(feature => ({
            id: feature._id,
            type: feature.type,
            geometry: feature.geometry,
            properties: feature.properties
          }))
        };

        console.log('Returning collection:', collection);
        return collection;
      } catch (error) {
        console.error('Error updating protected area:', error);
        throw new Error(`Failed to update protected area: ${error.message}`);
      }
    }
  }
};

module.exports = gisResolvers;
