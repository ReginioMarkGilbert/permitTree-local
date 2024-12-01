const { gql } = require('graphql-tag');

const permitTypes = gql`
  type HistoryEntry {
    stage: String!
    status: String!
    timestamp: String!
    notes: String
    actionBy: ID
  }

  interface Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    currentStage: String!
    dateOfSubmission: String!
    acceptedByTechnicalStaff: Boolean!
    approvedByTechnicalStaff: Boolean!
    acceptedByReceivingClerk: Boolean!
    recordedByReceivingClerk: Boolean!
    acceptedByPENRCENROfficer: Boolean!
    approvedByPENRCENROfficer: Boolean!
    reviewedByChief: Boolean!
    awaitingOOP: Boolean!
    OOPCreated: Boolean!
    hasInspectionReport: Boolean!
    InspectionReportsReviewedByChief: Boolean!
    InspectionReportsReviewedByPENRCENROfficer: Boolean!
    awaitingPermitCreation: Boolean!
    PermitCreated: Boolean!
    certificateSignedByPENRCENROfficer: Boolean!
    history: [HistoryEntry]
    certificateId: ID
    hasCertificate: Boolean!
  }

  type COVPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    currentStage: String!
    recordedByReceivingClerk: Boolean!
    acceptedByTechnicalStaff: Boolean!
    approvedByTechnicalStaff: Boolean!
    acceptedByReceivingClerk: Boolean!
    acceptedByPENRCENROfficer: Boolean!
    approvedByPENRCENROfficer: Boolean!
    reviewedByChief: Boolean!
    awaitingOOP: Boolean!
    OOPCreated: Boolean!
    hasInspectionReport: Boolean!
    InspectionReportsReviewedByChief: Boolean!
    InspectionReportsReviewedByPENRCENROfficer: Boolean!
    awaitingPermitCreation: Boolean!
    PermitCreated: Boolean!
    certificateSignedByPENRCENROfficer: Boolean!
    dateOfSubmission: String!
    applicantId: ID!
    history: [HistoryEntry!]!
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
    certificate: Certificate
    certificateId: ID
    hasCertificate: Boolean!
  }

  type CSAWPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    currentStage: String!
    recordedByReceivingClerk: Boolean!
    acceptedByTechnicalStaff: Boolean!
    approvedByTechnicalStaff: Boolean!
    acceptedByReceivingClerk: Boolean!
    acceptedByPENRCENROfficer: Boolean!
    approvedByPENRCENROfficer: Boolean!
    reviewedByChief: Boolean!
    awaitingOOP: Boolean!
    OOPCreated: Boolean!
    hasInspectionReport: Boolean!
    InspectionReportsReviewedByChief: Boolean!
    InspectionReportsReviewedByPENRCENROfficer: Boolean!
    awaitingPermitCreation: Boolean!
    PermitCreated: Boolean!
    certificateSignedByPENRCENROfficer: Boolean!
    dateOfSubmission: String!
    applicantId: ID!
    history: [HistoryEntry!]!
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
    isPTPRHolder: Boolean!
    isWPPHolder: Boolean!
    files: CSAWFiles
    certificate: Certificate
    certificateId: ID
    hasCertificate: Boolean!
  }

  type PLTCPPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    currentStage: String!
    recordedByReceivingClerk: Boolean!
    acceptedByTechnicalStaff: Boolean!
    approvedByTechnicalStaff: Boolean!
    acceptedByReceivingClerk: Boolean!
    acceptedByPENRCENROfficer: Boolean!
    approvedByPENRCENROfficer: Boolean!
    reviewedByChief: Boolean!
    awaitingOOP: Boolean!
    OOPCreated: Boolean!
    hasInspectionReport: Boolean!
    InspectionReportsReviewedByChief: Boolean!
    InspectionReportsReviewedByPENRCENROfficer: Boolean!
    awaitingPermitCreation: Boolean!
    PermitCreated: Boolean!
    certificateSignedByPENRCENROfficer: Boolean!
    dateOfSubmission: String!
    applicantId: ID!
    history: [HistoryEntry!]!
    name: String!
    address: String!
    contactNumber: String!
    treeType: [String!]!
    treeStatus: [String!]!
    landType: [String!]!
    posingDanger: Boolean!
    forPersonalUse: Boolean!
    purpose: String!
    files: PLTCPFiles
    certificate: Certificate
    certificateId: ID
    hasCertificate: Boolean!
  }

  type PTPRPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    currentStage: String!
    recordedByReceivingClerk: Boolean!
    acceptedByTechnicalStaff: Boolean!
    approvedByTechnicalStaff: Boolean!
    acceptedByReceivingClerk: Boolean!
    acceptedByPENRCENROfficer: Boolean!
    approvedByPENRCENROfficer: Boolean!
    reviewedByChief: Boolean!
    awaitingOOP: Boolean!
    OOPCreated: Boolean!
    hasInspectionReport: Boolean!
    InspectionReportsReviewedByChief: Boolean!
    InspectionReportsReviewedByPENRCENROfficer: Boolean!
    awaitingPermitCreation: Boolean!
    PermitCreated: Boolean!
    certificateSignedByPENRCENROfficer: Boolean!
    dateOfSubmission: String!
    applicantId: ID!
    history: [HistoryEntry!]!
    ownerName: String!
    address: String!
    contactNumber: String!
    lotArea: Float!
    treeSpecies: [String!]!
    totalTrees: Int!
    treeSpacing: String!
    yearPlanted: Int!
    files: PTPRFiles
    certificate: Certificate
    certificateId: ID
    hasCertificate: Boolean!
  }

  type PLTPPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    currentStage: String!
    recordedByReceivingClerk: Boolean!
    acceptedByTechnicalStaff: Boolean!
    approvedByTechnicalStaff: Boolean!
    acceptedByReceivingClerk: Boolean!
    acceptedByPENRCENROfficer: Boolean!
    approvedByPENRCENROfficer: Boolean!
    reviewedByChief: Boolean!
    awaitingOOP: Boolean!
    OOPCreated: Boolean!
    hasInspectionReport: Boolean!
    InspectionReportsReviewedByChief: Boolean!
    InspectionReportsReviewedByPENRCENROfficer: Boolean!
    awaitingPermitCreation: Boolean!
    PermitCreated: Boolean!
    certificateSignedByPENRCENROfficer: Boolean!
    dateOfSubmission: String!
    applicantId: ID!
    history: [HistoryEntry!]!
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
    files: PLTPFiles
    certificate: Certificate
    certificateId: ID
    hasCertificate: Boolean!
  }

  type TCEBPPermit implements Permit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    status: String!
    currentStage: String!
    recordedByReceivingClerk: Boolean!
    acceptedByTechnicalStaff: Boolean!
    approvedByTechnicalStaff: Boolean!
    acceptedByReceivingClerk: Boolean!
    acceptedByPENRCENROfficer: Boolean!
    approvedByPENRCENROfficer: Boolean!
    reviewedByChief: Boolean!
    awaitingOOP: Boolean!
    OOPCreated: Boolean!
    hasInspectionReport: Boolean!
    InspectionReportsReviewedByChief: Boolean!
    InspectionReportsReviewedByPENRCENROfficer: Boolean!
    awaitingPermitCreation: Boolean!
    PermitCreated: Boolean!
    certificateSignedByPENRCENROfficer: Boolean!
    dateOfSubmission: String!
    applicantId: ID!
    history: [HistoryEntry!]!
    name: String!
    address: String!
    contactNumber: String!
    purpose: String!
    requestType: String!
    files: TCEBPFiles
    certificate: Certificate
    certificateId: ID
    hasCertificate: Boolean!
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

  type PLTCPFiles {
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

  type PLTPFiles {
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
    getUserApplications(status: String, currentStage: String): [Permit!]!
    getAllCOVPermits: [COVPermit!]!
    getCOVPermitById(id: ID!): COVPermit
    getCOVPermitWithFiles(id: ID!): COVPermit
    getAllCSAWPermits: [CSAWPermit!]!
    getCSAWPermitById(id: ID!): CSAWPermit
    getAllPLTCPPermits: [PLTCPPermit!]!
    getPLTCPPermitById(id: ID!): PLTCPPermit
    getAllPTPRPermits: [PTPRPermit!]!
    getPTPRPermitById(id: ID!): PTPRPermit
    getAllPLTPPermits: [PLTPPermit!]!
    getPLTPPermitById(id: ID!): PLTPPermit
    getAllTCEBPPermits: [TCEBPPermit!]!
    getTCEBPPermitById(id: ID!): TCEBPPermit
    getSubmittedApplications: [Permit!]!
    getApplicationsByStatus(
      status: String,
      currentStage: String,
      acceptedByTechnicalStaff: Boolean,
      approvedByTechnicalStaff: Boolean,

      acceptedByReceivingClerk: Boolean,
      recordedByReceivingClerk: Boolean,

      acceptedByPENRCENROfficer: Boolean,
      approvedByPENRCENROfficer: Boolean,

      reviewedByChief: Boolean,

      awaitingOOP: Boolean,
      OOPCreated: Boolean,

      hasInspectionReport: Boolean,
      InspectionReportsReviewedByChief: Boolean,
      InspectionReportsReviewedByPENRCENROfficer: Boolean,

      awaitingPermitCreation: Boolean,
      PermitCreated: Boolean,
      certificateSignedByPENRCENROfficer: Boolean
    ): [Permit!]!
   #  getApplicationsByCurrentStage(currentStage: String!): [Permit!]!
    getPermitByApplicationNumber(applicationNumber: String!): Permit
    getRecentApplications(limit: Int!): [Permit!]!
  }

  type Mutation {
    createCOVPermit(input: COVPermitInput!): COVPermit!
    updateCOVPermit(id: ID!, input: COVPermitInput!): COVPermit!
    saveCOVPermitDraft(input: COVPermitInput!): COVPermit!

    createCSAWPermit(input: CSAWPermitInput!): CSAWPermit!
    updateCSAWPermit(id: ID!, input: CSAWPermitInput!): CSAWPermit!
    saveCSAWPermitDraft(input: CSAWPermitInput!): CSAWPermit!

    createPLTCPPermit(input: PLTCPPermitInput!): PLTCPPermit!
    updatePLTCPPermit(id: ID!, input: PLTCPPermitInput!): PLTCPPermit!
    savePLTCPPermitDraft(input: PLTCPPermitInput!): PLTCPPermit!

    createPTPRPermit(input: PTPRPermitInput!): PTPRPermit!
    updatePTPRPermit(id: ID!, input: PTPRPermitInput!): PTPRPermit!
    savePTPRPermitDraft(input: PTPRPermitInput!): PTPRPermit!

    createPLTPPermit(input: PLTPPermitInput!): PLTPPermit!
    updatePLTPPermit(id: ID!, input: PLTPPermitInput!): PLTPPermit!
    savePLTPPermitDraft(input: PLTPPermitInput!): PLTPPermit!

    createTCEBPPermit(input: TCEBPPermitInput!): TCEBPPermit!
    updateTCEBPPermit(id: ID!, input: TCEBPPermitInput!): TCEBPPermit!
    saveTCEBPPermitDraft(input: TCEBPPermitInput!): TCEBPPermit!

    updatePermitStage(
      id: ID!
      currentStage: String!
      status: String!
      notes: String
      acceptedByTechnicalStaff: Boolean
      approvedByTechnicalStaff: Boolean
      acceptedByReceivingClerk: Boolean
      recordedByReceivingClerk: Boolean

      reviewedByChief: Boolean

      acceptedByPENRCENROfficer: Boolean
      approvedByPENRCENROfficer: Boolean

      awaitingOOP: Boolean
      OOPCreated: Boolean
      hasInspectionReport: Boolean
      InspectionReportsReviewedByChief: Boolean
      InspectionReportsReviewedByPENRCENROfficer: Boolean
      awaitingPermitCreation: Boolean
      PermitCreated: Boolean
      certificateSignedByPENRCENROfficer: Boolean
      hasCertificate: Boolean
      certificateId: ID
    ): Permit!
    recordApplication(id: ID!, notes: String): Permit!
    undoRecordApplication(id: ID!, approvedByPENRCENROfficer: Boolean): Permit!
    undoAcceptanceCENRPENROfficer(id: ID!, reviewedByChief: Boolean): Permit!
    undoAcceptanceTechnicalStaff(id: ID!, acceptedByTechnicalStaff: Boolean, recordedByReceivingClerk: Boolean): Permit!

    reviewApplication(id: ID!): Permit!
    submitPermit(id: ID!): Permit!
    deletePermit(id: ID!): Boolean!
    unsubmitPermit(id: ID!): Permit!
    scheduleInspection(
      permitId: ID!
      scheduledDate: String!
      scheduledTime: String!
      location: String!
    ): Permit
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
    isPTPRHolder: Boolean!
    isWPPHolder: Boolean!
    files: CSAWFilesInput
  }

  input PLTCPPermitInput {
    name: String!
    address: String!
    contactNumber: String!
    treeType: [String!]!
    treeStatus: [String!]!
    landType: [String!]!
    posingDanger: Boolean!
    forPersonalUse: Boolean!
    purpose: String!
    files: PLTCPFilesInput
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

  input PLTPPermitInput {
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
    files: PLTPFilesInput
  }

  input TCEBPPermitInput {
    name: String!
    address: String!
    contactNumber: String!
    purpose: String!
    requestType: String!
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

  input PLTCPFilesInput {
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

  input PLTPFilesInput {
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
    contentType: String!
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
      case 'PLTCP':
      case 'Public Land Tree Cutting Permit':
         return 'PLTCPPermit';
      case 'PTPR':
      case 'Private Tree Plantation Registration':
         return 'PTPRPermit';
      case 'PLTP':
      case 'Private Land Timber Permit':
         return 'PLTPPermit';
      case 'TCEBP':
      case 'Tree Cutting and/or Earth Balling Permit':
         return 'TCEBPPermit';
      default:
         throw new Error(`Unknown permit type: ${obj.applicationType}`);
   }
};

module.exports = { permitTypes, resolvePermitType };
