const Certificate = require('../models/Certificate');
const Permit = require('../models/permits/Permit');
const { UserInputError } = require('apollo-server-express');
const { generateCertificateNumber } = require('../utils/certificateNumberGenerator');
const { Binary } = require('mongodb');

const certificateResolvers = {
   Query: {
      getCertificates: async (_, { status }) => {
         try {
            const query = status ? { status } : {};
            return await Certificate.find(query).sort({ createdAt: -1 });
         } catch (error) {
            throw new Error(`Failed to fetch certificates: ${error.message}`);
         }
      },
      getCertificateById: async (_, { id }) => {
         try {
            return await Certificate.findById(id);
         } catch (error) {
            throw new Error(`Failed to fetch certificate: ${error.message}`);
         }
      },
      getCertificatesByApplicationId: async (_, { applicationId }) => {
         try {
            return await Certificate.find({ applicationId });
         } catch (error) {
            throw new Error(`Failed to fetch certificates: ${error.message}`);
         }
      }
   },

   Mutation: {
      generateCertificate: async (_, { input }) => {
         try {
            console.log('Generating certificate with input:', input);

            // Verify the permit exists
            const permit = await Permit.findById(input.applicationId);
            if (!permit) {
               throw new Error(`Permit not found with ID: ${input.applicationId}`);
            }

            const certificateNumber = await generateCertificateNumber(input.applicationType);

            const certificateData = {
               certificateNumber,
               applicationId: input.applicationId,
               applicationType: input.applicationType,
               certificateStatus: 'Pending Signature',
               dateCreated: new Date().toISOString(),
               certificateData: input.certificateData
            };

            const certificate = new Certificate(certificateData);
            const savedCertificate = await certificate.save();

            // Update permit status with correct flags
            await Permit.findByIdAndUpdate(input.applicationId, {
               $set: {
                  certificateGenerated: true,
                  certificateId: savedCertificate._id,
                  PermitCreated: true,
                  awaitingPermitCreation: false
                  // currentStage: 'AuthenticityApprovedByTechnicalStaff'
               }
            });

            return savedCertificate;
         } catch (error) {
            console.error('Error generating certificate:', error);
            throw new Error(`Failed to generate certificate: ${error.message}`);
         }
      },

      uploadCertificate: async (_, { input }) => {
         try {
            const certificateNumber = await generateCertificateNumber(input.applicationType);

            // Convert base64 to Buffer
            const fileBuffer = Buffer.from(input.uploadedCertificate.fileData, 'base64');

            const certificate = new Certificate({
               certificateNumber,
               applicationId: input.applicationId,
               applicationType: input.applicationType,
               certificateStatus: 'Pending Signature',
               uploadedCertificate: {
                  fileData: fileBuffer,
                  filename: input.uploadedCertificate.filename,
                  contentType: input.uploadedCertificate.contentType,
                  metadata: {
                     ...input.uploadedCertificate.metadata,
                     issueDate: new Date(input.uploadedCertificate.metadata.issueDate),
                     expiryDate: new Date(input.uploadedCertificate.metadata.expiryDate)
                  }
               }
            });

            const savedCertificate = await certificate.save();

            // Update permit status with correct flags
            await Permit.findByIdAndUpdate(input.applicationId, {
               $set: {
                  certificateGenerated: true,
                  certificateId: savedCertificate._id,
                  PermitCreated: true,
                  awaitingPermitCreation: false,
                  currentStage: 'AuthenticityApprovedByTechnicalStaff'
               }
            });

            // Convert Buffer back to base64 for response
            const responseData = {
               ...savedCertificate.toObject(),
               id: savedCertificate._id.toString(),
               uploadedCertificate: {
                  ...savedCertificate.uploadedCertificate,
                  fileData: savedCertificate.uploadedCertificate.fileData.toString('base64')
               }
            };

            return responseData;
         } catch (error) {
            console.error('Error uploading certificate:', error);
            throw new Error(`Failed to upload certificate: ${error.message}`);
         }
      },

      forwardCertificateForSignature: async (_, { id }) => {
         try {
            const certificate = await Certificate.findById(id);
            if (!certificate) {
               throw new UserInputError('Certificate not found');
            }

            certificate.history.push({
               action: 'FORWARDED',
               timestamp: new Date(),
               userId: input.createdBy,
               notes: 'Forwarded for signature to PENRO'
            });

            return await certificate.save();
         } catch (error) {
            throw new Error(`Failed to forward certificate: ${error.message}`);
         }
      },

      signCertificate: async (_, { id }) => {
         try {
            const certificate = await Certificate.findById(id);
            if (!certificate) {
               throw new UserInputError('Certificate not found');
            }

            certificate.certificateStatus = 'Signed';
            certificate.dateIssued = new Date();
            certificate.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

            certificate.history.push({
               action: 'SIGNED',
               timestamp: new Date(),
               userId: input.createdBy,
               notes: 'Certificate signed by PENRO'
            });

            return await certificate.save();
         } catch (error) {
            throw new Error(`Failed to sign certificate: ${error.message}`);
         }
      }
   }
};

module.exports = certificateResolvers;
