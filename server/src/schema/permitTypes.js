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
`;

module.exports = permitTypes;
