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

`;

module.exports = userTypes;
