const { gql } = require('graphql-tag');

const paymentTypes = gql`
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

  type VerifyPaymentResponse {
    success: Boolean!
    message: String!
    payment: Payment
  }

  input PaymentDetailsInput {
    fullName: String!
    email: String!
    phoneNumber: String!
    address: String!
  }

  extend type Query {
    getPayments(status: String): [Payment!]!
  }

  extend type Mutation {
    verifyPayment(paymentId: ID!, status: String!): VerifyPaymentResponse!
  }
`;

module.exports = paymentTypes;
