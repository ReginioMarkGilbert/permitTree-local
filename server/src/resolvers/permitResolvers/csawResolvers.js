const CSAWPermit = require('../../models/permits/CSAWPermit');
const { CSAW_CustomId } = require('../../utils/customIdGenerator');

const csawResolvers = {
  Query: {
    getAllCSAWPermits: async () => {
      return await CSAWPermit.find();
    },
    getCSAWPermitById: async (_, { id }) => {
      return await CSAWPermit.findById(id);
    },
  },
  Mutation: {
    createCSAWPermit: async (_, { input }, { user }) => {
      console.log('Reached createCSAWPermit resolver');
      console.log('User:', JSON.stringify(user, null, 2));
      console.log('Input:', JSON.stringify(input, null, 2));

      if (!user) {
        console.log('User not authenticated');
        throw new Error('You must be logged in to create a permit');
      }

      try {
        const customId = await CSAW_CustomId();

        const permitData = {
          ...input,
          customId,
          userId: user.id,
          status: input.status || 'Pending',
        };

        console.log('Permit data to be saved:', JSON.stringify(permitData, null, 2));

        const newPermit = new CSAWPermit(permitData);

        // Validate the new permit
        const validationError = newPermit.validateSync();
        if (validationError) {
          console.error('Validation error:', JSON.stringify(validationError, null, 2));
          throw new Error(`Validation failed: ${Object.values(validationError.errors).map(e => e.message).join(', ')}`);
        }

        const savedPermit = await newPermit.save();
        console.log('Saved permit:', JSON.stringify(savedPermit, null, 2));
        return savedPermit;
      } catch (error) {
        console.error('Error creating CSAW permit:', error);
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => err.message);
          throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        throw new Error(`Failed to create CSAW permit: ${error.message}`);
      }
    },
    updateCSAWPermit: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new Error('You must be logged in to update a permit');
      }

      const permit = await CSAWPermit.findById(id);
      if (!permit) {
        throw new Error('Permit not found');
      }

      if (permit.userId.toString() !== user.id && user.role !== 'admin') {
        throw new Error('You are not authorized to update this permit');
      }

      Object.assign(permit, input);
      return await permit.save();
    },
  },
};

module.exports = csawResolvers;
