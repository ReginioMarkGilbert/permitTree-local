const { gql } = require('apollo-server-express');

const dashboardTypes = gql`
  type UserActivity {
    date: String!
    users: Int!
  }

  type RecentActivity {
    id: ID!
    type: String!
    username: String!
    timestamp: String!
    description: String!
  }

  type DashboardStats {
    totalUsers: Int!
    activeUsers: Int!
    totalApplications: Int!
    pendingApplications: Int!
    usersTrend: String!
    activeUsersTrend: String!
    applicationsTrend: String!
    pendingApplicationsTrend: String!
    userActivity: [UserActivity!]!
    recentActivities: [RecentActivity!]!
  }

  extend type Query {
    dashboardStats: DashboardStats!
  }
`;

module.exports = dashboardTypes;
