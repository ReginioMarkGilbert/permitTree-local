const COVPermit = require('../../models/permits/COVPermit');
const { COV_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');
const PersonnelNotificationService = require('../../services/personnelNotificationService');
const Admin = require('../../models/admin');

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
      createCOVPermit: async (_, { input }, { user, notes }) => {
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
               currentStage: 'TechnicalStaffReview',
               dateOfSubmission: new Date(),
               files: processedFiles,
            };

            const newPermit = new COVPermit(permitData);
            const savedPermit = await newPermit.save(); // Save the permit to get the _id
            const plainPermit = savedPermit.toObject(); // Convert to plain object

            const technicalStaff = await Admin.findOne({ roles: 'Technical_Staff' });
            if (technicalStaff) {
               await PersonnelNotificationService.createApplicationPersonnelNotification({
                  application: savedPermit,
                  recipientId: technicalStaff._id,
                  type: 'PENDING_TECHNICAL_REVIEW',
                  stage: 'TechnicalStaffReview',
                  // remarks: notes,
                  priority: 'high'
               });
            }

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

         try {
            const permit = await COVPermit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Update non-file fields
            Object.keys(input).forEach(key => {
               if (key !== 'files' && input[key] !== undefined) {
                  permit[key] = input[key];
               }
            });

            // Handle file updates
            if (input.files) {
               const updatedFiles = { ...permit.files };

               for (const [fileType, newFiles] of Object.entries(input.files)) {
                  if (Array.isArray(newFiles)) {
                     // If newFiles array is empty, it means all files of this type were removed
                     if (newFiles.length === 0) {
                        updatedFiles[fileType] = [];
                        continue;
                     }

                     // Get existing files
                     const existingFiles = permit.files[fileType] || [];

                     // Process new files
                     const processedNewFiles = newFiles
                        .filter(file => file.data) // Only process files that have new data
                        .map(file => ({
                           filename: file.filename,
                           contentType: file.contentType,
                           data: Binary.createFromBase64(file.data)
                        }));

                     // If there are new files, replace all existing files of this type
                     if (processedNewFiles.length > 0) {
                        updatedFiles[fileType] = processedNewFiles;
                     }
                  }
               }

               permit.files = updatedFiles;
               permit.markModified('files');
            }

            await permit.save();
            return permit;
         } catch (error) {
            console.error('Error updating COV permit:', error);
            throw new Error(`Failed to update COV permit: ${error.message}`);
         }
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
                     contentType: file.contentType || 'application/octet-stream',
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
               currentStage: 'Submitted',
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
