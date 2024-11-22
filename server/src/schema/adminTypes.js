const { gql } = require('graphql-tag');

const adminTypes = gql`
  type Admin {
    id: ID!
    adminId: Int!
    username: String!
    firstName: String!
    lastName: String!
    roles: [String!]!
  }

  input CreateAdminInput {
    username: String!
    password: String!
    roles: [String!]!
    firstName: String
    lastName: String
  }

  input UpdateAdminInput {
    username: String
    password: String
    roles: [String!]
    firstName: String
    lastName: String
  }

  extend type Query {
    getAdmin(id: ID!): Admin
    getAllAdmins: [Admin!]!
  }

  extend type Mutation {
    createAdmin(input: CreateAdminInput!): Admin!
    updateAdmin(id: ID!, input: UpdateAdminInput!): Admin!
    deleteAdmin(id: ID!): Boolean!
  }
`;

module.exports = adminTypes;
