const { gql } = require('graphql-tag');

const analyticsTypes = gql`
    type ApplicationTypeStats {
        id: String!
        label: String!
        value: Int!
    }

    type ProcessingTimePoint {
        x: String!
        y: Float!
    }

    type ProcessingTimeSeries {
        id: String!
        data: [ProcessingTimePoint!]!
    }

    type SuccessRateStats {
        month: String!
        success: Float!
        rejection: Float!
    }

    type ApplicationAnalytics {
        applicationTypes: [ApplicationTypeStats!]!
        statusData: [ApplicationTypeStats!]!
        processingTimeData: [ProcessingTimeSeries!]!
        successRateData: [SuccessRateStats!]!
    }

    extend type Query {
        getApplicationAnalytics(timeFilter: String!): ApplicationAnalytics!
    }
`;

module.exports = analyticsTypes;
