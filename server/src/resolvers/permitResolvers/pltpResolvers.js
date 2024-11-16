const PLTPPermit = require('../../models/permits/PLTPPermit');
const { PLTP_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');
const Admin = require('../../models/admin');
const PersonnelNotificationService = require('../../services/personnelNotificationService');

const pltpResolvers = {
   Query: {
      getAllPLTPPermits: async () => {
         return await PLTPPermit.find();
      },
      getPLTPPermitById: async (_, { id }) => {
         return await PLTPPermit.findById(id);
      },
   },
   Mutation: {
      createPLTPPermit: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to create a permit');
         }

         try {
            const applicationNumber = await PLTP_ApplicationNumber();

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
               applicationType: 'Private Land Timber Permit',
               status: 'Submitted',
               currentStage: 'TechnicalStaffReview',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
            };

            const newPermit = new PLTPPermit(permitData);
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
               id: savedPermit._id.toString()
            };
         } catch (error) {
            console.error('Error creating PLTP permit:', error);
            throw new Error(`Failed to create PLTP permit: ${error.message}`);
         }
      },
      updatePLTPPermit: async (_, { id, input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to update a permit');
         }

         const permit = await PLTPPermit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         if (permit.applicantId.toString() !== user.id && user.role !== 'admin') {
            throw new Error('You are not authorized to update this permit');
         }

         Object.assign(permit, input);
         return await permit.save();
      },
      savePLTPPermitDraft: async (_, { input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save a draft');
         }

         try {
            const applicationNumber = await PLTP_ApplicationNumber();

            // Process file inputs
            const processedFiles = {};
            for (const [key, files] of Object.entries(input.files)) {
               if (files && files.length > 0) {
                  processedFiles[key] = files.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType || 'application/octet-stream',
                     data: file.data ? Binary.createFromBase64(file.data) : undefined
                  }));
               } else {
                  processedFiles[key] = [];
               }
            }

            const permitData = {
               ...input,
               applicationNumber,
               applicantId: user.id,
               applicationType: 'Private Land Timber Permit',
               status: 'Draft',
               currentStage: 'Draft',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
            };

            const newPermit = new PLTPPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error saving PLTP permit draft:', error);
            throw new Error(`Failed to save PLTP permit draft: ${error.message}`);
         }
      },
   },
};

module.exports = pltpResolvers;
