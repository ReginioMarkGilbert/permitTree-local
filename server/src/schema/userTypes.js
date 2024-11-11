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
    lastPasswordChange: String
    recentActivities: [UserActivity!]!
  }

  input UpdateUserProfileInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    company: String
    address: String
    removeProfilePicture: Boolean
    profilePicture: ProfilePictureInput
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
  }

  extend type Mutation {
    registerUser(
      firstName: String!
      lastName: String!
      username: String!
      password: String!
    ): AuthPayload!
    updateUserProfile(input: UpdateUserProfileInput!): User!
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
