const { gql } = require('graphql-tag');

const userTypes = gql`
  type ProfilePicture {
    data: String
    contentType: String
  }

  input ProfilePictureInput {
    data: String!
    contentType: String!
  }

  type UserActivity {
    id: ID!
    type: String!
    timestamp: String!
    details: String
  }

  type UserStats {
    totalApplications: Int!
    activePermits: Int!
    pendingPayments: Int!
  }

  type User {
    id: ID!
    username: String!
    firstName: String
    lastName: String
    roles: [String!]!
    email: String
    phone: String
    company: String
    address: String
    profilePicture: ProfilePicture
    themePreference: String!
    lastPasswordChange: String
    recentActivities: [UserActivity!]!
    stats: UserStats!
  }

  input UpdateUserProfileInput {
    firstName: String
    lastName: String
    username: String
    email: String
    phone: String
    company: String
    address: String
    removeProfilePicture: Boolean
    profilePicture: ProfilePictureInput
    themePreference: String
  }

  input UpdateThemeInput {
    theme: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    getUser(id: ID!): User
    getAllUsers: [User!]!
    getCurrentUser: User
    getUserDetails: User
    me: User
    getUserApplications(status: String, currentStage: String): [Permit!]!
    getUserActivities(limit: Int): [UserActivity!]!
    getUserStats: UserStats!
  }

  extend type Mutation {
    registerUser(
      firstName: String!
      lastName: String!
      username: String!
      password: String!
    ): AuthPayload!
    updateUserProfile(input: UpdateUserProfileInput!): User!
    updateThemePreference(theme: String!): User!
    login(username: String!, password: String!): AuthPayload!
    logout: Boolean!
    changePassword(input: ChangePasswordInput!): Boolean!
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
    confirmPassword: String!
  }
`;

module.exports = userTypes;
