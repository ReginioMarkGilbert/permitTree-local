const { gql } = require('graphql-tag');

const gisTypes = gql`
  type GeoJSONFeature {
    type: String!
    geometry: JSON!
    properties: JSON!
  }

  type GeoJSONCollection {
    type: String!
    features: [GeoJSONFeature!]!
  }

  type GISData {
    protectedAreas: GeoJSONCollection!
    forestCover: GeoJSONCollection!
    miningSites: GeoJSONCollection!
    coastalResources: GeoJSONCollection!
    landUse: GeoJSONCollection!
  }

  extend type Query {
    getGISData: GISData!
  }
`;

module.exports = gisTypes;
