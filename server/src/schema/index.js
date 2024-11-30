const { gql } = require('graphql-tag');
const userTypes = require('./userTypes');
const adminTypes = require('./adminTypes');
const permitTypes = require('./permitTypes');
const oopTypes = require('./oopTypes');
const certificateTypes = require('./certificateTypes');
const queryTypes = require('./queryTypes');
const paymentTypes = require('./paymentTypes');
const mutationTypes = require('./mutationTypes');
const { notificationTypes } = require('./userNotificationTypes');
const { personnelNotificationTypes } = require('./personnelNotificationTypes');
const analyticsTypes = require('./analyticsTypes');
const gisTypes = require('./gisTypes');
const inspectionTypes = require('./inspectionTypes');
const dashboardTypes = require('./dashboardTypes');
const activityTypes = require('./activityTypes');

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
   paymentTypes,
   notificationTypes,
   personnelNotificationTypes,
   analyticsTypes,
   gisTypes,
   inspectionTypes,
   dashboardTypes,
   activityTypes
];
