const PersonnelNotification = require('../models/PersonnelNotification');
const { withFilter } = require('graphql-subscriptions');
const { pubsub } = require('../config/pubsub');

const personnelNotificationResolvers = {
   Query: {
      getPersonnelNotifications: async (_, { unreadOnly }, { admin }) => {
         try {
            if (!admin) {
               console.log('No admin found in context');
               throw new Error('Not authenticated as admin');
            }

            console.log('Fetching notifications for admin:', admin.id);
            const query = { recipient: admin.id };
            if (unreadOnly) {
               query.read = false;
            }

            const notifications = await PersonnelNotification.find(query)
               .sort({ createdAt: -1 })
               .limit(50)
               .lean();

            console.log(`Found ${notifications.length} notifications`);

            return notifications.map(notification => ({
               id: notification._id.toString(),
               recipient: notification.recipient.toString(),
               type: notification.type,
               title: notification.title,
               message: notification.message,
               metadata: notification.metadata || {},
               priority: notification.priority,
               read: notification.read,
               createdAt: notification.createdAt.toISOString()
            }));
         } catch (error) {
            console.error('Error fetching personnel notifications:', error);
            throw error;
         }
      },

      getUnreadPersonnelNotifications: async (_, __, { admin }) => {
         if (!admin) {
            throw new Error('Not authenticated as admin');
         }

         try {
            const notifications = await PersonnelNotification.find({
               recipient: admin.id,
               read: false
            })
               .sort({ createdAt: -1 })
               .lean();

            return notifications.map(notification => ({
               ...notification,
               id: notification._id.toString(),
               recipient: notification.recipient.toString()
            }));
         } catch (error) {
            console.error('Error fetching unread notifications:', error);
            throw error;
         }
      }
   },

   Mutation: {
      markPersonnelNotificationAsRead: async (_, { id }, { admin }) => {
         if (!admin) {
            throw new Error('Not authenticated as admin');
         }

         const notification = await PersonnelNotification.findOneAndUpdate(
            { _id: id, recipient: admin.id },
            { read: true },
            { new: true, lean: true }
         );

         if (!notification) {
            throw new Error('Notification not found');
         }

         return {
            ...notification,
            id: notification._id.toString(),
            recipient: notification.recipient.toString()
         };
      },

      markAllPersonnelNotificationsAsRead: async (_, __, { admin }) => {
         if (!admin) {
            throw new Error('Not authenticated as admin');
         }

         await PersonnelNotification.updateMany(
            { recipient: admin.id, read: false },
            { read: true }
         );

         return true;
      }
   },

   Subscription: {
      personnelNotificationCreated: {
         subscribe: withFilter(
            () => pubsub.asyncIterator(['PERSONNEL_NOTIFICATION_CREATED']),
            (payload, variables, { admin }) => {
               return payload.personnelNotificationCreated.recipient.toString() === variables.recipientId;
            }
         )
      }
   }
};

module.exports = personnelNotificationResolvers;
