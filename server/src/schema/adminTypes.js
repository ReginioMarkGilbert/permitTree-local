const { gql } = require('graphql-tag');

const adminTypes = gql`

type Admin {
    id: ID!
    adminId: Int!
    username: String!
    firstName: String!
    lastName: String!
    role: String!
  }


input CreateAdminInput {
    username: String!
    password: String!
    role: String!
    firstName: String
    lastName: String
  }
`;

module.exports = adminTypes;
