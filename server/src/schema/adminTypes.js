const { gql } = require('graphql-tag');

const adminTypes = gql`
  type NotificationPreferences {
    email: Boolean!
    inApp: Boolean!
    sms: Boolean!
  }

  input NotificationPreferencesInput {
    email: Boolean!
    inApp: Boolean!
    sms: Boolean!
  }

  type Admin {
    id: ID!
    adminId: Int!
    username: String!
    firstName: String!
    lastName: String!
    email: String
    roles: [String!]!
    themePreference: String!
    notificationPreferences: NotificationPreferences!
  }

  input CreateAdminInput {
    username: String!
    password: String!
    roles: [String!]!
    firstName: String
    lastName: String
    themePreference: String
    email: String
  }

  input UpdateAdminInput {
    username: String
    password: String
    roles: [String!]
    firstName: String
    lastName: String
    themePreference: String
    email: String
    notificationPreferences: NotificationPreferencesInput
  }

  extend type Query {
    getAdmin(id: ID!): Admin
    getAllAdmins: [Admin!]!
    getCurrentAdmin: Admin
  }

  extend type Mutation {
    createAdmin(input: CreateAdminInput!): Admin!
    updateAdmin(id: ID!, input: UpdateAdminInput!): Admin!
    deleteAdmin(id: ID!): Boolean!
    updateNotificationSettings(preferences: NotificationPreferencesInput!, email: String): Admin!
    updateAdminThemePreference(theme: String!): Admin!
  }
`;

module.exports = adminTypes;
