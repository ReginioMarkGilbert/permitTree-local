const { gql } = require('graphql-tag');

const permitTypes = gql`
  scalar Upload

  interface Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
  }

  type File {
    filename: String!
    contentType: String!
    data: String!
  }

  input FileInput {
    filename: String!
    contentType: String!
    data: String!
  }

  type COVPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    name: String!
    address: String!
    cellphone: String!
    purpose: String!
    driverName: String!
    driverLicenseNumber: String!
    vehiclePlateNumber: String!
    originAddress: String!
    destinationAddress: String!
    files: COVFiles!
  }

  type COVFiles {
    letterOfIntent: [File!]
    tallySheet: [File!]
    forestCertification: [File!]
    orCr: [File!]
    driverLicense: [File!]
    specialPowerOfAttorney: [File!]
  }

  input COVPermitInput {
    name: String!
    address: String!
    cellphone: String!
    purpose: String!
    driverName: String!
    driverLicenseNumber: String!
    vehiclePlateNumber: String!
    originAddress: String!
    destinationAddress: String!
    files: COVFilesInput
  }

  input COVFilesInput {
    letterOfIntent: [FileInput]
    tallySheet: [FileInput]
    forestCertification: [FileInput]
    orCr: [FileInput]
    driverLicense: [FileInput]
    specialPowerOfAttorney: [FileInput]
  }

  type CSAWPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    registrationType: String!
    chainsawStore: String!
    ownerName: String!
    address: String!
    phone: String!
    brand: String!
    model: String!
    serialNumber: String!
    dateOfAcquisition: String!
    powerOutput: String!
    maxLengthGuidebar: String!
    countryOfOrigin: String!
    purchasePrice: Float!
    isOwner: Boolean!
    isTenureHolder: Boolean!
    isBusinessOwner: Boolean!
    isPLTPRHolder: Boolean!
    isWPPHolder: Boolean!
    files: CSAWFiles!
  }

  type CSAWFiles {
    officialReceipt: [File!]
    deedOfSale: [File!]
    specialPowerOfAttorney: [File!]
    forestTenureAgreement: [File!]
    businessPermit: [File!]
    certificateOfRegistration: [File!]
    woodProcessingPlantPermit: [File!]
  }

  input CSAWPermitInput {
    registrationType: String!
    chainsawStore: String!
    ownerName: String!
    address: String!
    phone: String!
    brand: String!
    model: String!
    serialNumber: String!
    dateOfAcquisition: String!
    powerOutput: String!
    maxLengthGuidebar: String!
    countryOfOrigin: String!
    purchasePrice: Float!
    isOwner: Boolean!
    isTenureHolder: Boolean!
    isBusinessOwner: Boolean!
    isPLTPRHolder: Boolean!
    isWPPHolder: Boolean!
    files: CSAWFilesInput
  }

  input CSAWFilesInput {
    officialReceipt: [FileInput]
    deedOfSale: [FileInput]
    specialPowerOfAttorney: [FileInput]
    forestTenureAgreement: [FileInput]
    businessPermit: [FileInput]
    certificateOfRegistration: [FileInput]
    woodProcessingPlantPermit: [FileInput]
  }

  type PLTPPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    # Add other fields specific to PLTPPermit
  }

  input PLTPPermitInput {
    # Define input fields for PLTPPermit
    applicationType: String!
    # Add other fields as needed
  }

  type PTPRPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    # Add other fields specific to PTPRPermit
  }

  input PTPRPermitInput {
    # Define input fields for PTPRPermit
    applicationType: String!
    # Add other fields as needed
  }

  type SPLTPPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    # Add other fields specific to SPLTPPermit
  }

  input SPLTPPermitInput {
    # Define input fields for SPLTPPermit
    applicationType: String!
    # Add other fields as needed
  }

  type TCEBPPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    # Add other fields specific to TCEBPPermit
  }

  input TCEBPPermitInput {
    # Define input fields for TCEBPPermit
    applicationType: String!
    # Add other fields as needed
  }
`;

module.exports = permitTypes;
