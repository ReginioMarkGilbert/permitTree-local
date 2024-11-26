const { gql } = require('graphql-tag');

const inspectionTypes = gql`
  type InspectionFile {
    filename: String!
    contentType: String!
    data: String!
  }

  type Inspection {
    id: ID!
    permitId: ID!
    applicationNumber: String!
    applicationType: String!
    scheduledDate: String!
    scheduledTime: String!
    location: String!
    inspectionStatus: String!
    inspectorId: ID!
    findings: InspectionFindings
    history: [InspectionHistory!]!
    createdAt: String!
    updatedAt: String!
  }

  type InspectionFindings {
    result: String
    observations: String
    recommendations: String
    attachments: [InspectionFile!]
  }

  type InspectionHistory {
    action: String!
    timestamp: String!
    notes: String
    performedBy: ID
  }

  input InspectionFileInput {
    filename: String!
    contentType: String!
    data: String!
  }

  input CreateInspectionInput {
    permitId: ID!
    scheduledDate: String!
    scheduledTime: String!
    location: String!
  }

  input UpdateInspectionInput {
    scheduledDate: String
    scheduledTime: String
    location: String
    inspectionStatus: String
  }

  input InspectionFindingsInput {
    result: String!
    observations: String!
    recommendations: String
    attachments: [InspectionFileInput!]
  }

  extend type Query {
    getInspections: [Inspection!]!
    getInspectionById(id: ID!): Inspection
    getInspectionsByPermit(permitId: ID!): [Inspection!]!
    getPendingInspections: [Inspection!]!
  }

  extend type Mutation {
    createInspection(input: CreateInspectionInput!): Inspection!
    updateInspection(id: ID!, input: UpdateInspectionInput!): Inspection!
    recordInspectionFindings(id: ID!, findings: InspectionFindingsInput!): Inspection!
    cancelInspection(id: ID!, reason: String!): Inspection!
    rescheduleInspection(id: ID!, newDate: String!, newTime: String!): Inspection!
    deleteInspection(id: ID!, reason: String): Boolean!
    undoInspectionReport(id: ID!): Inspection!
  }
`;

module.exports = inspectionTypes;
