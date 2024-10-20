const CSAWPermit = require('../../models/permits/CSAWPermit');
const { CSAW_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');

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
         if (!user) {
            throw new Error('You must be logged in to create a permit');
         }

         try {
            const applicationNumber = await CSAW_ApplicationNumber();

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
               applicationType: 'Chainsaw Registration',
               status: 'Submitted',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
               dateOfAcquisition: new Date(input.dateOfAcquisition).toISOString(),
            };

            const newPermit = new CSAWPermit(permitData);
            const savedPermit = await newPermit.save();
            return {
               ...savedPermit.toObject(),
               id: savedPermit._id.toString()
            };
         } catch (error) {
            console.error('Error creating CSAW permit:', error);
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

         if (input.dateOfAcquisition) {
            input.dateOfAcquisition = new Date(input.dateOfAcquisition).toISOString();
         }

         await permit.save();

         return permit;
      },
      saveCSAWPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const applicationNumber = await CSAW_ApplicationNumber();

            // Process file inputs
            const processedFiles = {};
            for (const [key, files] of Object.entries(input.files || {})) {
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
               applicationType: 'Chainsaw Registration',
               status: 'Draft',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
               dateOfAcquisition: new Date().toISOString(),
               // dateOfAcquisition: input.dateOfAcquisition ? new Date(input.dateOfAcquisition).toISOString() : null,
            };

            const newPermit = new CSAWPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error saving CSAW permit draft:', error);
            throw new Error(`Failed to save CSAW permit draft: ${error.message}`);
         }
      },
   },
};

module.exports = csawResolvers;
