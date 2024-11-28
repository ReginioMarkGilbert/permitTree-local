const Certificate = require('../models/Certificate');
const Permit = require('../models/permits/Permit');
const { OOP } = require('../models/OOP');
const { UserInputError } = require('apollo-server-express');
const { generateCertificateNumber } = require('../utils/certificateNumberGenerator');
const { Binary } = require('mongodb');

const certificateResolvers = {
   Query: {
      getCertificates: async (_, { status }) => {
         try {
            const query = status ? { certificateStatus: status } : {};
            return await Certificate.find(query).sort({ createdAt: -1 });
         } catch (error) {
            throw new Error(`Failed to fetch certificates: ${error.message}`);
         }
      },
      getCertificateById: async (_, { id }) => {
         try {
            const certificate = await Certificate.findById(id)
               .populate({
                  path: 'orderOfPayment',
                  match: {
                     OOPstatus: 'Issued OR',
                     'officialReceipt': { $exists: true }
                  }
               });

            if (!certificate) {
               throw new UserInputError('Certificate not found');
            }

            // Log the populated data
            console.log('Certificate with OOP:', {
               id: certificate.id,
               applicationId: certificate.applicationId,
               orderOfPayment: certificate.orderOfPayment ? {
                  id: certificate.orderOfPayment._id,
                  status: certificate.orderOfPayment.OOPstatus,
                  or: certificate.orderOfPayment.officialReceipt
               } : null
            });

            const certObj = certificate.toObject();

            // Convert Buffer to base64 string if it exists
            if (certObj.uploadedCertificate && certObj.uploadedCertificate.fileData) {
               certObj.uploadedCertificate.fileData = certObj.uploadedCertificate.fileData.toString('base64');
            }

            return certObj;
         } catch (error) {
            console.error('Error fetching certificate:', error);
            throw new Error(`Failed to fetch certificate: ${error.message}`);
         }
      },
      getCertificatesByApplicationId: async (_, { applicationId }) => {
         try {
            const certificates = await Certificate.find({ applicationId });
            return certificates.map(cert => {
               const certObj = cert.toObject();
               // Convert Buffer to base64 string if it exists
               if (certObj.uploadedCertificate && certObj.uploadedCertificate.fileData) {
                  certObj.uploadedCertificate.fileData = certObj.uploadedCertificate.fileData.toString('base64');
               }
               return certObj;
            });
         } catch (error) {
            throw new Error(`Failed to fetch certificates: ${error.message}`);
         }
      }
   },

   Certificate: {
      orderOfPayment: async (certificate) => {
         try {
            console.log('Fetching OOP for certificate:', certificate.id);
            console.log('Application Number:', certificate.applicationNumber);

            // Find OOP using application number
            const oop = await OOP.findOne({
               applicationNumber: certificate.applicationNumber,
               OOPstatus: 'Issued OR',
               'officialReceipt': { $exists: true }
            }).lean();

            if (oop) {
               console.log('Found OOP:', {
                  id: oop._id,
                  applicationNumber: oop.applicationNumber,
                  status: oop.OOPstatus,
                  or: oop.officialReceipt
               });
            } else {
               console.log('No OOP found for application number:', certificate.applicationNumber);
            }

            return oop;
         } catch (error) {
            console.error('Error fetching OOP:', error);
            return null;
         }
      }
   },

   Mutation: {
      generateCertificate: async (_, { input }) => {
         try {
            console.log('Generating certificate with input:', input);

            // Verify the permit exists and get its application number
            const permit = await Permit.findById(input.applicationId);
            if (!permit) {
               throw new Error(`Permit not found with ID: ${input.applicationId}`);
            }

            const certificateNumber = await generateCertificateNumber(input.applicationType);

            const certificateData = {
               certificateNumber,
               applicationId: input.applicationId,
               applicationNumber: permit.applicationNumber,
               applicationType: input.applicationType,
               certificateStatus: 'Pending Signature',
               dateCreated: new Date().toISOString(),
               certificateData: input.certificateData
            };

            const certificate = new Certificate(certificateData);
            const savedCertificate = await certificate.save();

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
               certificateStatus: 'Released',
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

            // Update permit status only when uploading the certificate
            await Permit.findByIdAndUpdate(input.applicationId, {
               $set: {
                  certificateGenerated: true,
                  certificateId: savedCertificate._id,
                  PermitCreated: true,
                  awaitingPermitCreation: false,
                  currentStage: 'Released',
                  status: 'Released'
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
