const { gql } = require('graphql-tag');

const inspectionTypes = gql`
  type Inspection {
    id: ID!
    permitId: ID!
    applicationNumber: String!
    applicationType: String!
    scheduledDate: String!
    scheduledTime: String!
    location: String!
    status: String!
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
    photos: [InspectionPhoto!]
    attachments: [InspectionAttachment!]
  }

  type InspectionPhoto {
    url: String!
    caption: String
    timestamp: String!
  }

  type InspectionAttachment {
    url: String!
    type: String!
    description: String
  }

  type InspectionHistory {
    action: String!
    timestamp: String!
    notes: String
    performedBy: ID
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
    status: String
  }

  input InspectionFindingsInput {
    result: String!
    observations: String!
    recommendations: String
    photos: [InspectionPhotoInput!]
    attachments: [InspectionAttachmentInput!]
  }

  input InspectionPhotoInput {
    url: String!
    caption: String
  }

  input InspectionAttachmentInput {
    url: String!
    type: String!
    description: String
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
  }
`;

module.exports = inspectionTypes;
