const { gql } = require('graphql-tag');
const userTypes = require('./userTypes');
const permitTypes = require('./permitTypes');
const oopTypes = require('./oopTypes');
const certificateTypes = require('./certificateTypes');
const queryTypes = require('./queryTypes');
const mutationTypes = require('./mutationTypes');

const rootTypes = gql`
  scalar Upload
`;

module.exports = [
  rootTypes,
  userTypes,
  permitTypes,
  oopTypes,
  certificateTypes,
  queryTypes,
  mutationTypes
];
