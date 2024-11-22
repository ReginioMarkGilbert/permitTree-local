const GISFeature = require('../models/GISFeature');

class GISService {
  async getGISData() {
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
          id: feature._id,
          type: feature.type,
          geometry: feature.geometry,
          properties: feature.properties
        });

        return acc;
      }, {});

      return {
        protectedAreas: groupedFeatures.protectedAreas || { type: 'FeatureCollection', features: [] },
        forestCover: groupedFeatures.forestCover || { type: 'FeatureCollection', features: [] },
        miningSites: groupedFeatures.miningSites || { type: 'FeatureCollection', features: [] },
        coastalResources: groupedFeatures.coastalResources || { type: 'FeatureCollection', features: [] },
        landUse: groupedFeatures.landUse || { type: 'FeatureCollection', features: [] }
      };
    } catch (error) {
      console.error('Error fetching GIS data:', error);
      throw error;
    }
  }
}

module.exports = new GISService();
