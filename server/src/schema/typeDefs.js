const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar Upload

  type ProfilePicture {
    data: String
    contentType: String
  }

  input ProfilePictureInput {
    data: String!
    contentType: String!
  }

   type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String!
    role: String!
    # ... (other fields)
  }

  input UpdateUserProfileInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    company: String
    address: String
    removeProfilePicture: Boolean
    profilePicture: ProfilePictureInput
  }

  type Admin {
    id: ID!
    adminId: Int!
    username: String!
    firstName: String!
    lastName: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Permit {
    id: ID!
    applicationType: String!
    applicationNumber: String!
    applicantId: ID!
    status: String!
    dateSubmitted: String!
    lastUpdated: String!
  }

  type CSAWPermit {
    id: ID!
    registrationType: String!
    chainsawStore: String!
    brand: String!
    model: String!
    serialNumber: String!
    powerOutput: String!
    maxLengthGuidebar: String!
    countryOfOrigin: String!
    purchasePrice: Float!
    dateOfAcquisition: String!
    supportingDocuments: CSAWSupportingDocuments
  }

  type CSAWSupportingDocuments {
    officialReceipt: [String]
    deedOfSale: [String]
    specialPowerOfAttorney: [String]
    forestTenureAgreement: [String]
    businessPermit: [String]
    certificateOfRegistration: [String]
    woodProcessingPlantPermit: [String]
  }

  input CSAWPermitInput {
    registrationType: String!
    chainsawStore: String!
    brand: String!
    model: String!
    serialNumber: String!
    powerOutput: String!
    maxLengthGuidebar: String!
    countryOfOrigin: String!
    purchasePrice: Float!
    dateOfAcquisition: String!
    supportingDocuments: CSAWSupportingDocumentsInput
  }

  input CSAWSupportingDocumentsInput {
    officialReceipt: [Upload]
    deedOfSale: [Upload]
    specialPowerOfAttorney: [Upload]
    forestTenureAgreement: [Upload]
    businessPermit: [Upload]
    certificateOfRegistration: [Upload]
    woodProcessingPlantPermit: [Upload]
  }

  type COVPermit {
    id: ID!
    treeSpecies: String!
    quantity: Int!
    location: String!
    purposeOfTransport: String!
    destinationAddress: String!
    supportingDocuments: COVSupportingDocuments
  }

  type COVSupportingDocuments {
    proofOfOwnership: [String]
    transportationPermit: [String]
  }

  input COVPermitInput {
    treeSpecies: String!
    quantity: Int!
    location: String!
    purposeOfTransport: String!
    destinationAddress: String!
    supportingDocuments: COVSupportingDocumentsInput
  }

  input COVSupportingDocumentsInput {
    proofOfOwnership: [Upload]
    transportationPermit: [Upload]
  }

  type PLTPPermit {
    id: ID!
    location: String!
    treeSpecies: [String!]!
    numberOfTrees: Int!
    purposeOfCutting: String!
    publicLandType: String!
    supportingDocuments: PLTPSupportingDocuments
  }

  type PLTPSupportingDocuments {
    requestLetter: [String]
    siteInspectionReport: [String]
    treeInventory: [String]
    publicLandCertification: [String]
  }

  input PLTPPermitInput {
    location: String!
    treeSpecies: [String!]!
    numberOfTrees: Int!
    purposeOfCutting: String!
    publicLandType: String!
    supportingDocuments: PLTPSupportingDocumentsInput
  }

  input PLTPSupportingDocumentsInput {
    requestLetter: [Upload]
    siteInspectionReport: [Upload]
    treeInventory: [Upload]
    publicLandCertification: [Upload]
  }

  type PTPRPermit {
    id: ID!
    landOwner: String!
    landLocation: String!
    totalArea: Float!
    treeSpecies: [String!]
    estimatedVolume: Float
    plantingDate: String
    supportingDocuments: PTPRSupportingDocuments
  }

  type PTPRSupportingDocuments {
    proofOfLandOwnership: [String]
    plantationMap: [String]
    inventoryReport: [String]
  }

  input PTPRPermitInput {
    landOwner: String!
    landLocation: String!
    totalArea: Float!
    treeSpecies: [String!]
    estimatedVolume: Float
    plantingDate: String
    supportingDocuments: PTPRSupportingDocumentsInput
  }

  input PTPRSupportingDocumentsInput {
    proofOfLandOwnership: [Upload]
    plantationMap: [Upload]
    inventoryReport: [Upload]
  }

  type SPLTPPermit {
    id: ID!
    landOwner: String!
    landLocation: String!
    treeSpecies: [String!]!
    volumeToHarvest: Float!
    harvestingMethod: String!
    transportationMethod: String!
    supportingDocuments: SPLTPSupportingDocuments
  }

  type SPLTPSupportingDocuments {
    proofOfLandOwnership: [String]
    inventoryReport: [String]
    harvestingPlan: [String]
  }

  input SPLTPPermitInput {
    landOwner: String!
    landLocation: String!
    treeSpecies: [String!]!
    volumeToHarvest: Float!
    harvestingMethod: String!
    transportationMethod: String!
    supportingDocuments: SPLTPSupportingDocumentsInput
  }

  input SPLTPSupportingDocumentsInput {
    proofOfLandOwnership: [Upload]
    inventoryReport: [Upload]
    harvestingPlan: [Upload]
  }

  type TCEBPPermit {
    id: ID!
    projectName: String!
    projectLocation: String!
    treeSpecies: [String!]!
    numberOfTrees: Int!
    cuttingMethod: String!
    dispositionPlan: String!
    agencyName: String!
    supportingDocuments: TCEBPSupportingDocuments
  }

  type TCEBPSupportingDocuments {
    projectProposal: [String]
    environmentalComplianceCertificate: [String]
    treeInventory: [String]
  }

  input TCEBPPermitInput {
    projectName: String!
    projectLocation: String!
    treeSpecies: [String!]!
    numberOfTrees: Int!
    cuttingMethod: String!
    dispositionPlan: String!
    agencyName: String!
    supportingDocuments: TCEBPSupportingDocumentsInput
  }

  input TCEBPSupportingDocumentsInput {
    projectProposal: [Upload]
    environmentalComplianceCertificate: [Upload]
    treeInventory: [Upload]
  }

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

  type Query {
    me: User
    getUser(id: ID!): User
    getAdmin(id: ID!): Admin
    getUserDetails: User
    getAllPermits: [Permit!]!
    getPermitById(id: ID!): Permit
    getAllCSAWPermits: [CSAWPermit!]!
    getCSAWPermitById(id: ID!): CSAWPermit
    getAllCOVPermits: [COVPermit!]!
    getCOVPermitById(id: ID!): COVPermit
    getAllPLTPPermits: [PLTPPermit!]!
    getPLTPPermitById(id: ID!): PLTPPermit
    getAllPTPRPermits: [PTPRPermit!]!
    getPTPRPermitById(id: ID!): PTPRPermit
    getAllSPLTPPermits: [SPLTPPermit!]!
    getSPLTPPermitById(id: ID!): SPLTPPermit
    getAllTCEBPPermits: [TCEBPPermit!]!
    getTCEBPPermitById(id: ID!): TCEBPPermit
    getAllOOPs: [OOP!]!
    getOOPById(id: ID!): OOP
    getAllCertificates: [Certificate!]!
    getCertificateById(id: ID!): Certificate
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    registerUser(firstName: String!, lastName: String!, username: String!, password: String!): AuthPayload!
    createAdmin(input: CreateAdminInput!): Admin!
    updateUserProfile(input: UpdateUserProfileInput!): User
    logout: Boolean
    updatePermitStatus(id: ID!, status: String!): Permit
    createCSAWPermit(input: CSAWPermitInput!): CSAWPermit
    updateCSAWPermit(id: ID!, input: CSAWPermitInput!): CSAWPermit
    createCOVPermit(input: COVPermitInput!): COVPermit
    updateCOVPermit(id: ID!, input: COVPermitInput!): COVPermit
    createPLTPPermit(input: PLTPPermitInput!): PLTPPermit
    updatePLTPPermit(id: ID!, input: PLTPPermitInput!): PLTPPermit
    createPTPRPermit(input: PTPRPermitInput!): PTPRPermit
    updatePTPRPermit(id: ID!, input: PTPRPermitInput!): PTPRPermit
    createSPLTPPermit(input: SPLTPPermitInput!): SPLTPPermit
    updateSPLTPPermit(id: ID!, input: SPLTPPermitInput!): SPLTPPermit
    createTCEBPPermit(input: TCEBPPermitInput!): TCEBPPermit
    updateTCEBPPermit(id: ID!, input: TCEBPPermitInput!): TCEBPPermit
    createOOP(input: OOPInput!): OOP
    updateOOP(id: ID!, input: OOPInput!): OOP
    createCertificate(input: CertificateInput!): Certificate
    updateCertificate(id: ID!, input: CertificateInput!): Certificate
  }

  input CreateAdminInput {
    username: String!
    password: String!
    role: String!
    firstName: String
    lastName: String
  }
`;

module.exports = typeDefs;
