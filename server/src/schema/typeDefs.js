const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar Upload

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
    userId: Int!
    username: String!
    firstName: String!
    lastName: String!
    role: String!
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

  type Admin {
    id: ID!
    adminId: Int!
    username: String!
    firstName: String!
    lastName: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User
    admin: Admin
  }

  type Query {
    me: User
    getUser(id: ID!): User
    getAdmin(id: ID!): Admin
    getUserDetails: User
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    registerUser(firstName: String!, lastName: String!, username: String!, password: String!): AuthPayload!
    createAdmin(username: String!, password: String!, role: String!, firstName: String, lastName: String): Admin
    updateUserProfile(input: UpdateUserProfileInput!): User
    logout: Boolean
  }
`;

module.exports = typeDefs;
