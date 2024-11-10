const mongoose = require('mongoose');
const Permit = require('../../models/permits/Permit');
const CSAWPermit = require('../../models/permits/CSAWPermit');
const COVPermit = require('../../models/permits/COVPermit');
const PTPRPermit = require('../../models/permits/PTPRPermit');
// ... import other permit types

const permitResolvers = {
   Query: {
      getAllPermits: async () => {
         return await Permit.find().lean().exec();
      },
      getPermitById: async (_, { id }) => {
         return await Permit.findById(id).lean().exec();
      },
      getUserApplications: async (_, { status, currentStage }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to view your applications');
         }

         let query = { applicantId: user.id };
         if (status) {
            query.status = status;
         }
         if (currentStage) {
            query.currentStage = currentStage;
         }

         try {
            const permits = await Permit.find(query)
               .sort({ dateOfSubmission: -1 })
               .lean()
               .exec();

            const formattedPermits = permits.map(permit => ({
               ...permit,
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.toISOString(),
               currentStage: permit.currentStage || 'Submitted',
               history: permit.history || [],
               recordedByReceivingClerk: permit.recordedByReceivingClerk || false,
               reviewedByChief: permit.reviewedByChief || false,
               acceptedByTechnicalStaff: permit.acceptedByTechnicalStaff || false,
               approvedByTechnicalStaff: permit.approvedByTechnicalStaff || false,
               awaitingPermitCreation: permit.awaitingPermitCreation || false,
               PermitCreated: permit.PermitCreated || false
            }));

            // console.log('Server: Fetched user applications:', query);
            // console.log('Server: Number of applications:', formattedPermits.length);
            // console.log('Server: First application:', formattedPermits[0]);

            return formattedPermits;
         } catch (error) {
            console.error('Error fetching permits:', error);
            throw new Error(`Failed to fetch permits: ${error.message}`);
         }
      },
      getRecentApplications: async (_, { limit }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to view your applications');
         }

         try {
            const permits = await Permit.find({ applicantId: user.id })
               .sort({ dateOfSubmission: -1 })
               .limit(limit)
               .lean()
               .exec();

            return permits.map(permit => ({
               ...permit,
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.getTime().toString()
            }));
         } catch (error) {
            console.error('Error fetching recent permits:', error);
            throw new Error(`Failed to fetch recent permits: ${error.message}`);
         }
      },
      getSubmittedApplications: async () => {
         try {
            const permits = await Permit.find({ status: 'Submitted' })
               .sort({ dateOfSubmission: -1 })
               .lean()
               .exec();

            return permits.map(permit => ({
               ...permit,
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.toISOString()
            }));
         } catch (error) {
            console.error('Error fetching submitted permits:', error);
            throw new Error(`Failed to fetch submitted permits: ${error.message}`);
         }
      },
      getApplicationsByStatus: async (_, {
         status,
         currentStage,
         acceptedByTechnicalStaff,
         acceptedByReceivingClerk,
         recordedByReceivingClerk,
         reviewedByChief,
         awaitingOOP,
         approvedByTechnicalStaff,
         awaitingPermitCreation,
         PermitCreated
      }) => {
         try {
            let query = {};

            if (status) query.status = status;
            if (currentStage) query.currentStage = currentStage;
            if (acceptedByTechnicalStaff !== undefined) {
               query.acceptedByTechnicalStaff = acceptedByTechnicalStaff;
            }
            if (approvedByTechnicalStaff !== undefined) {
               query.approvedByTechnicalStaff = approvedByTechnicalStaff;
            }
            if (acceptedByReceivingClerk !== undefined) {
               query.acceptedByReceivingClerk = acceptedByReceivingClerk;
            }
            if (recordedByReceivingClerk !== undefined) {
               query.recordedByReceivingClerk = recordedByReceivingClerk;
            }
            if (reviewedByChief !== undefined) {
               query.reviewedByChief = reviewedByChief;
            }
            if (awaitingOOP !== undefined) {
               query.awaitingOOP = awaitingOOP;
            }
            if (awaitingPermitCreation !== undefined) {
               query.awaitingPermitCreation = awaitingPermitCreation;
            }
            if (PermitCreated !== undefined) {
               query.PermitCreated = PermitCreated;
            }

            console.log('Query parameters:', query);

            const permits = await Permit.find(query)
               .sort({ dateOfSubmission: -1 })
               .lean()
               .exec();

            console.log('Found permits:', permits.length);
            console.log('Permit details:', permits.map(p => ({
               id: p._id,
               applicationNumber: p.applicationNumber,
               awaitingOOP: p.awaitingOOP,
               status: p.status
            })));

            return permits.map(permit => ({
               ...permit,
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.toISOString()
            }));
         } catch (error) {
            console.error('Error fetching permits:', error);
            throw new Error(`Failed to fetch permits: ${error.message}`);
         }
      },
      getApplicationsByCurrentStage: async (_, { currentStage }) => {
         try {
            const permits = await Permit.find({ currentStage })
               .sort({ dateOfSubmission: -1 })
               .lean()
               .exec();

            return permits.map(permit => ({
               ...permit,
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.toISOString()
            }));
         } catch (error) {
            console.error(`Error fetching ${currentStage} permits:`, error);
            throw new Error(`Failed to fetch ${currentStage} permits: ${error.message}`);
         }
      },
      getApplicationsAwaitingOOP: async (_, __, { user }) => {
         if (!user) throw new AuthenticationError('Not authenticated');

         const permits = await Permit.find({
           status: 'Accepted',
           awaitingOOP: true
         }).lean();

         return permits.map(permit => ({
           ...permit,
           id: permit._id.toString(),
           dateOfSubmission: permit.dateOfSubmission.toISOString()
         }));
      },
      getPermitByApplicationNumber: async (_, { applicationNumber }) => {
         try {
            const permit = await Permit.findOne({ applicationNumber });
            if (!permit) {
               throw new Error('Permit not found');
            }
            return permit;
         } catch (error) {
            throw new Error(`Failed to fetch permit: ${error.message}`);
         }
      },
   },
   Mutation: {
      updatePermitStatus: async (_, { id, status }) => {
         const updatedPermit = await Permit.findByIdAndUpdate(id, { status }, { new: true, lean: true });
         return {
            ...updatedPermit, // Spread the updated permit object
            id: updatedPermit._id.toString() // Convert _id to string
         };
      },
      deletePermit: async (_, { id }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to delete a permit');
         }

         const permit = await Permit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         if (permit.applicantId.toString() !== user.id && user.role !== 'admin') {
            throw new Error('You are not authorized to delete this permit');
         }

         if (permit.status !== 'Draft') {
            throw new Error('Only draft permits can be deleted');
         }

         await Permit.findByIdAndDelete(id);
         return true;
      },
      unsubmitPermit: async (_, { id }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to unsubmit a permit');
         }

         const permit = await Permit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         if (permit.applicantId.toString() !== user.id) {
            throw new Error('You are not authorized to unsubmit this permit');
         }

         if (permit.status !== 'Submitted') {
            throw new Error('Only submitted permits can be unsubmitted');
         }

         permit.status = 'Draft';
         await permit.save();

         return permit;
      },
      submitPermit: async (_, { id }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to submit a permit');
         }

         const permit = await Permit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         if (permit.applicantId.toString() !== user.id) {
            throw new Error('You are not authorized to submit this permit');
         }

         // Update this condition to allow both draft and returned permits
         if (permit.status !== 'Draft' && permit.status !== 'Returned') {
            throw new Error('Only draft or returned permits can be submitted');
         }

         permit.status = 'Submitted';
         permit.currentStage = 'TechnicalStaffReview';
         await permit.save();

         return permit;
      },
      updatePermitStage: async (_, {
         id,
         currentStage,
         status,
         notes,
         reviewedByChief,
         awaitingOOP,
         acceptedByTechnicalStaff,
         acceptedByReceivingClerk,
         recordedByReceivingClerk,
         approvedByTechnicalStaff,
         awaitingPermitCreation,
         PermitCreated
      }, context) => {
         try {
            const permit = await Permit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }

            permit.currentStage = currentStage;
            permit.status = status;

            if (reviewedByChief !== undefined) {
               permit.reviewedByChief = reviewedByChief;
            }
            if (awaitingOOP !== undefined) {
               permit.awaitingOOP = awaitingOOP;
            }
            if (acceptedByTechnicalStaff !== undefined) {
               permit.acceptedByTechnicalStaff = acceptedByTechnicalStaff;
            }
            if (acceptedByReceivingClerk !== undefined) {
               permit.acceptedByReceivingClerk = acceptedByReceivingClerk;
            }
            if (recordedByReceivingClerk !== undefined) {
               permit.recordedByReceivingClerk = recordedByReceivingClerk;
            }
            if (approvedByTechnicalStaff !== undefined) {
               permit.approvedByTechnicalStaff = approvedByTechnicalStaff;
            }
            if (awaitingPermitCreation !== undefined) {
               permit.awaitingPermitCreation = awaitingPermitCreation;
            }
            if (PermitCreated !== undefined) {
               permit.PermitCreated = PermitCreated;
            }

            permit.history.push({
               stage: currentStage,
               status: status,
               timestamp: new Date(),
               notes: notes || ''
            });

            await permit.save();

            return {
               ...permit.toObject(),
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.toISOString()
            };
         } catch (error) {
            console.error('Error updating permit:', error);
            throw new Error(`Failed to update permit: ${error.message}`);
         }
      },

      recordApplication: async (_, { id, currentStage, status }, { user }) => {
         const permit = await Permit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         // Update the fields
         permit.currentStage = currentStage;
         permit.status = status;
         permit.recordedByReceivingClerk = true;

         permit.history.push({
            stage: currentStage,
            status: status,
            timestamp: new Date(),
            notes: 'Application recorded by receiving clerk'
         });

         try {
            await permit.save();
         } catch (error) {
            console.error('Error saving permit:', error);
            throw new Error(`Failed to record application: ${error.message}`);
         }

         return {
            ...permit.toObject(),
            id: permit._id.toString(),
            dateOfSubmission: permit.dateOfSubmission.toISOString()
         };
      },

      reviewApplication: async (_, { id }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to review an application');
         }

         const permit = await Permit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         permit.reviewedByChief = true;
         permit.history.push({
            stage: 'ReviewedByChief',
            status: permit.status,
            timestamp: new Date(),
            notes: 'Application reviewed by Chief RPS',
            actionBy: user.id
         });

         await permit.save();

         return {
            ...permit.toObject(),
            id: permit._id.toString(),
            dateOfSubmission: permit.dateOfSubmission.toISOString()
         };
      },
   },
   Permit: {
      __resolveType(obj) {
         switch (obj.applicationType) {
            case 'Chainsaw Registration':
               return 'CSAWPermit';
            case 'Certificate of Verification':
               return 'COVPermit';
            case 'Private Tree Plantation Registration':
               return 'PTPRPermit';
            // ... add other cases
            default:
               return null;
         }
      }
   },
   CSAWPermit: {
      __isTypeOf(obj) {
         return obj.applicationType === 'Chainsaw Registration';
      }
   },
   COVPermit: {
      __isTypeOf(obj) {
         return obj.applicationType === 'Certificate of Verification';
      }
   },
   PTPRPermit: {
      __isTypeOf(obj) {
         return obj.applicationType === 'Private Tree Plantation Registration';
      }
   },
   // ... add other permit type resolvers
};

module.exports = permitResolvers;
