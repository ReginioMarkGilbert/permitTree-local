const fs = require('fs').promises;
const path = require('path');

class GISService {
  async getGISData() {
    try {
      console.log('Loading GIS data...');

      // Load GeoJSON files
      const protectedAreas = await this.loadGeoJSON('protected-areas.geojson');
      const forestCover = await this.loadGeoJSON('forest-cover.geojson');
      const miningSites = await this.loadGeoJSON('mining-sites.geojson');
      const coastalResources = await this.loadGeoJSON('coastal-resources.geojson');
      const landUse = await this.loadGeoJSON('land-use.geojson');

      const data = {
        protectedAreas,
        forestCover,
        miningSites,
        coastalResources,
        landUse
      };

      console.log('GIS data loaded successfully:', Object.keys(data));
      return data;
    } catch (error) {
      console.error('Error loading GIS data:', error);
      throw error;
    }
  }

  async loadGeoJSON(filename) {
    try {
      const filePath = path.join(__dirname, '../data/gis', filename);
      console.log('Loading GeoJSON file:', filePath);

      const data = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(data);

      console.log(`Loaded ${filename} with ${parsedData.features?.length || 0} features`);
      return parsedData;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw error;
    }
  }

  async addProtectedArea(input) {
    try {
      const filePath = path.join(__dirname, '../data/gis/protected-areas.geojson');
      const data = await fs.readFile(filePath, 'utf8');
      const geojson = JSON.parse(data);

      const newFeature = {
        type: 'Feature',
        geometry: input.geometry,
        properties: {
          name: input.name,
          type: input.type
        }
      };

      geojson.features.push(newFeature);

      await fs.writeFile(filePath, JSON.stringify(geojson, null, 2));
      return geojson;
    } catch (error) {
      console.error('Error adding protected area:', error);
      throw error;
    }
  }
}

module.exports = new GISService();
