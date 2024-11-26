const { gql } = require('graphql-tag');

const adminTypes = gql`
  type Admin {
    id: ID!
    adminId: Int!
    username: String!
    firstName: String!
    lastName: String!
    roles: [String!]!
    themePreference: String!
  }

  input CreateAdminInput {
    username: String!
    password: String!
    roles: [String!]!
    firstName: String
    lastName: String
    themePreference: String
  }

  input UpdateAdminInput {
    username: String
    password: String
    roles: [String!]
    firstName: String
    lastName: String
    themePreference: String
  }

  extend type Query {
    getAdmin(id: ID!): Admin
    getAllAdmins: [Admin!]!
    getCurrentAdmin: Admin
  }

  extend type Mutation {
    createAdmin(input: CreateAdminInput!): Admin!
    updateAdmin(id: ID!, input: UpdateAdminInput!): Admin!
    deleteAdmin(id: ID!): Boolean!
    updateAdminThemePreference(theme: String!): Admin!
  }
`;

module.exports = adminTypes;
