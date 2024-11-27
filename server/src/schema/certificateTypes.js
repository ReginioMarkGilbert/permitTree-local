const { gql } = require('graphql-tag');

const certificateTypes = gql`
  type Certificate {
    id: ID!
    certificateNumber: String!
    applicationId: ID!
    applicationType: String!
    certificateStatus: String!
    dateCreated: String!
    dateIssued: String
    expiryDate: String
    certificateData: CertificateData
    uploadedCertificate: UploadedCertificate
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

  type UploadedCertificate {
    fileData: String
    filename: String
    contentType: String
    uploadDate: String
    metadata: CertificateMetadata
  }

  type CertificateMetadata {
    certificateType: String
    issueDate: String
    expiryDate: String
    remarks: String
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
    uploadedCertificate: UploadedCertificateInput!
  }

  input UploadedCertificateInput {
    fileData: String!
    filename: String!
    contentType: String!
    metadata: CertificateMetadataInput!
  }

  input CertificateMetadataInput {
    certificateType: String!
    issueDate: String!
    expiryDate: String!
    remarks: String
  }

  extend type Query {
    getCertificates(status: String): [Certificate!]!
    getCertificateById(id: ID!): Certificate
    getCertificatesByApplicationId(applicationId: ID!): [Certificate!]!
  }

  extend type Mutation {
    generateCertificate(input: GenerateCertificateInput!): Certificate!
    uploadCertificate(input: UploadCertificateInput!): Certificate!
    forwardCertificateForSignature(id: ID!): Certificate!
    signCertificate(id: ID!, signature: String!): Certificate!
  }
`;

module.exports = certificateTypes;
