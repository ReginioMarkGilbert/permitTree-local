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

            const certObj = certificate.toObject();

            // Convert Buffer to base64 string if it exists
            if (certObj.uploadedCertificate && certObj.uploadedCertificate.fileData) {
               certObj.uploadedCertificate.fileData = certObj.uploadedCertificate.fileData.toString('base64');
            }

            // Convert signature Buffer to base64 if it exists
            if (certObj.signature && certObj.signature.data) {
               certObj.signature = {
                  ...certObj.signature,
                  data: certObj.signature.data.toString('base64')
               };
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
            const currentDate = new Date();

            const certificateData = {
               certificateNumber,
               applicationId: input.applicationId,
               applicationNumber: permit.applicationNumber,
               applicationType: input.applicationType,
               certificateStatus: 'Pending Signature',
               dateCreated: currentDate,
               dateIssued: currentDate,
               expiryDate: new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)),
               certificateData: input.certificateData
            };

            const certificate = new Certificate(certificateData);
            const savedCertificate = await certificate.save();

            // Update the permit with the certificate reference
            await Permit.findByIdAndUpdate(input.applicationId, {
               $set: {
                  certificateId: savedCertificate._id,
                  hasCertificate: true
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
            // Find existing certificate
            let certificate = await Certificate.findOne({
               applicationId: input.applicationId
            });

            // If no certificate exists, throw error
            if (!certificate) {
               throw new Error('No certificate found for this application.');
            }

            // Convert base64 to Buffer
            const fileBuffer = Buffer.from(input.uploadedCertificate.fileData, 'base64');

            // Update the certificate with new stamped certificate
            const updatedCertificate = {
               $set: {
                  certificateStatus: 'Stamped Certificate',
                  uploadedCertificate: {
                     fileData: fileBuffer,
                     filename: input.uploadedCertificate.filename,
                     contentType: input.uploadedCertificate.contentType,
                     metadata: {
                        ...input.uploadedCertificate.metadata,
                        issueDate: new Date(input.uploadedCertificate.metadata.issueDate),
                        expiryDate: new Date(input.uploadedCertificate.metadata.expiryDate)
                     }
                  },
                  dateIssued: new Date(input.uploadedCertificate.metadata.issueDate),
                  expiryDate: new Date(input.uploadedCertificate.metadata.expiryDate)
               }
            };

            // Use findOneAndUpdate with { new: true } to get the updated document
            const savedCertificate = await Certificate.findOneAndUpdate(
               { _id: certificate._id },
               updatedCertificate,
               {
                  new: true,
                  runValidators: true
               }
            ).lean();

            // Update permit status
            await Permit.findByIdAndUpdate(input.applicationId, {
               $set: {
                  currentStage: 'PendingRelease',
                  status: 'In Progress'
               }
            });

            // Convert Buffer back to base64 for response
            const responseData = {
               ...savedCertificate,
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

      signCertificate: async (_, { id, signature }) => {
         try {
            const certificate = await Certificate.findById(id);
            if (!certificate) {
               throw new UserInputError('Certificate not found');
            }

            // Log for debugging
            console.log('Signing certificate:', id);
            console.log('Signature data length:', signature?.length);

            // Extract the base64 data from the data URL
            const base64Data = signature.split(',')[1] || signature;

            // Convert base64 signature to Buffer
            const signatureBuffer = Buffer.from(base64Data, 'base64');

            // Log for debugging
            console.log('Converted signature buffer length:', signatureBuffer.length);

            // Update certificate with signature data
            const updateData = {
               signature: {
                  data: signatureBuffer,
                  contentType: 'image/png'
               },
               certificateStatus: 'Signed',
               dateIssued: new Date(),
               expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            };

            const updatedCertificate = await Certificate.findByIdAndUpdate(
               id,
               { $set: updateData },
               { new: true }
            );

            // Update the associated permit's stage
            await Permit.findByIdAndUpdate(
               updatedCertificate.applicationId,
               {
                  $set: {
                     currentStage: 'PendingRelease',
                     status: 'In Progress',
                     certificateSignedByPENRCENROfficer: true
                  }
               }
            );

            // Log the updated certificate
            console.log('Updated certificate:', {
               id: updatedCertificate.id,
               hasSignature: !!updatedCertificate.signature?.data,
               signatureSize: updatedCertificate.signature?.data?.length
            });

            // Convert signature buffer back to base64 for response
            const certObj = updatedCertificate.toObject();
            if (certObj.signature && certObj.signature.data) {
               certObj.signature = {
                  ...certObj.signature,
                  data: certObj.signature.data.toString('base64')
               };
            }

            return certObj;
         } catch (error) {
            console.error('Error signing certificate:', error);
            throw new Error(`Failed to sign certificate: ${error.message}`);
         }
      },

      updateCertificate: async (_, { id, certificateStatus, signature }) => {
         try {
            const certificate = await Certificate.findById(id);
            if (!certificate) {
               throw new UserInputError('Certificate not found');
            }

            const updateData = {};

            if (certificateStatus) {
               updateData.certificateStatus = certificateStatus;
            }

            if (signature === null) {
               // Remove signature and reset dates
               updateData.$unset = { signature: 1 }; // Properly remove the signature field
               updateData.dateIssued = null;
               updateData.expiryDate = null;
            }

            const updatedCertificate = await Certificate.findByIdAndUpdate(
               id,
               signature === null ? { $set: updateData, $unset: { signature: 1 } } : { $set: updateData },
               { new: true }
            );

            // Update permit stage if certificate status changes
            if (certificateStatus === 'Stamped Certificate') {
               await Permit.findByIdAndUpdate(
                  updatedCertificate.applicationId,
                  {
                     $set: {
                        currentStage: 'PendingRelease',
                        status: 'In Progress'
                     }
                  }
               );
            }

            // Convert signature buffer to base64 if it exists
            const certObj = updatedCertificate.toObject();
            if (certObj.signature && certObj.signature.data) {
               certObj.signature = {
                  ...certObj.signature,
                  data: certObj.signature.data.toString('base64')
               };
            }

            return certObj;
         } catch (error) {
            console.error('Error updating certificate:', error);
            throw new Error(`Failed to update certificate: ${error.message}`);
         }
      }
   }
};

module.exports = certificateResolvers;
