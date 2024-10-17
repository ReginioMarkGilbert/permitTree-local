const { mergeResolvers } = require('@graphql-tools/merge');
const { GraphQLUpload } = require('graphql-upload-minimal');
const authResolvers = require('./authResolvers');
const userResolvers = require('./userResolvers');
const adminResolvers = require('./adminResolvers');
const permitResolvers = require('./permitResolvers/permitResolvers');
const csawResolvers = require('./permitResolvers/csawResolvers');
const covResolvers = require('./permitResolvers/covResolvers');
const pltpResolvers = require('./permitResolvers/pltpResolvers');
const ptprResolvers = require('./permitResolvers/ptprResolvers');
const spltpResolvers = require('./permitResolvers/spltpResolvers');
const tcebpResolvers = require('./permitResolvers/tcebpResolvers');
const oopResolvers = require('./oopResolvers');
const certificateResolvers = require('./certificateResolvers');

const resolvers = mergeResolvers([
   { Upload: GraphQLUpload },
   authResolvers,
   userResolvers,
   adminResolvers,
   permitResolvers,
   covResolvers,
   csawResolvers,
   pltpResolvers,
   ptprResolvers,
   spltpResolvers,
   tcebpResolvers,
   oopResolvers,
   certificateResolvers,
]);

module.exports = resolvers;
