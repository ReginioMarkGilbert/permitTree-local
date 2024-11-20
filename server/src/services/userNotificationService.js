const Notification = require('../models/UserNotification');
const { pubsub } = require('../config/pubsub');
const User = require('../models/User');

class NotificationService {
   static async createNotification({
      recipient,
      type,
      title,
      message,
      metadata = {}
   }) {
      try {
         const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            metadata
         });

         // Publish notification for real-time updates
         pubsub.publish('NOTIFICATION_CREATED', {
            notificationCreated: notification
         });

         return notification;
      } catch (error) {
         console.error('Error creating notification:', error);
         throw error;
      }
   }

   static async createApplicationNotification({
      application,
      recipientId,
      type,
      stage,
      remarks = ''
   }) {
      const notificationMap = {
         'APPLICATION_SUBMITTED': {
            title: 'Application Submitted',
            message: `Application ${application.applicationNumber} has been submitted successfully.`
         },
         'APPLICATION_ACCEPTED_BY_TECHNICAL': {
            title: 'Application Accepted',
            message: `Your application ${application.applicationNumber} has been accepted by technical staff.`
         },
         'APPLICATION_RETURNED_BY_TECHNICAL': {
            title: 'Application Returned',
            message: `Your application ${application.applicationNumber} has been returned by technical staff.`
         },
         'APPLICATION_RECORDED': {
            title: 'Application Recorded',
            message: `Your application ${application.applicationNumber} has been recorded by receiving clerk.`
         },
         'APPLICATION_REVIEWED_BY_CHIEF': {
            title: 'Application Reviewed by Chief',
            message: `Your application ${application.applicationNumber} has been reviewed by Chief RPS/TSD and is now proceeding to technical inspection.`
         },
         'INSPECTION_SCHEDULED': {
            title: 'Inspection Scheduled',
            message: `An inspection has been scheduled for your application ${application.applicationNumber}. ${remarks}`
         },
         'APPLICATION_INSPECTION_COMPLETE': {
            title: 'Inspection Completed',
            message: `Inspection for your application ${application.applicationNumber} has been completed. ${remarks}`
         }
      };

      const template = notificationMap[type];
      if (!template) {
         throw new Error(`Unknown notification type: ${type}`);
      }

      return this.createNotification({
         recipient: recipientId,
         type,
         title: template.title,
         message: template.message,
         metadata: {
            applicationId: application._id,
            stage,
            remarks
         }
      });
   }

   static async createOOPUserNotification({
      oop,
      recipientId,
      type,
      remarks = ''
   }) {
      if (!oop || !oop.billNo) {
         throw new Error('Invalid OOP data provided');
      }
      const notificationMap = {
         'OOP_CREATED': {
            title: 'Order of Payment Created',
            message: `Order of Payment (${oop.billNo}) has been created for your application.`
         },
         'OOP_SIGNED': {
            title: 'Order of Payment Signed',
            message: `Order of Payment (${oop.billNo}) has been signed by authorities.`
         },
         'OOP_NEEDS_APPROVAL': {
            title: 'Order of Payment Needs Approval',
            message: `Order of Payment (${oop.billNo}) requires your approval.`
         },
         'OOP_READY_FOR_PAYMENT': {
            title: 'Order of Payment Ready for Payment',
            message: `Order of Payment (${oop.billNo}) is ready for payment.`
         },
         'PAYMENT_VERIFIED': {
            title: 'Payment Verified',
            message: `Payment for Order of Payment (${oop.billNo}) has been verified.`
         },
         'PAYMENT_REJECTED': {
            title: 'Payment Rejected',
            message: `Payment for Order of Payment (${oop.billNo}) has been rejected. ${remarks}`
         },
         'OR_ISSUED': {
            title: 'Official Receipt Issued',
            message: `Official Receipt has been issued for Order of Payment (${oop.billNo}).`
         },
         'OOP_SIGNATURES_COMPLETE': {
            title: 'Order of Payment Signatures Complete',
            message: `Order of Payment (${oop.billNo}) has been signed by all required signatories.`
         },
         //
         'OOP_FORWARDED_TO_ACCOUNTANT': {
            title: 'Order of Payment Forwarded for Approval',
            message: `Order of Payment (${oop.billNo}) has been forwarded to the Accountant for approval.`
         },
         'PAYMENT_PROOF_SUBMITTED': {
            title: 'Payment Proof Submitted',
            message: `Your payment proof for Order of Payment (${oop.billNo}) has been submitted and is pending verification.`
         }
      };

      const template = notificationMap[type];
      if (!template) {
         throw new Error(`Unknown notification type: ${type}`);
      }

      return this.createNotification({
         recipient: recipientId,
         type,
         title: template.title,
         message: template.message,
         metadata: {
            oopId: oop._id,
            remarks
         }
      });
   }
}

module.exports = NotificationService;
