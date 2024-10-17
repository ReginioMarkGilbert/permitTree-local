const PTPRPermit = require('../../models/permits/PTPRPermit');
const { PTPR_ApplicationNumber } = require('../../utils/customIdGenerator');

const ptprResolvers = {
   Query: {
      getAllPTPRPermits: async () => {
         return await PTPRPermit.find();
      },
      getPTPRPermitById: async (_, { id }) => {
         return await PTPRPermit.findById(id);
      },
   },
   Mutation: {
      createPTPRPermit: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to create a permit');
         }

         try {
            const applicationNumber = await PTPR_ApplicationNumber();
            const permitData = {
               ...input,
               applicationNumber,
               applicantId: user.id,
               status: input.status || 'Pending',
               dateOfSubmission: input.dateOfSubmission || new Date().toISOString(),
            };

            const newPermit = new PTPRPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error creating PTPR permit:', error);
            throw new Error(`Failed to create PTPR permit: ${error.message}`);
         }
      },
      updatePTPRPermit: async (_, { id, input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to update a permit');
         }

         const permit = await PTPRPermit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         if (permit.applicantId.toString() !== user.id && user.role !== 'admin') {
            throw new Error('You are not authorized to update this permit');
         }

         Object.assign(permit, input);
         return await permit.save();
      },
      savePTPRPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const applicationNumber = await PTPR_ApplicationNumber();
            const permitData = {
               ...input,
               applicationNumber,
               applicantId: user.id,
               status: 'Draft',
            };

            const newPermit = new PTPRPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error saving PTPR permit draft:', error);
            throw new Error(`Failed to save PTPR permit draft: ${error.message}`);
         }
      },
   },
};

module.exports = ptprResolvers;
