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
    firstName: String!
    lastName: String!
    role: String!
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
    user: User!
  }

  input CreateAdminInput {
    username: String!
    password: String!
    role: String!
    firstName: String
    lastName: String
  }
`;

module.exports = userTypes;
