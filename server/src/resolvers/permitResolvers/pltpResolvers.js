const PLTPPermit = require('../../models/permits/PLTPPermit');
const { PLTP_ApplicationNumber } = require('../../utils/customIdGenerator');

const pltpResolvers = {
  Query: {
    getAllPLTPPermits: async () => {
      return await PLTPPermit.find();
    },
    getPLTPPermitById: async (_, { id }) => {
      return await PLTPPermit.findById(id);
    },
  },
  Mutation: {
    createPLTPPermit: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('You must be logged in to create a permit');
      }

      try {
        const applicationNumber = await PLTP_ApplicationNumber();
        const permitData = {
          ...input,
          applicationNumber,
          applicantId: user.id,
          status: input.status || 'Pending',
          dateOfSubmission: input.dateOfSubmission || new Date().toISOString(),
        };

        const newPermit = new PLTPPermit(permitData);
        const savedPermit = await newPermit.save();
        return savedPermit;
      } catch (error) {
        console.error('Error creating PLTP permit:', error);
        throw new Error(`Failed to create PLTP permit: ${error.message}`);
      }
    },
    updatePLTPPermit: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new Error('You must be logged in to update a permit');
      }

      const permit = await PLTPPermit.findById(id);
      if (!permit) {
        throw new Error('Permit not found');
      }

      if (permit.applicantId.toString() !== user.id && user.role !== 'admin') {
        throw new Error('You are not authorized to update this permit');
      }

      Object.assign(permit, input);
      return await permit.save();
    },
    savePLTPPermitDraft: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('You must be logged in to save a draft');
      }

      try {
        const applicationNumber = await PLTP_ApplicationNumber();
        const permitData = {
          ...input,
          applicationNumber,
          applicantId: user.id,
          status: 'Draft',
        };

        const newPermit = new PLTPPermit(permitData);
        const savedPermit = await newPermit.save();
        return savedPermit;
      } catch (error) {
        console.error('Error saving PLTP permit draft:', error);
        throw new Error(`Failed to save PLTP permit draft: ${error.message}`);
      }
    },
  },
};

module.exports = pltpResolvers;
