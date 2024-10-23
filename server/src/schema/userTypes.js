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

#   input UpdateUserInput {
#     firstName: String
#     lastName: String
#     roles: [String!]
#   }

#   extend type Query {
#     getUser(id: ID!): User
#     getAllUsers: [User!]!
#   }

#   extend type Mutation {
#     createUser(input: CreateUserInput!): User!
#     updateUser(id: ID!, input: UpdateUserInput!): User!
#     deleteUser(id: ID!): Boolean!
#   }

  type AuthPayload {
    token: String!
    user: User!
  }

`;

module.exports = userTypes;
