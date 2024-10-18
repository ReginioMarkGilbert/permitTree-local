const { gql } = require('graphql-tag');
const userTypes = require('./userTypes');
const permitTypes = require('./permitTypes');
const oopTypes = require('./oopTypes');
const certificateTypes = require('./certificateTypes');
const queryTypes = require('./queryTypes');
const mutationTypes = require('./mutationTypes');

const rootTypeDefs = gql`
  scalar Upload

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
  permitTypes.permitTypes,
  oopTypes,
  certificateTypes,
  queryTypes,
  mutationTypes
];
