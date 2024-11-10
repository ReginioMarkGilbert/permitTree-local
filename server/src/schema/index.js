const { gql } = require('graphql-tag');
const userTypes = require('./userTypes');
const adminTypes = require('./adminTypes');
const permitTypes = require('./permitTypes');
const oopTypes = require('./oopTypes');
const certificateTypes = require('./certificateTypes');
const queryTypes = require('./queryTypes');
const paymentTypes = require('./paymentTypes');
const mutationTypes = require('./mutationTypes');

const rootTypeDefs = gql`
  scalar Upload
  scalar JSON

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

module.exports = [
  rootTypeDefs,
  userTypes,
  adminTypes,
  permitTypes.permitTypes,
  oopTypes,
  certificateTypes,
  queryTypes,
  mutationTypes,
  paymentTypes
];
