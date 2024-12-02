const { gql } = require('graphql-tag');

const userTypes = gql`
  type ProfilePicture {
    data: String
    contentType: String
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
    fullName: String
    email: String
    phone: String
    company: String
    address: String
    roles: [String!]!
    userType: String!
    isActive: Boolean!
    lastPasswordChange: String
    lastLoginDate: String
    createdAt: String
    updatedAt: String
    themePreference: String
    profilePicture: ProfilePicture
    recentActivities: [UserActivity!]
    stats: UserStats
  }

  input UpdateUserProfileInput {
    firstName: String
    lastName: String
    username: String
    email: String
    phone: String
    company: String
    address: String
    themePreference: String
    removeProfilePicture: Boolean
    profilePicture: ProfilePictureInput
  }

  input ProfilePictureInput {
    data: String!
    contentType: String!
  }

  input UpdateThemeInput {
    theme: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type VerificationResponse {
    success: Boolean!
    message: String!
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
      email: String
      role: String!
      userType: String!
    ): AuthPayload!
    updateUserProfile(input: UpdateUserProfileInput!): User!
    updateThemePreference(theme: String!): User!
    login(username: String!, password: String!): AuthPayload!
    logout: Boolean!
    changePassword(input: ChangePasswordInput!): Boolean!
    sendVerificationCode(email: String!): VerificationResponse!
    verifyCode(email: String!, code: String!): VerificationResponse!
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
    confirmPassword: String!
    verificationCode: String!
  }
`;

module.exports = userTypes;
