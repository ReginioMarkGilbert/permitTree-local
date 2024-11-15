const { mergeResolvers } = require('@graphql-tools/merge');
const { GraphQLUpload } = require('graphql-upload-minimal');
const { GraphQLJSON } = require('graphql-type-json');
const authResolvers = require('./authResolvers');
const userResolvers = require('./userResolvers');
const adminResolvers = require('./adminResolvers');
const permitResolvers = require('./permitResolvers/permitResolvers');
const csawResolvers = require('./permitResolvers/csawResolvers');
const covResolvers = require('./permitResolvers/covResolvers');
const pltcpResolvers = require('./permitResolvers/pltcpResolvers');
const ptprResolvers = require('./permitResolvers/ptprResolvers');
const pltpResolvers = require('./permitResolvers/pltpResolvers');
const tcebpResolvers = require('./permitResolvers/tcebpResolvers');
const paymentResolvers = require('./paymentResolvers');
const certificateResolvers = require('./certificateResolvers');
const notificationResolvers = require('./userNotificationResolvers');
const { resolvePermitType } = require('../schema/permitTypes');
const oopResolvers = require('./oopResolvers');
const personnelNotificationResolvers = require('./personnelNotificationResolvers');
const analyticsResolvers = require('./analyticsResolvers');

// Base resolvers with scalar types and type resolvers
const baseResolvers = {
  Upload: GraphQLUpload,
  JSON: GraphQLJSON,
  Permit: {
    __resolveType: resolvePermitType
  },
  Query: {
    ...userResolvers.Query,
    ...adminResolvers.Query,
    ...permitResolvers.Query,
    ...oopResolvers.Query,
    ...certificateResolvers.Query,
    ...notificationResolvers.Query,
    ...personnelNotificationResolvers.Query,
    ...analyticsResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...adminResolvers.Mutation,
    ...permitResolvers.Mutation,
    ...oopResolvers.Mutation,
    ...certificateResolvers.Mutation,
    ...notificationResolvers.Mutation,
    ...personnelNotificationResolvers.Mutation,
    ...analyticsResolvers.Mutation
  },
  Subscription: {
    ...notificationResolvers.Subscription,
  },
  // Permit type resolvers
  CSAWPermit: permitResolvers.CSAWPermit,
  COVPermit: permitResolvers.COVPermit,
  PTPRPermit: permitResolvers.PTPRPermit,
  PLTCPPermit: permitResolvers.PLTCPPermit,
  PLTPPermit: permitResolvers.PLTPPermit,
  TCEBPPermit: permitResolvers.TCEBPPermit,
};

// Merge all resolvers
const resolvers = mergeResolvers([
  baseResolvers,
  authResolvers,
  userResolvers,
  adminResolvers,
  permitResolvers,
  covResolvers,
  csawResolvers,
  pltcpResolvers,
  ptprResolvers,
  pltpResolvers,
  tcebpResolvers,
  oopResolvers,
  paymentResolvers,
  certificateResolvers,
  notificationResolvers,
  personnelNotificationResolvers,
  analyticsResolvers
]);

module.exports = resolvers;
