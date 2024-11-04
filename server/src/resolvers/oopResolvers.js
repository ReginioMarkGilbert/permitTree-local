const OOP = require('../models/OOP');
const Permit = require('../models/permits/Permit');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const oopResolvers = {
  Query: {
    getOOPs: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await OOP.find();
    },

    getOOPById: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await OOP.findById(id);
    },

    getOOPsByApplicationId: async (_, { applicationId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await OOP.find({ applicationId });
    },

    getApplicationsAwaitingOOP: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await Permit.find({ status: 'AwaitingOOP' });
    }
  },

  Mutation: {
    createOOP: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const allowedRoles = ['Chief_RPS', 'Accountant', 'PENR_CENR_Officer'];
      if (!user.roles.some(role => allowedRoles.includes(role))) {
        throw new AuthenticationError('Not authorized to create OOP');
      }

      // Calculate total amount
      const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0);

      const oop = new OOP({
        ...input,
        totalAmount,
        status: 'Pending'
      });

      await oop.save();

      // Update permit status
      await Permit.findOneAndUpdate(
        { customId: input.applicationId },
        { $set: { status: 'OOPCreated' }}
      );

      return oop;
    },

    updateOOPSignature: async (_, { id, signatureType, signatureImage }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const oop = await OOP.findById(id);
      if (!oop) throw new UserInputError('OOP not found');

      if (signatureType === 'rps' && !user.roles.includes('Chief_RPS')) {
        throw new AuthenticationError('Not authorized to add RPS signature');
      }

      if (signatureType === 'tsd' && !user.roles.includes('Chief_TSD')) {
        throw new AuthenticationError('Not authorized to add TSD signature');
      }

      const updateField = signatureType === 'rps' ? 'rpsSignatureImage' : 'tsdSignatureImage';
      const signatureDate = signatureType === 'rps' ? 'signatures.chiefRPS' : 'signatures.technicalServices';

      const update = {
        [updateField]: signatureImage,
        [signatureDate]: new Date()
      };

      return await OOP.findByIdAndUpdate(id, { $set: update }, { new: true });
    },

    approveOOP: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const oop = await OOP.findById(id);
      if (!oop) throw new UserInputError('OOP not found');

      // Check if both signatures are present
      if (!oop.signatures.chiefRPS || !oop.signatures.technicalServices) {
        throw new UserInputError('Both signatures are required for approval');
      }

      oop.status = 'Approved';
      await oop.save();

      return oop;
    }
  }
};

module.exports = oopResolvers;
