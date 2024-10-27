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
               applicationType: 'Certificate of Verification',
               status: 'Submitted',
               dateOfSubmission: new Date(),
               files: processedFiles,
               currentStage: 'Submitted',
               // recordedByReceivingClerk: false, // Initialize to false
               // reviewedByChief: false, // Initialize to false
               // acceptedByTechnicalStaff: false // Initialize to false
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

         // Ensure currentStage is not overwritten if it's not provided in the input
         if (input.currentStage) {
            permit.currentStage = input.currentStage;
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
