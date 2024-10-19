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

         // Update only the fields that are provided in the input
         Object.keys(input).forEach(key => {
            if (input[key] !== undefined) {
               permit[key] = input[key];
            }
         });

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
                     // We don't save the actual file data for drafts
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
