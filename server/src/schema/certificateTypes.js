const { gql } = require('graphql-tag');

const certificateTypes = gql`
  scalar JSON

  type Certificate {
    id: ID!
    certificateNumber: String!
    applicationId: ID!
    applicationType: String!
    status: String!
    dateCreated: String!
    dateIssued: String
    expiryDate: String
    createdBy: User!
    signedBy: CertificateSignatures
    certificateData: CertificateData!
    history: [CertificateHistory!]!
  }

  type CertificateSignatures {
    PENRO: SignatureDetails
  }

  type SignatureDetails {
    userId: ID
    signature: String
    dateSigned: String
  }

  type CertificateData {
    registrationType: String
    ownerName: String
    address: String
    chainsawDetails: ChainsawDetails
    purpose: String
    otherDetails: JSON
  }

  type ChainsawDetails {
    brand: String
    model: String
    serialNumber: String
    dateOfAcquisition: String
    powerOutput: String
    maxLengthGuidebar: String
    countryOfOrigin: String
    purchasePrice: Float
  }

  type CertificateHistory {
    action: String!
    timestamp: String!
    userId: ID!
    notes: String
  }

  input GenerateCertificateInput {
    applicationId: ID!
    applicationType: String!
    certificateData: CertificateDataInput!
  }

  input CertificateDataInput {
    registrationType: String!
    ownerName: String!
    address: String!
    chainsawDetails: ChainsawDetailsInput!
    purpose: String!
    otherDetails: JSON
  }

  input ChainsawDetailsInput {
    brand: String!
    model: String!
    serialNumber: String!
    dateOfAcquisition: String!
    powerOutput: String!
    maxLengthGuidebar: String!
    countryOfOrigin: String!
    purchasePrice: Float!
  }

  input UploadCertificateInput {
    applicationId: ID!
    applicationType: String!
    fileUrl: String!
    metadata: CertificateMetadataInput!
  }

  input CertificateMetadataInput {
    certificateType: String!
    issueDate: String!
    expiryDate: String!
    remarks: String
  }

  type UploadedCertificate {
    fileUrl: String!
    uploadDate: String!
    metadata: CertificateMetadata!
  }

  type CertificateMetadata {
    certificateType: String!
    issueDate: String!
    expiryDate: String!
    remarks: String
  }

  extend type Mutation {
    uploadCertificate(input: UploadCertificateInput!): Certificate!
  }
`;

module.exports = certificateTypes;
