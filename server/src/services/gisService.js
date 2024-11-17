const fs = require('fs').promises;
const path = require('path');

class GISService {
  async getGISData() {
    try {
      // Load GeoJSON files
      const protectedAreas = await this.loadGeoJSON('protected-areas.geojson');
      const forestCover = await this.loadGeoJSON('forest-cover.geojson');
      const miningSites = await this.loadGeoJSON('mining-sites.geojson');
      const coastalResources = await this.loadGeoJSON('coastal-resources.geojson');
      const landUse = await this.loadGeoJSON('land-use.geojson');

      return {
        protectedAreas,
        forestCover,
        miningSites,
        coastalResources,
        landUse
      };
    } catch (error) {
      console.error('Error loading GIS data:', error);
      throw error;
    }
  }

  async loadGeoJSON(filename) {
    const filePath = path.join(__dirname, '../data/gis', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }
}

module.exports = new GISService();
