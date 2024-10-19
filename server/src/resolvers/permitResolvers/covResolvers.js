const COVPermit = require('../../models/permits/COVPermit');
const { COV_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');

const covResolvers = {
   Query: {
      getAllCOVPermits: async () => {
         const permits = await COVPermit.find().lean().exec();
         return permits.map(permit => ({
            ...permit,
            id: permit._id.toString()
         }));
      },
      getCOVPermitById: async (_, { id }) => {
         const permit = await COVPermit.findById(id).lean().exec();
         return permit ? {
            ...permit,
            id: permit._id.toString()
         } : null;
      },
      getCOVPermitWithFiles: async (_, { id }) => {
         const permit = await COVPermit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }
         // Convert Buffer to Base64 string for each file
         const filesWithBase64 = {};
         for (const [key, files] of Object.entries(permit.files)) {
            filesWithBase64[key] = files.map(file => ({
               ...file.toObject(),
               buffer: file.buffer.toString('base64')
            }));
         }
         return {
            ...permit.toObject(),
            files: filesWithBase64
         };
      },
   },
   Mutation: {
      createCOVPermit: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to create a permit');
         }

         try {
            const applicationNumber = await COV_ApplicationNumber();

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
               applicationType: 'Certificate of Verification', // Set this internally
               status: 'Submitted',
               dateOfSubmission: new Date(),
               files: processedFiles,
            };

            const newPermit = new COVPermit(permitData);
            const savedPermit = await newPermit.save();
            const plainPermit = savedPermit.toObject();
            return {
               ...plainPermit,
               id: plainPermit._id.toString()
            };
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
            const updatedFiles = {};
            Object.keys(input.files).forEach(fileType => {
               if (Array.isArray(input.files[fileType]) && input.files[fileType].length > 0) {
                  updatedFiles[fileType] = input.files[fileType].map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: file.data ? Binary.createFromBase64(file.data) : undefined
                  }));
               }
            });
            permit.files = updatedFiles;
         }

         // Ensure the files field is marked as modified
         permit.markModified('files');

         await permit.save();

         return permit;
      },
      saveCOVPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const applicationNumber = await COV_ApplicationNumber();

            // Process file inputs
            const processedFiles = {};
            for (const [key, files] of Object.entries(input.files)) {
               if (files && files.length > 0) {
                  processedFiles[key] = files.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType || 'application/octet-stream', // Provide a default value if null
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
               applicationType: 'Certificate of Verification',
               status: 'Draft',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
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
