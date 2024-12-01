const { OOP } = require('../models/OOP');
const Permit = require('../models/permits/Permit');
const { UserInputError } = require('apollo-server-express');
const { generateBillNo } = require('../utils/billNumberGenerator');
const { generateTrackingNumber } = require('../utils/trackingNumberGenerator');
const UserNotificationService = require('../services/userNotificationService');
const PersonnelNotificationService = require('../services/personnelNotificationService');
const User = require('../models/User');
const Admin = require('../models/admin');

const oopResolvers = {
   Query: {
      getOOPs: async () => {
         try {
            const oops = await OOP.find().sort({ createdAt: -1 });

            console.log('OOPs from database:', oops);

            return oops.map(oop => ({
               ...oop._doc,
               totalAmount: oop.items.reduce((sum, item) => sum + item.amount, 0),
               // Ensure applicationNumber is included
               applicationNumber: oop.applicationNumber
            }));
         } catch (error) {
            console.error('Error fetching OOPs:', error);
            throw new Error('Failed to fetch OOPs');
         }
      },

      getOOPById: async (_, { id }) => {
         return await OOP.findById(id);
      },

      getOOPsByApplicationId: async (_, { applicationId }) => {
         return await OOP.find({ applicationId });
      },

      // getApplicationsAwaitingOOP: async () => {
      //    return await Permit.find({ status: 'AwaitingOOP' });
      // },

      getOOPsByUserId: async (_, { userId, status }) => {
         try {
            if (!userId) {
               return [];
            }

            // Build query object
            const query = { userId };
            if (status) {
               query.OOPstatus = status;
            }

            const oops = await OOP.find(query).sort({ createdAt: -1 });
            if (!oops) {
               return [];
            }

            return oops.map(oop => ({
               ...oop._doc,
               totalAmount: oop.items.reduce((sum, item) => sum + item.amount, 0)
            }));
         } catch (error) {
            console.error('Error fetching user OOPs:', error);
            throw new Error('Failed to fetch user OOPs');
         }
      },

      getRecentOOPs: async (_, { status, limit = 7 }) => {
         try {
            const query = {};
            if (status) {
               query.OOPstatus = status;
            }

            const oops = await OOP.find(query)
               .sort({ createdAt: -1 })
               .limit(limit);

            return oops;
         } catch (error) {
            console.error('Error fetching recent OOPs:', error);
            throw new Error('Failed to fetch recent OOPs');
         }
      }
   },

   Mutation: {
      createOOP: async (_, { input }) => {
         try {
            const permit = await Permit.findById(input.applicationId);
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Debug log
            console.log('Creating OOP with permit:', permit);

            // Create new OOP with explicit applicationNumber
            const oop = new OOP({
               ...input,
               userId: permit.applicantId,
               applicationNumber: permit.applicationNumber, // Ensure this is set
               billNo: await generateBillNo(),
               totalAmount: input.items.reduce((sum, item) => sum + parseFloat(item.amount), 0),
               trackingNo: await generateTrackingNumber(),
               OOPstatus: 'Pending Signature',
               receivedDate: new Date(),
               receivedTime: new Date().toLocaleTimeString()
            });

            console.log('New OOP before save:', oop); // Debug log
            await oop.save();
            console.log('New OOP after save:', oop); // Debug log

            // Update permit status
            await Permit.findByIdAndUpdate(input.applicationId, {
               $set: {
                  OOPCreated: true,
                  awaitingOOP: false
               }
            });

            return oop;
         } catch (error) {
            console.error('Error creating OOP:', error);
            throw new Error(`Failed to create OOP: ${error.message}`);
         }
      },

      updateOOPSignature: async (_, { id, signatureType, signatureImage }) => {
         try {
            const oop = await OOP.findById(id);
            if (!oop) throw new UserInputError('OOP not found');

            const updateField = signatureType === 'rps' ? 'rpsSignatureImage' : 'tsdSignatureImage';
            const signatureDate = signatureType === 'rps' ? 'signatures.chiefRPS' : 'signatures.technicalServices';

            const update = {
               [updateField]: signatureImage,
               [signatureDate]: new Date()
            };

            const updatedOOP = await OOP.findByIdAndUpdate(
               id,
               { $set: update },
               { new: true }
            );

            // Check if both signatures are present
            if (updatedOOP.rpsSignatureImage && updatedOOP.tsdSignatureImage) {
               // Notify user that signatures are complete
               await UserNotificationService.createOOPUserNotification({
                  oop: updatedOOP,
                  recipientId: updatedOOP.userId,
                  type: 'OOP_SIGNATURES_COMPLETE',
                  remarks: 'All required signatures have been completed.'
               });
            }

            return updatedOOP;
         } catch (error) {
            console.error('Error updating OOP signature:', error);
            throw error;
         }
      },

      approveOOP: async (_, { id, notes, status }) => {
         try {
            const oop = await OOP.findById(id);
            if (!oop) throw new UserInputError('OOP not found');

            const updatedOOP = await OOP.findByIdAndUpdate(
               id,
               {
                  $set: {
                     OOPstatus: status,
                     OOPApproved: true,
                     notes: notes
                  }
               },
               { new: true }
            );

            // Notify applicant
            await UserNotificationService.createOOPUserNotification({
               oop: updatedOOP,
               recipientId: updatedOOP.userId,
               type: 'OOP_READY_FOR_PAYMENT',
               remarks: 'Your OOP has been approved and is ready for payment, navigate to your application dashboard > Order of Payment > Awaiting Payment to proceed with payment.'
            });

            return updatedOOP;
         } catch (error) {
            console.error('Error approving OOP:', error);
            throw error;
         }
      },

      undoTechnicalStaffOOPApproval: async (_, { id }) => {
         try {
            const oop = await OOP.findById(id);
            if (!oop) throw new UserInputError('OOP not found');

            const updatedOOP = await OOP.findByIdAndUpdate(
               id,
               {
                  $set: {
                     OOPstatus: 'For Approval',
                     OOPApproved: false
                  }
               },
               { new: true }
            );

            return updatedOOP;
         } catch (error) {
            console.error('Error undoing technical staff OOP approval:', error);
            throw error;
         }
      },

      forwardOOPToTechnicalStaff: async (_, { id }) => {
         try {
            const oop = await OOP.findById(id);
            if (!oop) {
               throw new Error('OOP not found');
            }

            // Check for signature images instead of dates
            if (!oop.rpsSignatureImage || !oop.tsdSignatureImage) {
               throw new UserInputError('Both signatures are required');
            }

            // Generate tracking number if not exists
            if (!oop.tracking?.trackingNo) {
               const trackingNo = await generateTrackingNumber();
               oop.tracking = {
                  ...oop.tracking,
                  trackingNo
               };
            }

            // Update OOP status and signatures
            const updatedOOP = await OOP.findByIdAndUpdate(
               id,
               {
                  $set: {
                     OOPstatus: 'For Approval',
                     OOPSignedByTwoSignatories: true,
                     'signatures.chiefRPS': new Date(),      // Set signature dates when forwarding
                     'signatures.technicalServices': new Date(),
                     tracking: oop.tracking  // Include the tracking info in the update
                  }
               },
               { new: true }
            );

            // Notify user
            await UserNotificationService.createOOPUserNotification({
               oop: updatedOOP,
               recipientId: updatedOOP.userId,
               type: 'OOP_FORWARDED_TO_ACCOUNTANT',
               remarks: 'Your Order of Payment has been forwarded to the Accountant for approval.'
            });

            // Notify Accountant
            const accountant = await Admin.findOne({ roles: 'Accountant' });
            if (accountant) {
               await PersonnelNotificationService.createOOPPersonnelNotification({
                  oop: updatedOOP,
                  recipientId: accountant._id,
                  type: 'OOP_PENDING_APPROVAL',
                  OOPStatus: 'For Approval',
                  remarks: 'New Order of Payment awaiting your approval.',
                  priority: 'high'
               });
            }

            return updatedOOP;
         } catch (error) {
            console.error('Error forwarding OOP:', error);
            throw error;
         }
      },

      undoOOPCreation: async (_, { id }, { user }) => {
         try {
            // Find the permit by applicationId
            const permit = await Permit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Update permit flags
            permit.awaitingOOP = true;
            permit.OOPCreated = false;

            // permit.history.push({
            //    stage: permit.currentStage,
            //    status: permit.status,
            //    timestamp: new Date(),
            //    notes: 'OOP creation undone by Chief RPS',
            //    actionBy: user.id
            // });

            await permit.save();

            return permit;
         } catch (error) {
            console.error('Error undoing OOP creation:', error);
            throw error;
         }
      },
      undoApproval: async (_, { paymentId }) => {
         try {
            const oop = await OOP.findById(paymentId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            const updatedOOP = await OOP.findByIdAndUpdate(
               paymentId,
               { OOPstatus: 'Payment Proof Submitted' },
               { new: true } // This ensures we get the updated document
            );

            return updatedOOP;
         } catch (error) {
            console.error('Error undoing approval:', error);
            throw error;
         }
      },

      generateOR: async (_, { Id, input }, context) => {
         try {
            const oop = await OOP.findById(Id);
            if (!oop) throw new UserInputError('OOP not found');

            if (oop.OOPstatus !== 'Completed OOP') {
               throw new Error('Cannot generate OR: Payment not yet completed');
            }

            const updatedOOP = await OOP.findByIdAndUpdate(
               Id,
               {
                  $set: {
                     officialReceipt: {
                        ...input,
                        dateIssued: new Date(),
                        issuedBy: context.user?._id
                     },
                     OOPstatus: 'Issued OR'
                  }
               },
               { new: true }
            );

            // Notify applicant
            await UserNotificationService.createOOPUserNotification({
               oop: updatedOOP,
               recipientId: updatedOOP.userId,
               type: 'OR_ISSUED',
               remarks: 'Official Receipt has been generated for your payment, '
            });

            return updatedOOP;
         } catch (error) {
            console.error('Error generating OR:', error);
            throw error;
         }
      },

      sendORToApplicant: async (_, { oopId }) => {
         try {
            const oop = await OOP.findById(oopId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            if (!oop.officialReceipt) {
               throw new Error('No official receipt generated for this OOP');
            }

            // Update OOP status to indicate OR has been sent
            const updatedOOP = await OOP.findByIdAndUpdate(
               oopId,
               { OOPstatus: 'Issued OR' },
               { new: true }
            );

            return updatedOOP;
         } catch (error) {
            console.error('Error sending OR to applicant:', error);
            throw error;
         }
      },

      deleteOOP: async (_, { applicationId }) => {
         try {
            // First, find the permit to get the application number
            const permit = await Permit.findById(applicationId);
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Find and delete the OOP using applicationId
            const deletedOOP = await OOP.findOneAndDelete({ applicationId });
            if (!deletedOOP) {
               throw new Error('OOP not found');
            }

            // Update the permit status
            await Permit.findByIdAndUpdate(
               applicationId,
               {
                  $set: {
                     OOPCreated: false,
                     awaitingOOP: true
                  }
               }
            );

            return deletedOOP;
         } catch (error) {
            console.error('Error deleting OOP:', error);
            throw new Error(`Failed to delete OOP: ${error.message}`);
         }
      },

      updateOOPTracking: async (_, { id, tracking }) => {
         try {
            const oop = await OOP.findById(id);
            if (!oop) {
               throw new Error('OOP not found');
            }

            // Generate tracking number if not exists
            if (!oop.trackingNo) {
               tracking.trackingNo = await generateTrackingNumber();
            }

            const updatedOOP = await OOP.findByIdAndUpdate(
               id,
               {
                  $set: {
                     receivedDate: tracking.receivedDate,
                     receivedTime: tracking.receivedTime,
                     trackingNo: tracking.trackingNo,
                     releasedDate: tracking.releasedDate,
                     releasedTime: tracking.releasedTime
                  }
               },
               { new: true }
            );

            return updatedOOP;
         } catch (error) {
            console.error('Error updating OOP tracking:', error);
            throw error;
         }
      },

      reviewPaymentProof: async (_, { oopId, status, notes }) => {
         try {
            const oop = await OOP.findById(oopId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            // Update payment proof status and OOP status
            const updatedOOP = await OOP.findByIdAndUpdate(
               oopId,
               {
                  $set: {
                     'paymentProof.status': status,
                     OOPstatus: status === 'APPROVED' ? 'Completed OOP' : 'Payment Proof Rejected',
                     notes: notes
                  }
               },
               { new: true }
            );

            // Notify applicant of payment proof status
            await UserNotificationService.createOOPUserNotification({
               oop: updatedOOP,
               recipientId: updatedOOP.userId,
               type: status === 'APPROVED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
               remarks: notes
            });

            return updatedOOP;
         } catch (error) {
            throw new Error(`Failed to review payment proof: ${error.message}`);
         }
      },

      submitPaymentProof: async (_, { oopId, paymentProof }) => {
         try {
            const oop = await OOP.findById(oopId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            const updatedOOP = await OOP.findByIdAndUpdate(
               oopId,
               {
                  $set: {
                     paymentProof: {
                        ...paymentProof,
                        timestamp: new Date(),
                        status: 'SUBMITTED'
                     },
                     OOPstatus: 'Payment Proof Submitted'
                     // awaitingPaymentProofApproval: true
                  }
               },
               { new: true }
            );

            // Notify Bill Collector
            const billCollector = await Admin.findOne({ roles: 'Bill_Collector' });
            if (billCollector) {
               await PersonnelNotificationService.createOOPPersonnelNotification({
                  oop: updatedOOP,
                  recipientId: billCollector._id,
                  type: 'PAYMENT_PROOF_SUBMITTED',
                  OOPStatus: 'Payment Proof Submitted',
                  remarks: 'New payment proof requires verification',
                  priority: 'high'
               });
            }

            // Notify user that their payment proof was submitted
            await UserNotificationService.createOOPUserNotification({
               oop: updatedOOP,
               recipientId: updatedOOP.userId,
               type: 'PAYMENT_PROOF_SUBMITTED',
               remarks: 'Your payment proof has been submitted and is pending verification'
            });

            return updatedOOP;
         } catch (error) {
            throw new Error(`Failed to submit payment proof: ${error.message}`);
         }
      },

      undoPaymentProof: async (_, { oopId }) => {
         try {
            const oop = await OOP.findById(oopId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            // Reset the payment proof and status
            const updatedOOP = await OOP.findByIdAndUpdate(
               oopId,
               {
                  $set: {
                     OOPstatus: 'Awaiting Payment',
                     paymentProof: null
                  }
               },
               { new: true }
            );

            return updatedOOP;
         } catch (error) {
            throw new Error(`Failed to undo payment proof: ${error.message}`);
         }
      }
   }
};

module.exports = oopResolvers;
