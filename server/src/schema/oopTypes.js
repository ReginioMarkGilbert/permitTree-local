const { gql } = require('graphql-tag');

const oopTypes = gql`
  type OOP {
    _id: ID!
    userId: ID!
    billNo: String!
    applicationId: String!
    date: String!
    namePayee: String!
    address: String!
    natureOfApplication: String!
    items: [OOPItem!]!
    totalAmount: Float!
    OOPstatus: String!
    OOPSignedByTwoSignatories: Boolean
    OOPApproved: Boolean
    signatures: OOPSignatures
    rpsSignatureImage: String
    tsdSignatureImage: String
    createdAt: String!
    updatedAt: String!
  }

  type OOPItem {
    legalBasis: String!
    description: String!
    amount: Float!
  }

  type OOPSignatures {
    chiefRPS: String
    technicalServices: String
  }

  input OOPInput {
    applicationId: String!
    namePayee: String!
    address: String!
    natureOfApplication: String!
    items: [OOPItemInput!]!
    rpsSignatureImage: String
    tsdSignatureImage: String
  }

  input OOPItemInput {
    legalBasis: String!
    description: String!
    amount: Float!
  }

  extend type Query {
    getOOPs: [OOP!]!
    getOOPById(id: ID!): OOP
    getOOPsByApplicationId(applicationId: String!): [OOP!]!
    getApplicationsAwaitingOOP: [Permit!]!
    getOOPsByUserId(userId: ID!): [OOP!]!
  }

  extend type Mutation {
    createOOP(input: OOPInput!): OOP!
    updateOOPSignature(id: ID!, signatureType: String!, signatureImage: String!): OOP!
    approveOOP(id: ID!, notes: String, status: String!): OOP!
    forwardOOPToAccountant(id: ID!): OOP!
  }
`;

module.exports = oopTypes;
