const Certificate = require('../models/Certificate');
const Permit = require('../models/permits/Permit');
const { UserInputError } = require('apollo-server-express');
const { generateCertificateNumber } = require('../utils/certificateNumberGenerator');

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
               status: 'Pending Signature',
               dateCreated: new Date().toISOString(),
               certificateData: input.certificateData
            };

            const certificate = new Certificate(certificateData);
            const savedCertificate = await certificate.save();

            // Update permit status
            await Permit.findByIdAndUpdate(input.applicationId, {
               $set: {
                  certificateGenerated: true,
                  certificateId: savedCertificate._id
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

            const certificate = new Certificate({
               certificateNumber,
               applicationId: input.applicationId,
               applicationType: input.applicationType,
               status: 'Pending Signature',
               createdBy: input.createdBy,
               uploadedCertificate: {
                  fileUrl: input.fileUrl,
                  uploadDate: new Date(),
                  metadata: {
                     ...input.metadata,
                     issueDate: new Date(input.metadata.issueDate),
                     expiryDate: new Date(input.metadata.expiryDate)
                  }
               },
               history: [{
                  action: 'UPLOADED',
                  timestamp: new Date(),
                  userId: input.createdBy,
                  notes: 'Certificate uploaded by technical staff'
               }]
            });

            const savedCertificate = await certificate.save();

            // Update permit status
            await Permit.findByIdAndUpdate(input.applicationId, {
               $set: {
                  PermitCreated: true,
                  awaitingPermitCreation: false
               }
            });

            return savedCertificate;
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

      signCertificate: async (_, { id, signature }) => {
         try {
            const certificate = await Certificate.findById(id);
            if (!certificate) {
               throw new UserInputError('Certificate not found');
            }

            certificate.signedBy = {
               PENRO: {
                  userId: input.createdBy,
                  signature,
                  dateSigned: new Date()
               }
            };
            certificate.status = 'Signed';
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
