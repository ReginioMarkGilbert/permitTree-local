const { gql } = require('graphql-tag');

const personnelNotificationTypes = gql`
  type PersonnelNotificationMetadata {
    applicationId: ID
    oopId: ID
    stage: String
    status: String
    remarks: String
    actionRequired: String
  }

  type PersonnelNotification {
    id: ID!
    recipient: ID!
    type: String!
    title: String!
    message: String!
    metadata: PersonnelNotificationMetadata
    read: Boolean!
    createdAt: String!
    priority: String
  }

  extend type Query {
    getPersonnelNotifications(unreadOnly: Boolean = false): [PersonnelNotification!]!
    getUnreadPersonnelNotifications: [PersonnelNotification!]!
  }

  extend type Mutation {
    markPersonnelNotificationAsRead(id: ID!): PersonnelNotification!
    markAllPersonnelNotificationsAsRead: Boolean!
  }

  extend type Subscription {
    personnelNotificationCreated(recipientId: ID!): PersonnelNotification!
  }
`;

module.exports = { personnelNotificationTypes };
