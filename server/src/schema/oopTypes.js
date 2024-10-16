const { gql } = require('graphql-tag');

const oopTypes = gql`
  type OOP {
    id: ID!
    oopNumber: String!
    permitId: ID!
    amount: Float!
    status: String!
    dateIssued: String!
    datePaid: String
    paymentProof: String
  }

  input OOPInput {
    permitId: ID!
    amount: Float!
    status: String!
    dateIssued: String!
    datePaid: String
    paymentProof: Upload
  }
`;

module.exports = oopTypes;
