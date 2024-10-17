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

    createCOVPermit(input: COVPermitInput!): COVPermit
    updateCOVPermit(id: ID!, input: COVPermitInput!): COVPermit
    saveCOVPermitDraft(input: COVPermitInput!): COVPermit

    createPLTPPermit(input: PLTPPermitInput!): PLTPPermit
    updatePLTPPermit(id: ID!, input: PLTPPermitInput!): PLTPPermit

    createPTPRPermit(input: PTPRPermitInput!): PTPRPermit
    updatePTPRPermit(id: ID!, input: PTPRPermitInput!): PTPRPermit
    savePTPRPermitDraft(input: PTPRPermitInput!): PTPRPermit

    createSPLTPPermit(input: SPLTPPermitInput!): SPLTPPermit
    updateSPLTPPermit(id: ID!, input: SPLTPPermitInput!): SPLTPPermit

    createTCEBPPermit(input: TCEBPPermitInput!): TCEBPPermit
    updateTCEBPPermit(id: ID!, input: TCEBPPermitInput!): TCEBPPermit

    createOOP(input: OOPInput!): OOP
    updateOOP(id: ID!, input: OOPInput!): OOP

    createCertificate(input: CertificateInput!): Certificate
    updateCertificate(id: ID!, input: CertificateInput!): Certificate

    saveCSAWPermitDraft(input: CSAWPermitInput!): CSAWPermit
  }
`;

module.exports = mutationTypes;
