const OOP = require('../models/OOP');
const Permit = require('../models/permits/Permit');
const { UserInputError } = require('apollo-server-express');
const { generateBillNo } = require('../utils/billNumberGenerator');

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
    }
  },

  Mutation: {
    createOOP: async (_, { input }) => {
      try {
        // Generate billNo first
        const billNo = await generateBillNo();

        // Calculate total amount
        const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0);

        const oop = new OOP({
          ...input,
          billNo,
          totalAmount,
          OOPstatus: 'PendingSignature'
        });

        await oop.save();

        // Update permit status
        await Permit.findOneAndUpdate(
          { applicationNumber: input.applicationId },
          {
            $set: {
              // status: 'OOPCreated',
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
        if (!oop) throw new UserInputError('OOP not found');

        // Check for signature images instead of dates
        if (!oop.rpsSignatureImage || !oop.tsdSignatureImage) {
          throw new UserInputError('Both signatures are required');
        }

        const updatedOOP = await OOP.findByIdAndUpdate(
          id,
          {
            $set: {
              OOPstatus: 'For Approval',
              OOPSignedByTwoSignatories: true,
              'signatures.chiefRPS': new Date(),      // Set signature dates when forwarding
              'signatures.technicalServices': new Date()
            }
          },
          { new: true }
        );

        return updatedOOP;
      } catch (error) {
        console.error('Error forwarding OOP:', error);
        throw new Error(`Failed to forward OOP: ${error.message}`);
      }
    },
  }
};

module.exports = oopResolvers;
