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
        weeklyVolume: [WeeklyVolumeData!]!
    }

    type WeeklyVolumeData {
        day: String!
        count: Int!
    }

    type RevenueStats {
        total: Float!
        paid: Float!
        pending: Float!
        overdue: Float!
    }

    type MonthlyRevenue {
        month: String!
        revenue: Float!
        target: Float!
    }

    type PaymentStatusStats {
        status: String!
        count: Int!
        amount: Float!
    }

    type PermitTypeRevenue {
        permitType: String!
        revenue: Float!
        count: Int!
    }

    type FinancialAnalytics {
        revenueStats: RevenueStats!
        monthlyRevenue: [MonthlyRevenue!]!
        paymentStatus: [PaymentStatusStats!]!
        permitTypeRevenue: [PermitTypeRevenue!]!
    }

    type UserStats {
        totalUsers: Int!
        activeUsers: Int!
        newUsers: [WeeklyVolumeData!]!
        usersByStatus: [ApplicationTypeStats!]!
    }

    type DashboardStats {
        totalUsers: Int!
        applicationsForReview: Int!
        approvedToday: Int!
        applicationsReturned: Int!
        applicationIncrease: Float!
    }

    extend type Query {
        getApplicationAnalytics(timeFilter: String!): ApplicationAnalytics!
        getFinancialAnalytics(timeFilter: String!): FinancialAnalytics!
        getUserAnalytics(timeFilter: String!): UserStats!
        getDashboardStats: DashboardStats!
    }
`;

module.exports = analyticsTypes;
