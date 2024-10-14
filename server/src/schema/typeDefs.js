const { gql } = require('apollo-server-express');

const typeDefs = gql`
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
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    registerUser(firstName: String!, lastName: String!, username: String!, password: String!): AuthPayload!
    createAdmin(username: String!, password: String!, role: String!, firstName: String, lastName: String): Admin
  }
`;

module.exports = typeDefs;
