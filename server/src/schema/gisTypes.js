const { gql } = require('graphql-tag');

const gisTypes = gql`
  scalar JSON

  input ProtectedAreaInput {
    name: String!
    type: String!
    geometry: GeometryInput!
  }

  input GeometryInput {
    type: String!
    coordinates: JSON!
  }

  type GeoJSONFeature {
    id: ID!
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

  extend type Mutation {
    addProtectedArea(input: ProtectedAreaInput!): GeoJSONCollection!
    updateProtectedArea(id: ID!, input: ProtectedAreaInput!): GeoJSONCollection!
    deleteProtectedArea(id: ID!): Boolean!
    deleteAllProtectedAreas: Boolean!
  }
`;

module.exports = gisTypes;
