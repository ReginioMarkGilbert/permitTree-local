const { gql } = require('graphql-tag');

const certificateTypes = gql`
  type Certificate {
    id: ID!
    certificateNumber: String!
    permitId: ID!
    status: String!
    dateIssued: String
    expiryDate: String
    signedBy: ID
  }

  input CertificateInput {
    permitId: ID!
    status: String!
    dateIssued: String
    expiryDate: String
    signedBy: ID
  }
`;

module.exports = certificateTypes;
