const Notification = require('../models/Notification');
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
      // Application Submission
      'APPLICATION_SUBMITTED': {
        title: 'Application Submitted',
        message: `Application ${application.applicationNumber} has been submitted successfully.`
      },

      // Technical Staff Stage
      'APPLICATION_UNDER_TECHNICAL_REVIEW': {
        title: 'Technical Review',
        message: `Application ${application.applicationNumber} is under technical staff review.`
      },
      'APPLICATION_ACCEPTED_BY_TECHNICAL': {
        title: 'Technical Staff Acceptance',
        message: `Application ${application.applicationNumber} has been accepted by technical staff.`
      },
      'APPLICATION_RETURNED_BY_TECHNICAL': {
        title: 'Application Returned',
        message: `Application ${application.applicationNumber} has been returned by technical staff. ${remarks}`
      },

      // Receiving Clerk Stage
      'APPLICATION_WITH_RECEIVING_CLERK': {
        title: 'With Receiving Clerk',
        message: `Application ${application.applicationNumber} is with the receiving clerk for processing.`
      },
      'APPLICATION_RECORDED': {
        title: 'Application Recorded',
        message: `Application ${application.applicationNumber} has been recorded by receiving clerk.`
      },

      // Chief RPS Stage
      'APPLICATION_WITH_CHIEF': {
        title: 'Chief RPS Review',
        message: `Application ${application.applicationNumber} is under Chief RPS review.`
      },
      'APPLICATION_REVIEWED_BY_CHIEF': {
        title: 'Chief Review Complete',
        message: `Application ${application.applicationNumber} has been reviewed by Chief RPS.`
      },

      // PENR/CENR Stage
      'APPLICATION_WITH_PENRCENR': {
        title: 'PENR/CENR Review',
        message: `Application ${application.applicationNumber} is under PENR/CENR Officer review.`
      },
      'APPLICATION_APPROVED_BY_PENRCENR': {
        title: 'PENR/CENR Approval',
        message: `Application ${application.applicationNumber} has been approved by PENR/CENR Officer.`
      },

      // Inspection Stage
      'APPLICATION_FOR_INSPECTION': {
        title: 'For Inspection',
        message: `Application ${application.applicationNumber} is scheduled for inspection.`
      },
      'APPLICATION_INSPECTION_COMPLETE': {
        title: 'Inspection Complete',
        message: `Inspection for application ${application.applicationNumber} has been completed.`
      },

      // Permit Creation Stage
      'PERMIT_READY': {
        title: 'Permit Ready',
        message: `Permit for application ${application.applicationNumber} is ready for signing.`
      },
      'PERMIT_SIGNED': {
        title: 'Permit Signed',
        message: `Permit for application ${application.applicationNumber} has been signed.`
      },
      'PERMIT_RELEASED': {
        title: 'Permit Released',
        message: `Permit for application ${application.applicationNumber} has been released.`
      },

      // General Status Updates
      'APPLICATION_NEEDS_REVIEW': {
        title: 'Application Needs Review',
        message: `Application ${application.applicationNumber} requires your review.`
      },
      'APPLICATION_STATUS_UPDATE': {
        title: 'Status Update',
        message: `Status update for application ${application.applicationNumber}: ${stage}`
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

  // Helper method to notify next personnel in workflow
  static async notifyNextPersonnel(stage, application) {
    const roleMap = {
      'TechnicalStaffReview': 'Technical_Staff',
      'ReceivingClerkReview': 'Receiving_Clerk',
      'ChiefRPSReview': 'Chief_RPS',
      'CENRPENRReview': 'PENR_CENR_Officer',
      'ForInspectionByTechnicalStaff': 'Technical_Staff',
      'PendingRelease': 'Releasing_Clerk'
    };

    const nextRole = roleMap[stage];
    if (nextRole) {
      const personnel = await User.findOne({ roles: nextRole });
      if (personnel) {
        await this.createApplicationNotification({
          application,
          recipientId: personnel._id,
          type: 'APPLICATION_NEEDS_REVIEW',
          stage
        });
      }
    }
  }
}

module.exports = NotificationService;
