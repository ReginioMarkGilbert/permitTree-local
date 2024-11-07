const { mergeResolvers } = require('@graphql-tools/merge');
const { GraphQLUpload } = require('graphql-upload-minimal');
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
const { resolvePermitType } = require('../schema/permitTypes');
const oopResolvers = require('./oopResolvers');

const resolvers = mergeResolvers([
   { Upload: GraphQLUpload },
   {
      Permit: {
         __resolveType: resolvePermitType
      }
   },
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
   paymentResolvers
]);

module.exports = resolvers;
