const { gql } = require('graphql-tag');

const activityTypes = gql`
  input ActivityFilterInput {
    searchTerm: String
    type: String
    dateFrom: String
    dateTo: String
  }

  type ActivityMetadata {
    deviceType: String
    ip: String
    userType: String
    specificRole: String
    applicationId: Permit
    amount: Float
  }

  type Activity {
    id: ID!
    type: String!
    username: String!
    timestamp: String!
    description: String!
    metadata: ActivityMetadata
  }

  type PaginationInfo {
    total: Int!
    currentPage: Int!
    totalPages: Int!
  }

  type ActivityResponse {
    activities: [Activity!]!
    pagination: PaginationInfo!
  }

  extend type Query {
    allActivities(filter: ActivityFilterInput, page: Int, limit: Int): ActivityResponse!
  }
`;

module.exports = activityTypes;
