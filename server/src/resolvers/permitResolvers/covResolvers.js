const COVPermit = require('../../models/permits/COVPermit');
const { COV_CustomId } = require('../../utils/customIdGenerator');

const covResolvers = {
   Query: {
      getAllCOVPermits: async () => {
         return await COVPermit.find();
      },
      getCOVPermitById: async (_, { id }) => {
         return await COVPermit.findById(id);
      },
   },
   Mutation: {
      createCOVPermit: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to create a permit');
         }

         try {
            const customId = await COV_CustomId();
            const applicationNumber = `COV-${Date.now()}`; // Generate a unique application number
            const permitData = {
               ...input,
               customId,
               applicantId: user.id, // Use the user's ID as the applicantId
               applicationNumber,
               userId: user.id,
               status: input.status || 'Pending',
               dateOfSubmission: input.dateOfSubmission || new Date().toISOString(),
            };

            const newPermit = new COVPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error creating COV permit:', error);
            throw new Error(`Failed to create COV permit: ${error.message}`);
         }
      },
      updateCOVPermit: async (_, { id, input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to update a permit');
         }

         const permit = await COVPermit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         if (permit.userId.toString() !== user.id && user.role !== 'admin') {
            throw new Error('You are not authorized to update this permit');
         }

         Object.assign(permit, input);
         return await permit.save();
      },
      saveCOVPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const customId = await COV_CustomId();
            const permitData = {
               ...input,
               customId,
               userId: user.id,
               status: 'Draft',
            };

            const newPermit = new COVPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error saving COV permit draft:', error);
            throw new Error(`Failed to save COV permit draft: ${error.message}`);
         }
      },
   },
};

module.exports = covResolvers;
