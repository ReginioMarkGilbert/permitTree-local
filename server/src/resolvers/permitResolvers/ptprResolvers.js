const PTPRPermit = require('../../models/permits/PTPRPermit');
const { PTPR_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');

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
               applicationType: 'Private Tree Plantation Registration',
               status: 'Submitted',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
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

         // Update non-file fields
         Object.keys(input).forEach(key => {
            if (key !== 'files' && input[key] !== undefined) {
               permit[key] = input[key];
            }
         });

         // Update files
         if (input.files) {
            const updatedFiles = { ...permit.files };  // Start with existing files
            Object.keys(input.files).forEach(fileType => {
               if (Array.isArray(input.files[fileType])) {
                  if (input.files[fileType].length > 0) {
                     updatedFiles[fileType] = input.files[fileType].map(file => ({
                        filename: file.filename,
                        contentType: file.contentType,
                        data: file.data ? Binary.createFromBase64(file.data) : undefined
                     }));
                  } else {
                     // If the array is empty, set it to an empty array instead of removing it
                     updatedFiles[fileType] = [];
                  }
               }
            });
            permit.files = updatedFiles;
         }

         // Ensure the files field is marked as modified
         permit.markModified('files');

         await permit.save();

         return permit;
      },
      savePTPRPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const applicationNumber = await PTPR_ApplicationNumber();

            // Process file inputs
            const processedFiles = {};
            for (const [key, files] of Object.entries(input.files)) {
               if (files && Array.isArray(files) && files.length > 0) {
                  processedFiles[key] = files.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: file.data ? Binary.createFromBase64(file.data) : null
                  }));
               } else {
                  processedFiles[key] = [];
               }
            }

            const permitData = {
               ...input,
               applicationNumber,
               applicantId: user.id,
               applicationType: 'Private Tree Plantation Registration',
               status: 'Draft',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
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
