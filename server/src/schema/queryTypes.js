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

    getAllPLTCPPermits: [PLTCPPermit!]!
    getPLTCPPermitById(id: ID!): PLTCPPermit

    getAllPTPRPermits: [PTPRPermit!]!
    getPTPRPermitById(id: ID!): PTPRPermit

    getAllPLTPPermits: [PLTPPermit!]!
    getPLTPPermitById(id: ID!): PLTPPermit

    getAllTCEBPPermits: [TCEBPPermit!]!
    getTCEBPPermitById(id: ID!): TCEBPPermit

    getAllOOPs: [OOP!]!
    getOOPById(id: ID!): OOP
    getOOPsByApplicationId(applicationId: String!): [OOP!]!
    getApplicationsAwaitingOOP: [Permit!]!
    getOOPsByUserId(userId: ID!): [OOP!]!

    getAllCertificates: [Certificate!]!
    getCertificateById(id: ID!): Certificate

    getRecentApplications(
      limit: Int!,
      currentStages: [String],
      roles: [String]
    ): [Permit!]!

    # Certificate queries
    getCertificates(status: String): [Certificate!]!
    getCertificatesByApplicationId(applicationId: ID!): [Certificate!]!

    # Notification Queries
    getNotifications: [Notification!]!
    getUnreadNotifications: [Notification!]!

    # GIS Query
    getGISData: GISData!
  }
`;

module.exports = queryTypes;
