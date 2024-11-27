const PTPRPermit = require('../../models/permits/PTPRPermit');
const { PTPR_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');
const Admin = require('../../models/admin');
const PersonnelNotificationService = require('../../services/personnelNotificationService');

const ptprResolvers = {
   Query: {
      getAllPTPRPermits: async () => {
         const permits = await PTPRPermit.find().lean().exec();
         return permits.map(permit => ({
            ...permit,
            id: permit._id.toString()
         }));
      },
      getPTPRPermitById: async (_, { id }) => {
         try {
            const permit = await PTPRPermit.findById(id).lean().exec();
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
               files: processedFiles
            };
         } catch (error) {
            console.error('Error fetching PTPR permit:', error);
            throw new Error(`Failed to fetch PTPR permit: ${error.message}`);
         }
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
               currentStage: 'TechnicalStaffReview',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
            };

            const newPermit = new PTPRPermit(permitData);
            const savedPermit = await newPermit.save();

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

         try {
            const permit = await PTPRPermit.findById(id);
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
            console.error('Error updating PTPR permit:', error);
            throw new Error(`Failed to update PTPR permit: ${error.message}`);
         }
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
               currentStage: 'Draft',
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
