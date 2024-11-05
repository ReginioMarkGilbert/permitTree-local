const OOP = require('../models/OOP');
const Permit = require('../models/permits/Permit');
const { UserInputError } = require('apollo-server-express');
const { generateBillNo } = require('../utils/billNumberGenerator');

const oopResolvers = {
  Query: {
    getOOPs: async () => {
      return await OOP.find();
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
      const oop = await OOP.findById(id);
      if (!oop) throw new UserInputError('OOP not found');

      const updateField = signatureType === 'rps' ? 'rpsSignatureImage' : 'tsdSignatureImage';
      const signatureDate = signatureType === 'rps' ? 'signatures.chiefRPS' : 'signatures.technicalServices';

      const update = {
        [updateField]: signatureImage,
        [signatureDate]: new Date()
      };

      return await OOP.findByIdAndUpdate(id, { $set: update }, { new: true });
    },

    approveOOP: async (_, { id }) => {
      const oop = await OOP.findById(id);
      if (!oop) throw new UserInputError('OOP not found');

      // Check if both signatures are present
      if (!oop.signatures.chiefRPS || !oop.signatures.technicalServices) {
        throw new UserInputError('Both signatures are required for approval');
      }

      oop.OOPstatus = 'Approved';
      await oop.save();

      return oop;
    }
  }
};

module.exports = oopResolvers;
