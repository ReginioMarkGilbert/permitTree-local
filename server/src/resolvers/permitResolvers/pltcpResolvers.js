const PLTCPPermit = require('../../models/permits/PLTCPPermit');
const { PLTCP_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');
const Admin = require('../../models/admin');
const PersonnelNotificationService = require('../../services/personnelNotificationService');

const pltcpResolvers = {
   Query: {
      getAllPLTCPPermits: async () => {
         return await PLTCPPermit.find();
      },
      getPLTCPPermitById: async (_, { id }) => {
         return await PLTCPPermit.findById(id);
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
               dateOfSubmission: new Date().toISOString(),
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
                  // remarks: notes,
                  priority: 'high'
               });
            }

            return {
               ...savedPermit.toObject(),
               id: savedPermit._id.toString()
            };
         } catch (error) {
            console.error('Error creating PLTCP permit:', error);
            throw new Error(`Failed to create PLTCP permit: ${error.message}`);
         }
      },
      updatePLTCPPermit: async (_, { id, input }, { user }) => {
         try {
            if (!user) {
               throw new Error('You must be logged in to update a permit');
            }

            const permit = await PLTCPPermit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }

            if (permit.applicantId.toString() !== user.id && user.role !== 'admin') {
               throw new Error('You are not authorized to update this permit');
            }

            console.log('Received input:', JSON.stringify(input, null, 2));

            // Update the permit fields
            Object.assign(permit, input);

            // Handle file updates
            if (input.files) {
               for (const [key, files] of Object.entries(input.files)) {
                  permit.files[key] = files.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: file.data ? Buffer.from(file.data, 'base64') : undefined
                  }));
               }
            }

            await permit.save();
            return permit;
         } catch (error) {
            console.error('Error in updatePLTCPPermit:', error);
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
               applicationType: 'Public Land Tree Cutting Permit',
               status: 'Draft',
               currentStage: 'Draft',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
            };

            const newPermit = new PLTCPPermit(permitData);
            const savedPermit = await newPermit.save();
            return savedPermit;
         } catch (error) {
            console.error('Error saving PLTCP permit draft:', error);
            throw new Error(`Failed to save PLTCP permit draft: ${error.message}`);
         }
      },
   },
};

module.exports = pltcpResolvers;
