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

   static async createOOPNotification({
      oop,
      recipientId,
      type,
      remarks = ''
   }) {
      const notificationMap = {
         // OOP Creation and Signing
         'OOP_CREATED': {
            title: 'Order of Payment Created',
            message: `Order of Payment (${oop.billNo}) has been created for your application.`
         },
         'OOP_SIGNED': {
            title: 'OOP Signed',
            message: `Order of Payment (${oop.billNo}) has been signed by authorities.`
         },
         'OOP_NEEDS_APPROVAL': {
            title: 'OOP Needs Approval',
            message: `Order of Payment (${oop.billNo}) requires your approval.`
         },

         // Payment Related
         'OOP_READY_FOR_PAYMENT': {
            title: 'Ready for Payment',
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
