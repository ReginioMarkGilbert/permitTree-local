const PLTCPPermit = require('../../models/permits/PLTCPPermit');
const { PLTCP_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');
const Admin = require('../../models/admin');
const PersonnelNotificationService = require('../../services/personnelNotificationService');

const pltcpResolvers = {
   Query: {
      getAllPLTCPPermits: async () => {
         const permits = await PLTCPPermit.find().lean().exec();
         return permits.map(permit => ({
            ...permit,
            id: permit._id.toString(),
            dateOfSubmission: permit.dateOfSubmission.toISOString()
         }));
      },
      getPLTCPPermitById: async (_, { id }) => {
         try {
            const permit = await PLTCPPermit.findById(id).lean().exec();
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Convert Buffer data to base64 string for files
            const processedFiles = {};
            if (permit.files) {
               for (const [key, files] of Object.entries(permit.files)) {
                  if (Array.isArray(files)) {
                     processedFiles[key] = files.map(file => ({
                        ...file,
                        data: file.data.toString('base64')
                     }));
                  }
               }
            }

            return {
               ...permit,
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.toISOString(),
               files: processedFiles
            };
         } catch (error) {
            console.error('Error fetching PLTCP permit:', error);
            throw new Error(`Failed to fetch PLTCP permit: ${error.message}`);
         }
      },
   },
   Mutation: {
      createPLTCPPermit: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to create a permit');
         }

         try {
            const applicationNumber = await PLTCP_ApplicationNumber();

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
               applicationType: 'Public Land Tree Cutting Permit',
               status: 'Submitted',
               currentStage: 'TechnicalStaffReview',
               dateOfSubmission: new Date(),
               files: processedFiles,
            };

            const newPermit = new PLTCPPermit(permitData);
            const savedPermit = await newPermit.save();

            const technicalStaff = await Admin.findOne({ roles: 'Technical_Staff' });
            if (technicalStaff) {
               await PersonnelNotificationService.createApplicationPersonnelNotification({
                  application: savedPermit,
                  recipientId: technicalStaff._id,
                  type: 'PENDING_TECHNICAL_REVIEW',
                  stage: 'TechnicalStaffReview',
                  priority: 'high'
               });
            }

            return {
               ...savedPermit.toObject(),
               id: savedPermit._id.toString(),
               dateOfSubmission: savedPermit.dateOfSubmission.toISOString()
            };
         } catch (error) {
            console.error('Error creating PLTCP permit:', error);
            throw new Error(`Failed to create PLTCP permit: ${error.message}`);
         }
      },
      updatePLTCPPermit: async (_, { id, input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to update a permit');
         }

         try {
            const permit = await PLTCPPermit.findById(id);
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
            console.error('Error updating PLTCP permit:', error);
            throw new Error(`Failed to update PLTCP permit: ${error.message}`);
         }
      },
      savePLTCPPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const applicationNumber = await PLTCP_ApplicationNumber();

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
               applicationType: 'Public Land Tree Cutting Permit',
               status: 'Draft',
               currentStage: 'Draft',
               dateOfSubmission: new Date(),
               files: processedFiles,
            };

            const newPermit = new PLTCPPermit(permitData);
            const savedPermit = await newPermit.save();
            return {
               ...savedPermit.toObject(),
               id: savedPermit._id.toString(),
               dateOfSubmission: savedPermit.dateOfSubmission.toISOString()
            };
         } catch (error) {
            console.error('Error saving PLTCP permit draft:', error);
            throw new Error(`Failed to save PLTCP permit draft: ${error.message}`);
         }
      },
   },
};

module.exports = pltcpResolvers;
