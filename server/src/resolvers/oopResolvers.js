const { OOP } = require('../models/OOP');
const Permit = require('../models/permits/Permit');
const { UserInputError } = require('apollo-server-express');
const { generateBillNo } = require('../utils/billNumberGenerator');
const { generateTrackingNumber } = require('../utils/trackingNumberGenerator');

const oopResolvers = {
   Query: {
      getOOPs: async () => {
         try {
            const oops = await OOP.find().sort({ createdAt: -1 });
            return oops.map(oop => ({
               ...oop._doc,
               totalAmount: oop.items.reduce((sum, item) => sum + item.amount, 0)
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

      getApplicationsAwaitingOOP: async () => {
         return await Permit.find({ status: 'AwaitingOOP' });
      },

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
      }
   },

   Mutation: {
      createOOP: async (_, { input }) => {
         try {
            // First, get the permit to find the applicantId
            const permit = await Permit.findOne({ applicationNumber: input.applicationId });
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Generate billNo
            const billNo = await generateBillNo();

            // Calculate total amount
            const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0);

            // Generate tracking number
            const trackingNo = await generateTrackingNumber();
            console.log('Generated tracking number:', trackingNo); // Debug log

            const oop = new OOP({
               ...input,
               userId: permit.applicantId, // Use the applicantId from the permit
               billNo,
               totalAmount,
               OOPstatus: 'Pending Signature',
               tracking: {
                  trackingNo,
                  receivedDate: new Date(),
                  receivedTime: new Date().toLocaleTimeString()
               }
            });

            console.log('OOP before save:', oop); // Debug log
            await oop.save();
            console.log('OOP after save:', oop); // Debug log

            // Update permit status
            await Permit.findOneAndUpdate(
               { applicationNumber: input.applicationId },
               {
                  $set: {
                     OOPCreated: true,
                     awaitingOOP: false
                  }
               }
            );

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

            return updatedOOP;
         } catch (error) {
            console.error('Error updating OOP signature:', error);
            throw new Error(`Failed to update signature: ${error.message}`);
         }
      },

      approveOOP: async (_, { id, notes, status }) => {
         try {
            const oop = await OOP.findById(id);
            if (!oop) throw new UserInputError('OOP not found');

            if (!oop.OOPSignedByTwoSignatories) {
               throw new UserInputError('OOP must be signed by both signatories before approval');
            }

            const updatedOOP = await OOP.findByIdAndUpdate(
               id,
               {
                  $set: {
                     OOPstatus: status,
                     OOPApproved: status === 'Approved',
                     notes: notes
                  }
               },
               { new: true }
            );

            return updatedOOP;
         } catch (error) {
            console.error('Error approving OOP:', error);
            throw new Error(`Failed to approve OOP: ${error.message}`);
         }
      },

      forwardOOPToAccountant: async (_, { id }) => {
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

            // Add to history
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
            if (!oop) {
               throw new UserInputError('OOP not found');
            }

            if (oop.OOPstatus !== 'Completed OOP') {
               throw new Error('Cannot generate OR: Payment not yet completed');
            }

            // Create receipt data with or without issuedBy
            const receiptData = {
               ...input,
               dateIssued: new Date(),
            };

            // Only add issuedBy if user context exists
            if (context && context.user && context.user._id) {
               receiptData.issuedBy = context.user._id;
            }

            // Update OOP with official receipt details
            const updatedOOP = await OOP.findByIdAndUpdate(
               Id,
               {
                  $set: {
                     officialReceipt: receiptData,
                     OOPstatus: 'Issued OR'
                  }
               },
               { new: true }
            );

            if (!updatedOOP) {
               throw new UserInputError('Failed to update OOP');
            }

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
            // First, find and delete the OOP
            const deletedOOP = await OOP.findOneAndDelete({ applicationId });
            if (!deletedOOP) {
               throw new Error('OOP not found');
            }

            // Then, update the permit to reset OOP-related flags
            await Permit.findOneAndUpdate(
               { applicationNumber: applicationId },
               {
                  $set: {
                     OOPCreated: false,
                     awaitingOOP: true // Reset to awaiting OOP state
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
      }
   }
};

module.exports = oopResolvers;
