const { gql } = require('graphql-tag');

const queryTypes = gql`
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
`;

module.exports = queryTypes;
