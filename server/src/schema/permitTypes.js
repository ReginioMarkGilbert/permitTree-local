const { gql } = require('apollo-server-express');

const permitTypes = gql`
  interface Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
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
    files: COVFiles
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
    files: CSAWFiles
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
    files: PLTPFiles
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
    files: PTPRFiles
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
    files: SPLTPFiles
  }

  type TCEBPPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    dateOfSubmission: String!
    applicantId: ID!
    name: String!
    address: String!
    contactNumber: String!
    purpose: String!
    files: TCEBPFiles
  }

  type COVFiles {
    letterOfIntent: [File]
    tallySheet: [File]
    forestCertification: [File]
    orCr: [File]
    driverLicense: [File]
    specialPowerOfAttorney: [File]
  }

  type CSAWFiles {
    officialReceipt: [File]
    deedOfSale: [File]
    specialPowerOfAttorney: [File]
    forestTenureAgreement: [File]
    businessPermit: [File]
    certificateOfRegistration: [File]
    woodProcessingPlantPermit: [File]
  }

  type PLTPFiles {
    applicationLetter: [File]
    lguEndorsement: [File]
    homeownersResolution: [File]
    ptaResolution: [File]
  }

  type PTPRFiles {
    letterRequest: [File]
    titleOrTaxDeclaration: [File]
    darCertification: [File]
    specialPowerOfAttorney: [File]
  }

  type SPLTPFiles {
    letterOfIntent: [File]
    lguEndorsement: [File]
    titleCertificate: [File]
    darCertificate: [File]
    specialPowerOfAttorney: [File]
    ptaResolution: [File]
  }

  type TCEBPFiles {
    letterOfIntent: [File]
    lguEndorsement: [File]
    landTenurial: [File]
    siteDevelopmentPlan: [File]
    environmentalCompliance: [File]
    fpic: [File]
    ownerConsent: [File]
    pambClearance: [File]
  }

  type File {
    filename: String!
    contentType: String
    data: String
  }

  type Query {
    getUserApplications(status: String): [Permit!]!
    getAllCOVPermits: [COVPermit!]!
    getCOVPermitById(id: ID!): COVPermit
    getCOVPermitWithFiles(id: ID!): COVPermit
    getAllCSAWPermits: [CSAWPermit!]!
    getCSAWPermitById(id: ID!): CSAWPermit
    getAllPLTPPermits: [PLTPPermit!]!
    getPLTPPermitById(id: ID!): PLTPPermit
    getAllPTPRPermits: [PTPRPermit!]!
    getPTPRPermitById(id: ID!): PTPRPermit
    getAllSPLTPPermits: [SPLTPPermit!]!
    getSPLTPPermitById(id: ID!): SPLTPPermit
    getAllTCEBPPermits: [TCEBPPermit!]!
    getTCEBPPermitById(id: ID!): TCEBPPermit
  }

  type Mutation {
    createCOVPermit(input: COVPermitInput!): COVPermit!
    updateCOVPermit(id: ID!, input: COVPermitInput!): COVPermit!
    saveCOVPermitDraft(input: COVPermitInput!): COVPermit!
    createCSAWPermit(input: CSAWPermitInput!): CSAWPermit!
    updateCSAWPermit(id: ID!, input: CSAWPermitInput!): CSAWPermit!
    saveCSAWPermitDraft(input: CSAWPermitInput!): CSAWPermit!
    createPLTPPermit(input: PLTPPermitInput!): PLTPPermit!
    updatePLTPPermit(id: ID!, input: PLTPPermitInput!): PLTPPermit!
    savePLTPPermitDraft(input: PLTPPermitInput!): PLTPPermit!
    createPTPRPermit(input: PTPRPermitInput!): PTPRPermit!
    updatePTPRPermit(id: ID!, input: PTPRPermitInput!): PTPRPermit!
    savePTPRPermitDraft(input: PTPRPermitInput!): PTPRPermit!
    createSPLTPPermit(input: SPLTPPermitInput!): SPLTPPermit!
    updateSPLTPPermit(id: ID!, input: SPLTPPermitInput!): SPLTPPermit!
    saveSPLTPPermitDraft(input: SPLTPPermitInput!): SPLTPPermit!
    createTCEBPPermit(input: TCEBPPermitInput!): TCEBPPermit!
    updateTCEBPPermit(id: ID!, input: TCEBPPermitInput!): TCEBPPermit!
    saveTCEBPPermitDraft(input: TCEBPPermitInput!): TCEBPPermit!
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

  input TCEBPPermitInput {
    name: String!
    address: String!
    contactNumber: String!
    purpose: String!
    files: TCEBPFilesInput
  }

  input COVFilesInput {
    letterOfIntent: [FileInput]
    tallySheet: [FileInput]
    forestCertification: [FileInput]
    orCr: [FileInput]
    driverLicense: [FileInput]
    specialPowerOfAttorney: [FileInput]
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

  input PLTPFilesInput {
    applicationLetter: [FileInput]
    lguEndorsement: [FileInput]
    homeownersResolution: [FileInput]
    ptaResolution: [FileInput]
  }

  input PTPRFilesInput {
    letterRequest: [FileInput]
    titleOrTaxDeclaration: [FileInput]
    darCertification: [FileInput]
    specialPowerOfAttorney: [FileInput]
  }

  input SPLTPFilesInput {
    letterOfIntent: [FileInput]
    lguEndorsement: [FileInput]
    titleCertificate: [FileInput]
    darCertificate: [FileInput]
    specialPowerOfAttorney: [FileInput]
    ptaResolution: [FileInput]
  }

  input TCEBPFilesInput {
    letterOfIntent: [FileInput]
    lguEndorsement: [FileInput]
    landTenurial: [FileInput]
    siteDevelopmentPlan: [FileInput]
    environmentalCompliance: [FileInput]
    fpic: [FileInput]
    ownerConsent: [FileInput]
    pambClearance: [FileInput]
  }

  input FileInput {
    filename: String!
    contentType: String
    data: String
  }
`;

const resolvePermitType = (obj) => {
  switch (obj.applicationType) {
    case 'COV':
    case 'Certificate of Verification':
      return 'COVPermit';
    case 'CSAW':
    case 'Chainsaw Registration':
      return 'CSAWPermit';
    case 'PLTP':
      return 'PLTPPermit';
    case 'PTPR':
    case 'Private Tree Plantation Registration':
      return 'PTPRPermit';
    case 'SPLTP':
    case 'Special/Private Land Timber Permit':
      return 'SPLTPPermit';
    case 'TCEBP':
      return 'TCEBPPermit';
    default:
      throw new Error(`Unknown permit type: ${obj.applicationType}`);
  }
};

module.exports = { permitTypes, resolvePermitType };