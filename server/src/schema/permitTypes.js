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
    name: String!
    address: String!
    contactNumber: String!
    treeType: [String!]!
    treeStatus: [String!]!
    landType: [String!]!
    posingDanger: Boolean!
    forPersonalUse: Boolean!
    purpose: String!
    files: PLTPFiles!
  }

  type PLTPFiles {
    applicationLetter: [File!]
    lguEndorsement: [File!]
    homeownersResolution: [File!]
    ptaResolution: [File!]
  }

  input PLTPPermitInput {
    name: String!
    address: String!
    contactNumber: String!
    treeType: [String!]!
    treeStatus: [String!]!
    landType: [String!]!
    posingDanger: Boolean!
    forPersonalUse: Boolean!
    purpose: String!
    files: PLTPFilesInput
  }

  input PLTPFilesInput {
    applicationLetter: [FileInput]
    lguEndorsement: [FileInput]
    homeownersResolution: [FileInput]
    ptaResolution: [FileInput]
  }

  type PTPRPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    ownerName: String!
    address: String!
    contactNumber: String!
    lotArea: Float!
    treeSpecies: [String!]!
    totalTrees: Int!
    treeSpacing: String!
    yearPlanted: Int!
    files: PTPRFiles!
  }

  type PTPRFiles {
    letterRequest: [File!]
    titleOrTaxDeclaration: [File!]
    darCertification: [File!]
    specialPowerOfAttorney: [File!]
  }

  input PTPRPermitInput {
    ownerName: String!
    address: String!
    contactNumber: String!
    lotArea: Float!
    treeSpecies: [String!]!
    totalTrees: Int!
    treeSpacing: String!
    yearPlanted: Int!
    files: PTPRFilesInput
  }

  input PTPRFilesInput {
    letterRequest: [FileInput]
    titleOrTaxDeclaration: [FileInput]
    darCertification: [FileInput]
    specialPowerOfAttorney: [FileInput]
  }

  type SPLTPPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    name: String!
    address: String!
    contactNumber: String!
    plantedTrees: Boolean!
    naturallyGrown: Boolean!
    standing: Boolean!
    blownDown: Boolean!
    withinPrivateLand: Boolean!
    withinTenuredForestLand: Boolean!
    posingDanger: Boolean!
    forPersonalUse: Boolean!
    purpose: String!
    files: SPLTPFiles!
  }

  type SPLTPFiles {
    letterOfIntent: [File!]
    lguEndorsement: [File!]
    titleCertificate: [File!]
    darCertificate: [File!]
    specialPowerOfAttorney: [File!]
    ptaResolution: [File!]
  }

  input SPLTPPermitInput {
    name: String!
    address: String!
    contactNumber: String!
    plantedTrees: Boolean!
    naturallyGrown: Boolean!
    standing: Boolean!
    blownDown: Boolean!
    withinPrivateLand: Boolean!
    withinTenuredForestLand: Boolean!
    posingDanger: Boolean!
    forPersonalUse: Boolean!
    purpose: String!
    files: SPLTPFilesInput
  }

  input SPLTPFilesInput {
    letterOfIntent: [FileInput]
    lguEndorsement: [FileInput]
    titleCertificate: [FileInput]
    darCertificate: [FileInput]
    specialPowerOfAttorney: [FileInput]
    ptaResolution: [FileInput]
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

  type Query {
    getAllCOVPermits: [COVPermit!]!
    getCOVPermitById(id: ID!): COVPermit
    getCOVPermitWithFiles(id: ID!): COVPermit
    # ... (other queries)
  }
`;

module.exports = permitTypes;
