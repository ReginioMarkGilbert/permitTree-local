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
            },

            'APPLICATION_READY_FOR_INSPECTION': {
               title: 'Application Ready for Inspection',
               message: `Application ${application.applicationNumber} has been reviewed by Chief RPS/TSD and is ready for inspection.`
            },
            'PENDING_INSPECTION': {
               title: 'Inspection Required',
               message: `Application ${application.applicationNumber} requires technical inspection and authenticity approval.`
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

   static async createOOPPersonnelNotification({
      oop,
      recipientId,
      type,
      OOPStatus,
      remarks = '',
      priority = 'medium'
   }) {
      try {
         console.log('Creating OOP personnel notification:', {
            type,
            recipientId,
            OOPStatus,
            remarks,
            oop: oop._id
         });

         const OOPNotificationMap = {
            'OOP_PENDING_SIGNATURE': {
               title: 'Order of Payment Pending Signature',
               message: `Order of Payment (${oop.billNo}) requires your signature.`
            },
            'OOP_PENDING_APPROVAL': {
               title: 'Order of Payment Pending Approval',
               message: `Order of Payment (${oop.billNo}) requires your approval.`
            },
            'PAYMENT_PROOF_SUBMITTED': {
               title: 'New Payment Proof Submitted',
               message: `A payment proof for Order of Payment (${oop.billNo}) has been submitted and requires your verification.`,
               priority: 'high'
            },
            'PAYMENT_PENDING_VERIFICATION': {
               title: 'Payment Pending Verification',
               message: `Payment for Order of Payment (${oop.billNo}) is pending verification.`,
               priority: 'high'
            }
         };

         const template = OOPNotificationMap[type];
         if (!template) {
            throw new Error(`Unknown notification type: ${type}`);
         }

         const notification = await this.createPersonnelNotification({
            recipient: recipientId,
            type,
            title: template.title,
            message: template.message,
            metadata: {
               oopId: oop._id,
               OOPStatus,
               remarks,
               actionRequired: type
            },
            priority: template.priority || priority
         });

         return notification;
      } catch (error) {
         console.error('Error creating OOP personnel notification:', error);
         throw error;
      }
   }
}

module.exports = PersonnelNotificationService;
