const { gql } = require('graphql-tag');

module.exports = /* GraphQL */ `
  type Payment {
    id: ID!
    oopId: ID!
    status: String!
    amount: Float!
    paymentMethod: String!
    transactionId: String
    paymentDetails: PaymentDetails
    expiresAt: String
    createdAt: String!
    updatedAt: String
  }

  type PaymentDetails {
    fullName: String!
    email: String!
    phoneNumber: String!
    address: String!
  }

  type PaymentSession {
    id: ID!
    oopId: ID!
    status: String!
    amount: Float!
    paymentMethod: String!
    createdAt: String!
    expiresAt: String
  }

  type PaymentResult {
    success: Boolean!
    message: String!
    transactionId: String
    paymentStatus: String!
  }

  input PaymentDetailsInput {
    fullName: String!
    email: String!
    phoneNumber: String!
    address: String!
  }
`;
