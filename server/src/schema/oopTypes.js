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
    officialReceipt: OfficialReceipt
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

  type OfficialReceipt {
    orNumber: String!
    dateIssued: String!
    issuedBy: ID!
    amount: Float!
    paymentMethod: String!
    remarks: String
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

  input GenerateORInput {
    orNumber: String!
    remarks: String
    amount: Float!
    paymentMethod: String!
  }

  extend type Query {
    getOOPs: [OOP!]!
    getOOPById(id: ID!): OOP
    getOOPsByApplicationId(applicationId: String!): [OOP!]!
    getApplicationsAwaitingOOP: [Permit!]!
    getOOPsByUserId(userId: ID!, status: String): [OOP!]!
  }

  extend type Mutation {
    createOOP(input: OOPInput!): OOP!
    updateOOPSignature(id: ID!, signatureType: String!, signatureImage: String!): OOP!
    approveOOP(id: ID!, notes: String, status: String!): OOP!
    forwardOOPToAccountant(id: ID!): OOP!
    undoApproval(paymentId: ID!): OOP!
    generateOR(Id: ID!, input: GenerateORInput!): OOP!
    sendORToApplicant(Id: ID!): OOP!
    deleteOOP(applicationId: String!): OOP!
  }
`;

module.exports = oopTypes;
