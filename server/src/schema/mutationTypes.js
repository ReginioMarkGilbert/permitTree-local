const { gql } = require('graphql-tag');

const mutationTypes = gql`
  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    registerUser(firstName: String!, lastName: String!, username: String!, password: String!): AuthPayload!
    createAdmin(input: CreateAdminInput!): Admin!
    updateUserProfile(input: UpdateUserProfileInput!): User
    logout: Boolean

    updatePermitStatus(id: ID!, status: String!): Permit
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

    createSPLTPPermit(input: SPLTPPermitInput!): SPLTPPermit
    updateSPLTPPermit(id: ID!, input: SPLTPPermitInput!): SPLTPPermit
    saveSPLTPPermitDraft(input: SPLTPPermitInput!): SPLTPPermit

    createTCEBPPermit(input: TCEBPPermitInput!): TCEBPPermit
    updateTCEBPPermit(id: ID!, input: TCEBPPermitInput!): TCEBPPermit
    saveTCEBPPermitDraft(input: TCEBPPermitInput!): TCEBPPermit

    createOOP(input: OOPInput!): OOP
    updateOOP(id: ID!, input: OOPInput!): OOP

    createCertificate(input: CertificateInput!): Certificate
    updateCertificate(id: ID!, input: CertificateInput!): Certificate


    deletePermit(id: ID!): Boolean
    unsubmitPermit(id: ID!): Permit
    submitPermit(id: ID!): Permit
  }
`;

module.exports = mutationTypes;
