const { mergeResolvers } = require('@graphql-tools/merge');
const authResolvers = require('./authResolvers');
const userResolvers = require('./userResolvers');
const adminResolvers = require('./adminResolvers');

const resolvers = mergeResolvers([
  authResolvers,
  userResolvers,
  adminResolvers,
]);

module.exports = resolvers;
