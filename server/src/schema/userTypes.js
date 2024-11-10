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
  }
`;

module.exports = userTypes;
