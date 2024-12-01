const CSAWPermit = require('../../models/permits/CSAWPermit');
const { CSAW_ApplicationNumber } = require('../../utils/customIdGenerator');
const { Binary } = require('mongodb');
const { format } = require('date-fns');
const Admin = require('../../models/admin');
const PersonnelNotificationService = require('../../services/personnelNotificationService');
const Certificate = require('../../models/Certificate');
const Permit = require('../../models/permits/Permit');

const csawResolvers = {
   Query: {
      getAllCSAWPermits: async () => {
         return await CSAWPermit.find();
      },
      getCSAWPermitById: async (_, { id }) => {
         try {
            const permit = await CSAWPermit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }
            return {
               ...permit.toObject(),
               id: permit._id.toString()
            };
         } catch (error) {
            console.error('Error fetching CSAW permit:', error);
            throw new Error(`Failed to fetch CSAW permit: ${error.message}`);
         }
      },
      getPreviousCertificate: async (_, { certificateNumber }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to verify certificates');
         }

         console.log('Verifying certificate:', { certificateNumber, userId: user.id });

         // First find the certificate
         const certificate = await Certificate.findOne({ certificateNumber });

         if (!certificate) {
            throw new Error('Certificate not found');
         }

         // Then find the associated permit to verify ownership
         const permit = await Permit.findOne({
            _id: certificate.applicationId,
            applicantId: user.id
         });

         if (!permit) {
            throw new Error('Certificate does not belong to you');
         }

         if (certificate.certificateStatus !== 'Expired') {
            console.log('Certificate status check failed:', {
               certificateNumber,
               currentStatus: certificate.certificateStatus,
               expiryDate: certificate.expiryDate
            });
            throw new Error(`Certificate is not eligible for renewal. Current status: ${certificate.certificateStatus}`);
         }

         // Auto-renew the certificate
         const twoYearsFromNow = new Date();
         twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

         // Update certificate with new expiry date
         certificate.expiryDate = twoYearsFromNow;
         certificate.certificateStatus = 'Renewed';
         await certificate.save();

         // Update permit status
         await Permit.findByIdAndUpdate(permit._id, {
            $set: {
               status: 'Renewed',
               currentStage: 'Renewed'
            }
         });

         console.log('Certificate auto-renewed:', {
            certificateNumber,
            newExpiryDate: twoYearsFromNow,
            newStatus: 'Renewed',
            permitStatus: 'Renewed'
         });

         return certificate;
      }
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
               currentStage: 'TechnicalStaffReview',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
               dateOfAcquisition: new Date(input.dateOfAcquisition).toISOString(),
            };

            const newPermit = new CSAWPermit(permitData);
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
            console.error('Error creating CSAW permit:', error);
            throw new Error(`Failed to create CSAW permit: ${error.message}`);
         }
      },
      updateCSAWPermit: async (_, { id, input }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to update a permit');
         }

         try {
            const permit = await CSAWPermit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Handle date conversion
            if (input.dateOfAcquisition) {
               input.dateOfAcquisition = format(new Date(parseInt(input.dateOfAcquisition)), 'yyyy-MM-dd');
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
            console.error('Error updating CSAW permit:', error);
            throw new Error(`Failed to update CSAW permit: ${error.message}`);
         }
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
               currentStage: 'Submitted',
               dateOfSubmission: new Date().toISOString(),
               files: processedFiles,
               dateOfAcquisition: new Date(input.dateOfAcquisition).toISOString(),
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
