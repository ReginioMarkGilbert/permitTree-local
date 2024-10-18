const SPLTPPermit = require('../../models/permits/SPLTPPermit');
const { SPLTP_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');

const spltpResolvers = {
   Query: {
      getAllSPLTPPermits: async () => {
         return await SPLTPPermit.find();
      },
      getSPLTPPermitById: async (_, { id }) => {
         return await SPLTPPermit.findById(id);
      },
   },
   Mutation: {
      createSPLTPPermit: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to create a permit');
         }

         try {
            const applicationNumber = await SPLTP_ApplicationNumber();

            // Process file inputs
            const processedFiles = {};
            for (const [key, files] of Object.entries(input.files)) {
               if (files && files.length > 0) {
                  processedFiles[key] = files.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: Binary.createFromBase64(file.data)
                  }));
               } else {
                  processedFiles[key] = [];
               }
            }

            const permitData = {
               ...input,
               applicationNumber,
               applicantId: user.id,
               applicationType: 'Special/Private Land Timber Permit',
               status: 'Pending',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
            };

            const newPermit = new SPLTPPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error creating SPLTP permit:', error);
            throw new Error(`Failed to create SPLTP permit: ${error.message}`);
         }
      },
      updateSPLTPPermit: async (_, { id, input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to update a permit');
         }

         const permit = await SPLTPPermit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         if (permit.applicantId.toString() !== user.id && user.role !== 'admin') {
            throw new Error('You are not authorized to update this permit');
         }

         Object.assign(permit, input);
         return await permit.save();
      },
      saveSPLTPPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const applicationNumber = await SPLTP_ApplicationNumber();
            const permitData = {
               ...input,
               applicationNumber,
               applicantId: user.id,
               status: 'Draft',
            };

            const newPermit = new SPLTPPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error saving SPLTP permit draft:', error);
            throw new Error(`Failed to save SPLTP permit draft: ${error.message}`);
         }
      },
   },
};

module.exports = spltpResolvers;
