const TCEBPPermit = require('../../models/permits/TCEBPPermit');
const { TCEBP_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');

const tcebpResolvers = {
   Query: {
      getAllTCEBPPermits: async () => {
         return await TCEBPPermit.find();
      },
      getTCEBPPermitById: async (_, { id }) => {
         return await TCEBPPermit.findById(id);
      },
   },
   Mutation: {
      createTCEBPPermit: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to create a permit');
         }

         try {
            const applicationNumber = await TCEBP_ApplicationNumber();

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
               applicationType: 'Tree Cutting and/or Earth Balling Permit',
               status: 'Submitted',
               currentStage: 'TechnicalStaffReview', // Ensure this is set
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
            };

            const newPermit = new TCEBPPermit(permitData);
            const savedPermit = await newPermit.save();
            return {
               ...savedPermit.toObject(),
               id: savedPermit._id.toString()
            };
         } catch (error) {
            console.error('Error creating TCEBP permit:', error);
            throw new Error(`Failed to create TCEBP permit: ${error.message}`);
         }
      },
      updateTCEBPPermit: async (_, { id, input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to update a permit');
         }

         const permit = await TCEBPPermit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         if (permit.applicantId.toString() !== user.id && user.role !== 'admin') {
            throw new Error('You are not authorized to update this permit');
         }

         // Process file inputs
         const processedFiles = {};
         for (const [key, files] of Object.entries(input.files)) {
            if (files && files.length > 0) {
               processedFiles[key] = files.map(file => ({
                  filename: file.filename,
                  contentType: file.contentType,
                  data: file.data ? Binary.createFromBase64(file.data) : undefined
               }));
            } else {
               processedFiles[key] = [];
            }
         }

         const updatedPermitData = {
            ...input,
            files: processedFiles,
         };

         Object.assign(permit, updatedPermitData);
         const updatedPermit = await permit.save();
         return {
            ...updatedPermit.toObject(),
            id: updatedPermit._id.toString()
         };
      },
      saveTCEBPPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const applicationNumber = await TCEBP_ApplicationNumber();

            // Process file inputs for draft (only metadata)
            const processedFiles = {};
            for (const [key, files] of Object.entries(input.files)) {
               if (files && files.length > 0) {
                  processedFiles[key] = files.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType
                  }));
               } else {
                  processedFiles[key] = [];
               }
            }

            const permitData = {
               ...input,
               applicationNumber,
               applicantId: user.id,
               applicationType: 'Tree Cutting and/or Earth Balling Permit',
               status: 'Draft',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
            };

            const newPermit = new TCEBPPermit(permitData);
            const savedPermit = await newPermit.save();
            return {
               ...savedPermit.toObject(),
               id: savedPermit._id.toString()
            };
         } catch (error) {
            console.error('Error saving TCEBP permit draft:', error);
            throw new Error(`Failed to save TCEBP permit draft: ${error.message}`);
         }
      },
   },
};

module.exports = tcebpResolvers;
