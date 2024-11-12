const PersonnelNotification = require('../models/PersonnelNotification');
const { pubsub } = require('../config/pubsub');

class PersonnelNotificationService {
   static async createPersonnelNotification({
      recipient,
      type,
      title,
      message,
      metadata = {},
      priority = 'medium'
   }) {
      try {
         const notification = await PersonnelNotification.create({
            recipient,
            type,
            title,
            message,
            metadata,
            priority
         });

         // Publish notification for real-time updates
         pubsub.publish('PERSONNEL_NOTIFICATION_CREATED', {
            personnelNotificationCreated: notification
         });

         return notification;
      } catch (error) {
         console.error('Error creating personnel notification:', error);
         throw error;
      }
   }

   static async createApplicationPersonnelNotification({
      application,
      recipientId,
      type,
      stage,
      remarks = '',
      priority = 'medium'
   }) {
      try {
         console.log('Creating personnel notification:', {
            type,
            recipientId,
            stage,
            applicationId: application._id
         });

         const notificationMap = {
            // Technical Staff notification
            'PENDING_TECHNICAL_REVIEW': {
               title: 'Technical Review Required',
               message: `Application ${application.applicationNumber} requires technical review.`
            },
            // Receiving Clerk notification
            'PENDING_RECEIVING_CLERK_RECORD': {
               title: 'Record Application',
               message: `Application ${application.applicationNumber} needs to be recorded.`
            },
            // Chief notification
            'PENDING_CHIEF_REVIEW': {
               title: 'Chief Review Required',
               message: `Application ${application.applicationNumber} requires Chief RPS review.`
            },
            // PENR/CENR Officer notification
            'PENDING_PENRCENR_APPROVAL': {
               title: 'PENR/CENR Approval Required',
               message: `Application ${application.applicationNumber} requires PENR/CENR Officer approval.`
            }
         };

         const template = notificationMap[type];
         if (!template) {
            console.error(`Unknown notification type: ${type}`);
            throw new Error(`Unknown notification type: ${type}`);
         }

         const notification = await this.createPersonnelNotification({
            recipient: recipientId,
            type,
            title: template.title,
            message: template.message,
            metadata: {
               applicationId: application._id,
               stage,
               remarks,
               actionRequired: type
            },
            priority
         });

         console.log('Personnel notification created:', notification);
         return notification;

      } catch (error) {
         console.error('Error creating personnel notification:', error);
         throw error;
      }
   }
}

module.exports = PersonnelNotificationService;
