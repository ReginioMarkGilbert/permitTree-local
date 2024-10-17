const { gql } = require('graphql-tag');

const permitTypes = gql`
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
    applicationNumber: String!
    status: String!
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
    files: CSAWSupportingDocuments
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
    applicationType: String!
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
    files: CSAWPermitFilesInput
    status: String
    dateOfSubmission: String
  }

  input CSAWPermitFilesInput {
    officialReceipt: [String]
    deedOfSale: [String]
    specialPowerOfAttorney: [String]
    forestTenureAgreement: [String]
    businessPermit: [String]
    certificateOfRegistration: [String]
    woodProcessingPlantPermit: [String]
  }

  type COVPermit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    name: String!
    address: String!
    cellphone: String!
    purpose: String!
    driverName: String!
    driverLicenseNumber: String!
    vehiclePlateNumber: String!
    originAddress: String!
    destinationAddress: String!
    files: COVSupportingDocuments
    dateOfSubmission: String!
    status: String!
  }

  type COVSupportingDocuments {
    letterOfIntent: [String]
    tallySheet: [String]
    forestCertification: [String]
    orCr: [String]
    driverLicense: [String]
    specialPowerOfAttorney: [String]
  }

  input COVPermitInput {
    applicationType: String!
    name: String!
    address: String!
    cellphone: String!
    purpose: String!
    driverName: String!
    driverLicenseNumber: String!
    vehiclePlateNumber: String!
    originAddress: String!
    destinationAddress: String!
    files: COVSupportingDocumentsInput
    status: String
    dateOfSubmission: String
  }

  input COVSupportingDocumentsInput {
    letterOfIntent: [String]
    tallySheet: [String]
    forestCertification: [String]
    orCr: [String]
    driverLicense: [String]
    specialPowerOfAttorney: [String]
  }

  type PTPRPermit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    ownerName: String!
    address: String!
    contactNumber: String!
    lotArea: Float!
    treeSpecies: [String!]!
    totalTrees: Int!
    treeSpacing: String!
    yearPlanted: Int!
    files: PTPRSupportingDocuments
    dateOfSubmission: String!
    status: String!
  }

  type PTPRSupportingDocuments {
    letterRequest: [String]
    titleOrTaxDeclaration: [String]
    darCertification: [String]
    specialPowerOfAttorney: [String]
  }

  input PTPRPermitInput {
    applicationType: String!
    ownerName: String!
    address: String!
    contactNumber: String!
    lotArea: Float!
    treeSpecies: [String!]!
    totalTrees: Int!
    treeSpacing: String!
    yearPlanted: Int!
    files: PTPRSupportingDocumentsInput
    status: String
    dateOfSubmission: String
  }

  input PTPRSupportingDocumentsInput {
    letterRequest: [String]
    titleOrTaxDeclaration: [String]
    darCertification: [String]
    specialPowerOfAttorney: [String]
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

  type CSAWFiles {
    officialReceipt: [Upload!]!
    deedOfSale: [Upload!]!
    specialPowerOfAttorney: [Upload!]!
    forestTenureAgreement: [Upload!]!
    businessPermit: [Upload!]!
    certificateOfRegistration: [Upload!]!
    woodProcessingPlantPermit: [Upload!]!
  }

  input CSAWFilesInput {
    officialReceipt: [Upload!]
    deedOfSale: [Upload!]
    specialPowerOfAttorney: [Upload!]
    forestTenureAgreement: [Upload!]
    businessPermit: [Upload!]
    certificateOfRegistration: [Upload!]
    woodProcessingPlantPermit: [Upload!]
  }

  type PLTPPermit {
    id: ID!
    applicationNumber: String!
    applicationType: String!
    name: String!
    address: String!
    contactNumber: String!
    treeType: String!
    treeStatus: String!
    landType: String!
    purpose: String!
    files: PLTPSupportingDocuments
    dateOfSubmission: String!
    status: String!
  }

  type PLTPSupportingDocuments {
    applicationLetter: [String]
    lguEndorsement: [String]
    homeownersResolution: [String]
    ptaResolution: [String]
  }

  input PLTPPermitInput {
    applicationType: String!
    name: String!
    address: String!
    contactNumber: String!
    treeType: String!
    treeStatus: String!
    landType: String!
    posingDanger: Boolean
    forPersonalUse: Boolean
    purpose: String!
    files: PLTPSupportingDocumentsInput
    status: String
    dateOfSubmission: String
  }

  input PLTPSupportingDocumentsInput {
    applicationLetter: [String]
    lguEndorsement: [String]
    homeownersResolution: [String]
    ptaResolution: [String]
  }
`;

module.exports = permitTypes;
