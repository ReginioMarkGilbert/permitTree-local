const { gql } = require('graphql-tag');

const oopTypes = gql`
  type OOP {
    _id: ID!
    userId: ID!
    billNo: String!
    applicationId: ID!
    applicationNumber: String!
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
    receivedDate: String
    receivedTime: String
    trackingNo: String
    releasedDate: String
    releasedTime: String
    createdAt: String!
    updatedAt: String!
    officialReceipt: OfficialReceipt
    paymentProof: PaymentProof
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

  type PaymentProof {
    transactionId: String!
    paymentMethod: String!
    amount: Float!
    timestamp: String
    referenceNumber: String!
    payerDetails: PayerDetails
    status: String
  }

  type PayerDetails {
    name: String
    email: String
    phoneNumber: String
  }

  input OOPInput {
    applicationId: ID!
    applicationNumber: String!
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

  input OOPTrackingInput {
    receivedDate: String
    receivedTime: String
    trackingNo: String
    releasedDate: String
    releasedTime: String
  }

  input PaymentProofInput {
    transactionId: String!
    paymentMethod: String!
    amount: Float!
    referenceNumber: String!
    payerDetails: PayerDetailsInput!
  }

  input PayerDetailsInput {
    name: String!
    email: String!
    phoneNumber: String!
  }

  extend type Query {
    getOOPs: [OOP!]!
    getOOPById(id: ID!): OOP
    getOOPsByApplicationId(applicationId: String!): [OOP!]!
    getApplicationsAwaitingOOP: [Permit!]!
    getOOPsByUserId(userId: ID!, status: String): [OOP!]!
    getRecentOOPs(status: String, limit: Int): [OOP!]!
  }

  extend type Mutation {
    createOOP(input: OOPInput!): OOP!
    updateOOPSignature(id: ID!, signatureType: String!, signatureImage: String!): OOP!
    approveOOP(id: ID!, notes: String, status: String!): OOP!
    undoTechnicalStaffOOPApproval(id: ID!): OOP!
    forwardOOPToTechnicalStaff(id: ID!): OOP!
    undoApproval(paymentId: ID!): OOP!
    generateOR(Id: ID!, input: GenerateORInput!): OOP!
    sendORToApplicant(Id: ID!): OOP!
    deleteOOP(applicationId: String!): OOP!
    updateOOPTracking(id: ID!, tracking: OOPTrackingInput!): OOP!
    submitPaymentProof(oopId: ID!, paymentProof: PaymentProofInput!): OOP!
    reviewPaymentProof(oopId: ID!, status: String!, notes: String): OOP!
    undoPaymentProof(oopId: ID!): OOP!
    undoOOPSignature(id: ID!): OOP!
  }
`;

module.exports = oopTypes;
