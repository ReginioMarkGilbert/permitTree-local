const Notification = require('../models/UserNotification');
const { withFilter } = require('graphql-subscriptions');
const { pubsub } = require('../config/pubsub');

const notificationResolvers = {
   Query: {
      getNotifications: async (_, __, context) => {
         try {
            if (!context.user) {
               console.log('No user in context');
               return [];
            }

            const notifications = await Notification.find({
               recipient: context.user.id
            })
               .sort({ createdAt: -1 })
               .limit(50)
               .lean();

            return notifications.map(notification => ({
               id: notification._id.toString(),
               recipient: notification.recipient.toString(),
               type: notification.type,
               title: notification.title,
               message: notification.message,
               metadata: notification.metadata,
               read: notification.read || false,
               createdAt: notification.createdAt.toISOString()
            }));
         } catch (error) {
            console.error('Error in getNotifications:', error);
            return [];
         }
      },

      getUnreadNotifications: async (_, __, context) => {
         try {
            if (!context.user) {
               console.log('No user in context');
               return [];
            }

            const notifications = await Notification.find({
               recipient: context.user.id,
               read: false
            })
               .sort({ createdAt: -1 })
               .lean();

            return notifications.map(notification => ({
               id: notification._id.toString(),
               recipient: notification.recipient.toString(),
               type: notification.type,
               title: notification.title,
               message: notification.message,
               metadata: notification.metadata,
               read: false,
               createdAt: notification.createdAt.toISOString()
            }));
         } catch (error) {
            console.error('Error in getUnreadNotifications:', error);
            return [];
         }
      }
   },

   Mutation: {
      markNotificationAsRead: async (_, { id }, context) => {
         try {
            if (!context.user) throw new Error('Not authenticated');

            const notification = await Notification.findOneAndUpdate(
               { _id: id, recipient: context.user.id },
               { read: true },
               { new: true, lean: true }
            );

            if (!notification) throw new Error('Notification not found');

            return {
               id: notification._id.toString(),
               recipient: notification.recipient.toString(),
               type: notification.type,
               title: notification.title,
               message: notification.message,
               metadata: notification.metadata,
               read: true,
               createdAt: notification.createdAt.toISOString()
            };
         } catch (error) {
            console.error('Error in markNotificationAsRead:', error);
            throw error;
         }
      },

      markAllNotificationsAsRead: async (_, __, context) => {
         try {
            if (!context.user) throw new Error('Not authenticated');

            await Notification.updateMany(
               { recipient: context.user.id, read: false },
               { read: true }
            );

            return true;
         } catch (error) {
            console.error('Error in markAllNotificationsAsRead:', error);
            throw error;
         }
      }
   },

   Subscription: {
      notificationCreated: {
         subscribe: withFilter(
            () => pubsub.asyncIterator(['NOTIFICATION_CREATED']),
            (payload, variables) => {
               return payload.notificationCreated.recipient.toString() === variables.recipientId;
            }
         )
      }
   }
};

module.exports = notificationResolvers;
