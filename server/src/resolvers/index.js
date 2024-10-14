const { mergeResolvers } = require('@graphql-tools/merge');
const authResolvers = require('./authResolvers');
const userResolvers = require('./userResolvers');
const adminResolvers = require('./adminResolvers');

// Remove or comment out these lines until you implement these resolvers
// const permitResolvers = require('./permitResolvers');
// const paymentResolvers = require('./paymentResolvers');
// const dashboardResolvers = require('./dashboardResolvers');

const resolvers = mergeResolvers([
  authResolvers,
  userResolvers,
  adminResolvers,
  // Remove or comment out these lines
  // permitResolvers,
  // paymentResolvers,
  // dashboardResolvers,
]);

module.exports = resolvers;
