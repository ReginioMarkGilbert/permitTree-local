const PersonnelNotification = require('../models/PersonnelNotification');
const { withFilter } = require('graphql-subscriptions');
const { pubsub } = require('../config/pubsub');
const Admin = require('../models/admin');

const personnelNotificationResolvers = {
   Query: {
      getPersonnelNotifications: async (_, { unreadOnly }, { user }) => {
         try {
            if (!user) {
               console.log('No user found in context');
               return [];
            }

            const query = { recipient: user.id };
            if (unreadOnly) {
               query.read = false;
            }

            const notifications = await PersonnelNotification.find(query)
               .sort({ createdAt: -1 })
               .limit(50)
               .lean();

            if (!notifications) {
               console.log('No notifications found');
               return [];
            }

            return notifications.map(notification => ({
               //  ...notification,
               //  id: notification._id.toString()
               id: notification._id.toString(),
               recipient: notification.recipient.toString(),
               type: notification.type,
               title: notification.title,
               message: notification.message,
               metadata: notification.metadata,
               read: notification.read,
               createdAt: notification.createdAt.toISOString()
            }));
         } catch (error) {
            console.error('Error fetching personnel notifications:', error);
            return [];
         }
      },

      getUnreadPersonnelNotifications: async (_, __, { user }) => {
         if (!user) return [];

         const notifications = await PersonnelNotification.find({
            recipient: user.id,
            read: false
         })
            .sort({ createdAt: -1 })
            .lean();

         return notifications.map(notification => ({
            ...notification,
            id: notification._id.toString()
         }));
      }
   },

   Mutation: {
      markPersonnelNotificationAsRead: async (_, { id }, { user }) => {
         if (!user) throw new Error('Not authenticated');

         const notification = await PersonnelNotification.findOneAndUpdate(
            { _id: id, recipient: user.id },
            { read: true },
            { new: true, lean: true }
         );

         if (!notification) throw new Error('Notification not found');

         return {
            ...notification,
            id: notification._id.toString()
         };
      },

      markAllPersonnelNotificationsAsRead: async (_, __, { user }) => {
         if (!user) throw new Error('Not authenticated');

         await PersonnelNotification.updateMany(
            { recipient: user.id, read: false },
            { read: true }
         );

         return true;
      }
   },

   Subscription: {
      personnelNotificationCreated: {
         subscribe: withFilter(
            () => pubsub.asyncIterator(['PERSONNEL_NOTIFICATION_CREATED']),
            (payload, variables) => {
               return payload.personnelNotificationCreated.recipient.toString() === variables.recipientId;
            }
         )
      }
   }
};

module.exports = personnelNotificationResolvers;
