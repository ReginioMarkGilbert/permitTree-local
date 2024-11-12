const { gql } = require('graphql-tag');

const notificationTypes = gql`
  type NotificationMetadata {
    applicationId: ID
    oopId: ID
    stage: String
    status: String
    remarks: String
  }

  type Notification {
    id: ID!
    recipient: ID!
    type: String!
    title: String!
    message: String!
    metadata: NotificationMetadata
    read: Boolean!
    createdAt: String!
  }

  type Mutation {
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!
  }

  type Subscription {
    notificationCreated(recipientId: ID!): Notification!
  }
`;

module.exports = { notificationTypes };
