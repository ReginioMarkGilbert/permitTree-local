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
    customId: String!
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
    customId: String!
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
`;

module.exports = permitTypes;
