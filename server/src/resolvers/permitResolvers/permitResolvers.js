const mongoose = require('mongoose');
const Permit = require('../../models/permits/Permit');
const CSAWPermit = require('../../models/permits/CSAWPermit');
const COVPermit = require('../../models/permits/COVPermit');
const PTPRPermit = require('../../models/permits/PTPRPermit');
const PLTCPPermit = require('../../models/permits/PLTCPPermit');
const PLTPPermit = require('../../models/permits/PLTPPermit');
const TCEBPPermit = require('../../models/permits/TCEBPPermit');
const NotificationService = require('../../services/notificationService');
const PersonnelNotificationService = require('../../services/personnelNotificationService');
const User = require('../../models/User');
const Admin = require('../../models/admin');
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
               acceptedByPENRCENROfficer: permit.acceptedByPENRCENROfficer || false,
               approvedByPENRCENROfficer: permit.approvedByPENRCENROfficer || false,
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
               dateOfSubmission: permit.dateOfSubmission.toISOString()
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
         approvedByTechnicalStaff,

         acceptedByReceivingClerk,
         recordedByReceivingClerk,

         acceptedByPENRCENROfficer,
         approvedByPENRCENROfficer,

         reviewedByChief,
         awaitingOOP,
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
            if (acceptedByPENRCENROfficer !== undefined) {
               query.acceptedByPENRCENROfficer = acceptedByPENRCENROfficer;
            }
            if (approvedByPENRCENROfficer !== undefined) {
               query.approvedByPENRCENROfficer = approvedByPENRCENROfficer;
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

         // User notification
         await NotificationService.createApplicationNotification({
            application: permit,
            recipientId: permit.applicantId,
            type: 'APPLICATION_SUBMITTED',
            stage: 'Submitted'
         });

         // Personnel notification
         const technicalStaff = await User.findOne({ roles: 'Technical_Staff' });
         if (technicalStaff) {
            await PersonnelNotificationService.createApplicationPersonnelNotification({
               application: permit,
               recipientId: technicalStaff._id,
               type: 'PENDING_TECHNICAL_REVIEW',
               stage: 'TechnicalStaffReview'
            });
         }

         return permit;
      },
      updatePermitStage: async (_, {
         id,
         currentStage,
         status,
         notes,
         acceptedByTechnicalStaff,
         approvedByTechnicalStaff,

         acceptedByReceivingClerk,
         recordedByReceivingClerk,

         acceptedByPENRCENROfficer,
         approvedByPENRCENROfficer,

         reviewedByChief,

         awaitingOOP,
         awaitingPermitCreation,
         PermitCreated
      }, { user }) => {
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
            if (acceptedByPENRCENROfficer !== undefined) {
               permit.acceptedByPENRCENROfficer = acceptedByPENRCENROfficer;
            }
            if (approvedByPENRCENROfficer !== undefined) {
               permit.approvedByPENRCENROfficer = approvedByPENRCENROfficer;
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

            // permit.history.push({
            //    stage: currentStage,
            //    status: status,
            //    timestamp: new Date(),
            //    notes: notes || ''
            // });

            // const updatedPermit = await permit.save();

            // #region - Technical Staff Review
            if (currentStage === 'ForRecordByReceivingClerk' && acceptedByTechnicalStaff) {
               // Notify applicant
               await NotificationService.createApplicationNotification({
                  application: permit,
                  recipientId: permit.applicantId,
                  type: 'APPLICATION_ACCEPTED_BY_TECHNICAL',
                  stage: currentStage,
                  remarks: notes
               });
               // Notify Receiving_Clerk
               const receivingClerk = await Admin.findOne({ roles: 'Receiving_Clerk' });
               if (receivingClerk) {
                  await PersonnelNotificationService.createApplicationPersonnelNotification({
                     application: permit,
                     recipientId: receivingClerk._id,
                     type: 'PENDING_RECEIVING_CLERK_RECORD',
                     stage: 'ForRecordByReceivingClerk',
                     remarks: notes,
                     priority: 'high'
                  });
               }
            }

            // Handle Technical Staff Return notifications
            if (currentStage === 'ReturnedByTechnicalStaff' && !acceptedByTechnicalStaff) {
               await NotificationService.createApplicationNotification({
                  application: permit,
                  recipientId: permit.applicantId,
                  type: 'APPLICATION_RETURNED_BY_TECHNICAL',
                  stage: currentStage,
                  remarks: notes
               });
            } ``
            // #endregion




            permit.history.push({
               stage: currentStage,
               status: status,
               timestamp: new Date(),
               notes: notes || ''
            });

            // return updatedPermit;
            await permit.save();
            return permit;

         } catch (error) {
            console.error('Error updating permit:', error);
            throw error;
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

      // Technical Staff Review
      acceptApplication: async (_, { id, notes }, { user }) => {
         const permit = await Permit.findById(id);
         if (!permit) throw new Error('Permit not found');

         permit.acceptedByTechnicalStaff = true;
         permit.currentStage = 'ReceivingClerkReview';
         permit.status = 'In Progress';

         permit.history.push({
            stage: 'TechnicalStaffReview',
            status: 'Accepted',
            timestamp: new Date(),
            notes,
            actionBy: user.id
         });

         await permit.save();

         // User notification
         await NotificationService.createApplicationNotification({
            application: permit,
            recipientId: permit.applicantId,
            type: 'APPLICATION_ACCEPTED_BY_TECHNICAL',
            stage: 'TechnicalStaffReview',
            remarks: notes
         });

         // Personnel notification
         const receivingClerk = await User.findOne({ roles: 'Receiving_Clerk' });
         if (receivingClerk) {
            await PersonnelNotificationService.createApplicationPersonnelNotification({
               application: permit,
               recipientId: receivingClerk._id,
               type: 'PENDING_RECEIVING_CLERK_RECORD',
               stage: 'ReceivingClerkReview',
               remarks: notes
            });
         }

         return permit;
      },

      // Receiving Clerk Record
      recordApplication: async (_, { id, notes }, { user }) => {
         const permit = await Permit.findById(id);
         if (!permit) throw new Error('Permit not found');

         permit.recordedByReceivingClerk = true;
         permit.currentStage = 'ChiefRPSReview';

         permit.history.push({
            stage: 'ReceivingClerkReview',
            status: 'Recorded',
            timestamp: new Date(),
            notes,
            actionBy: user.id
         });

         await permit.save();

         // Notify applicant
         await NotificationService.createApplicationNotification({
            application: permit,
            recipientId: permit.applicantId,
            type: 'APPLICATION_RECORDED',
            stage: 'ReceivingClerkReview'
         });

         // Notify Chief RPS
         await NotificationService.notifyNextPersonnel('ChiefRPSReview', permit);

         return permit;
      },

      // Chief RPS Review
      reviewByChief: async (_, { id, notes }, { user }) => {
         const permit = await Permit.findById(id);
         if (!permit) throw new Error('Permit not found');

         permit.reviewedByChief = true;
         permit.currentStage = 'CENRPENRReview';

         permit.history.push({
            stage: 'ChiefRPSReview',
            status: 'Reviewed',
            timestamp: new Date(),
            notes,
            actionBy: user.id
         });

         await permit.save();

         // Notify applicant
         await NotificationService.createApplicationNotification({
            application: permit,
            recipientId: permit.applicantId,
            type: 'APPLICATION_REVIEWED_BY_CHIEF',
            stage: 'ChiefRPSReview'
         });

         // Notify PENR/CENR Officer
         await NotificationService.notifyNextPersonnel('CENRPENRReview', permit);

         return permit;
      },

      // PENR/CENR Officer Approval
      approveByPENRCENR: async (_, { id, notes }, { user }) => {
         const permit = await Permit.findById(id);
         if (!permit) throw new Error('Permit not found');

         permit.approvedByPENRCENROfficer = true;
         permit.currentStage = 'ForInspectionByTechnicalStaff';

         permit.history.push({
            stage: 'CENRPENRReview',
            status: 'Approved',
            timestamp: new Date(),
            notes,
            actionBy: user.id
         });

         await permit.save();

         // Notify applicant
         await NotificationService.createApplicationNotification({
            application: permit,
            recipientId: permit.applicantId,
            type: 'APPLICATION_APPROVED_BY_PENRCENR',
            stage: 'CENRPENRReview'
         });

         // Notify Technical Staff for inspection
         await NotificationService.notifyNextPersonnel('ForInspectionByTechnicalStaff', permit);

         return permit;
      }
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
            case 'Public Land Tree Cutting Permit':
               return 'PLTCPPermit';
            case 'Private Land Timber Permit':
               return 'PLTPPermit';
            case 'Tree Cutting and/or Earth Balling Permit':
               return 'TCEBPPermit';
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
   PLTCPPermit: {
      __isTypeOf(obj) {
         return obj.applicationType === 'Public Land Tree Cutting Permit';
      }
   },
   PLTPPermit: {
      __isTypeOf(obj) {
         return obj.applicationType === 'Private Land Timber Permit';
      }
   },
   TCEBPPermit: {
      __isTypeOf(obj) {
         return obj.applicationType === 'Tree Cutting and/or Earth Balling Permit';
      }
   },
   // ... add other permit type resolvers
};

// Helper function to determine next personnel in workflow
function getNextPersonnelRole(currentStage) {
   const workflowMap = {
      'TechnicalStaffReview': 'Technical_Staff',
      'ReceivingClerkReview': 'Receiving_Clerk',
      'ChiefRPSReview': 'Chief_RPS',
      'CENRPENRReview': 'PENR_CENR_Officer',
      // Add more mappings as needed
   };
   return workflowMap[currentStage];
}

module.exports = permitResolvers;
