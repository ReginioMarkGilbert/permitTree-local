const { gql } = require('graphql-tag');

const mutationTypes = gql`
  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    registerUser(firstName: String!, lastName: String!, username: String!, password: String!): AuthPayload!
    createAdmin(input: CreateAdminInput!): Admin!
    updateUserProfile(input: UpdateUserProfileInput!): User
    logout: Boolean

    updatePermitStatus(id: ID!, status: String!): Permit
    deletePermit(id: ID!): Boolean
    unsubmitPermit(id: ID!): Permit
    submitPermit(id: ID!): Permit
    createCSAWPermit(input: CSAWPermitInput!): CSAWPermit
    updateCSAWPermit(id: ID!, input: CSAWPermitInput!): CSAWPermit
    saveCSAWPermitDraft(input: CSAWPermitInput!): CSAWPermit

    createCOVPermit(input: COVPermitInput!): COVPermit
    updateCOVPermit(id: ID!, input: COVPermitInput!): COVPermit
    saveCOVPermitDraft(input: COVPermitInput!): COVPermit

    createPLTCPPermit(input: PLTCPPermitInput!): PLTCPPermit
    updatePLTCPPermit(id: ID!, input: PLTCPPermitInput!): PLTCPPermit
    savePLTCPPermitDraft(input: PLTCPPermitInput!): PLTCPPermit

    createPTPRPermit(input: PTPRPermitInput!): PTPRPermit
    updatePTPRPermit(id: ID!, input: PTPRPermitInput!): PTPRPermit
    savePTPRPermitDraft(input: PTPRPermitInput!): PTPRPermit

    createPLTPPermit(input: PLTPPermitInput!): PLTPPermit
    updatePLTPPermit(id: ID!, input: PLTPPermitInput!): PLTPPermit
    savePLTPPermitDraft(input: PLTPPermitInput!): PLTPPermit

    createTCEBPPermit(input: TCEBPPermitInput!): TCEBPPermit
    updateTCEBPPermit(id: ID!, input: TCEBPPermitInput!): TCEBPPermit
    saveTCEBPPermitDraft(input: TCEBPPermitInput!): TCEBPPermit

    createOOP(input: OOPInput!): OOP
    updateOOP(id: ID!, input: OOPInput!): OOP
    updateOOPSignature(id: ID!, signatureType: String!, signatureImage: String!): OOP
    approveOOP(id: ID!, notes: String, status: String!): OOP
    undoAccountantOOPApproval(id: ID!): OOP
    forwardOOPToAccountant(id: ID!): OOP
    undoApproval(paymentId: ID!): OOP

    initiatePayment(oopId: ID!, method: String!): PaymentSession
    confirmPayment(oopId: ID!, reference: String!): PaymentResult

    generateOR(Id: ID!, input: GenerateORInput!): OOP
    sendORToApplicant(Id: ID!): OOP

    deletePermit(id: ID!): Boolean
    unsubmitPermit(id: ID!): Permit
    submitPermit(id: ID!): Permit
    undoOOPCreation(id: ID!): Permit

    # Certificate mutations
    generateCertificate(input: GenerateCertificateInput!): Certificate!
    forwardCertificateForSignature(id: ID!): Certificate!
    signCertificate(id: ID!, signature: String!): Certificate!

    # GIS Mutations
    addProtectedArea(input: ProtectedAreaInput!): GeoJSONCollection!
  }
`;

module.exports = mutationTypes;
