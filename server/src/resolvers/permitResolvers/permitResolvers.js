const mongoose = require('mongoose');
const Permit = require('../../models/permits/Permit');
const CSAWPermit = require('../../models/permits/CSAWPermit');
const COVPermit = require('../../models/permits/COVPermit');
const PTPRPermit = require('../../models/permits/PTPRPermit');
const PLTCPPermit = require('../../models/permits/PLTCPPermit');
const PLTPPermit = require('../../models/permits/PLTPPermit');
const TCEBPPermit = require('../../models/permits/TCEBPPermit');
const NotificationService = require('../../services/userNotificationService');
const PersonnelNotificationService = require('../../services/personnelNotificationService');
const User = require('../../models/User');
const Admin = require('../../models/admin');


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
      getRecentApplications: async (_, { limit, currentStages, roles }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to view applications');
         }

         try {
            let query = {};

            // Role-based filtering
            if (roles?.length > 0) {
               if (roles.includes('Technical_Staff')) {
                  query = {
                     $or: [
                        { status: 'Submitted' }, // New applications
                        { currentStage: 'TechnicalStaffReview' },
                        { currentStage: 'ForInspectionByTechnicalStaff' },
                        { currentStage: 'ReturnedByTechnicalStaff' }
                     ]
                  };
               } else if (roles.includes('Receiving_Clerk')) {
                  query = {
                     $or: [
                        { currentStage: 'ReceivingClerkReview' },
                        { currentStage: 'ForRecordByReceivingClerk' },
                        { currentStage: 'ReturnedByReceivingClerk' }
                     ]
                  };
               } else if (roles.includes('Chief_RPS')) {
                  query = {
                     $or: [
                        { currentStage: 'ChiefRPSReview' },
                        { status: 'In Progress', reviewedByChief: false }
                     ]
                  };
               } else if (roles.includes('PENR_CENR_Officer')) {
                  query = {
                     $or: [
                        { currentStage: 'CENRPENRReview' },
                        { currentStage: 'ReturnedByPENRCENROfficer' },
                        { status: 'In Progress', approvedByPENRCENROfficer: false }
                     ]
                  };
               } else if (roles.includes('OOP_Staff_Incharge')) {
                  query = {
                     $or: [
                        { awaitingOOP: true }
                     ]
                  };
               } else if (roles.includes('Releasing_Clerk')) {
                  query = {
                     $or: [
                        { currentStage: 'PendingRelease' },
                        { status: 'Approved', PermitCreated: true }
                     ]
                  };
               }
            } else {
               // For regular users, show their own applications
               query.applicantId = user.id;
            }

            console.log('Query:', query);

            const permits = await Permit.find(query)
               .sort({ dateOfSubmission: -1 })
               .limit(limit)
               .lean()
               .exec();

            console.log('Found permits:', permits.length);

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
         OOPCreated,
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
            if (OOPCreated !== undefined) {
               query.OOPCreated = OOPCreated;
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
               OOPCreated: p.OOPCreated,
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
         if (permit.currentStage !== 'TechnicalStaffReview') {
            throw new Error('Application cannot be unsubmitted at this stage');
         }

         permit.status = 'Draft';
         permit.currentStage = 'Draft';
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
         const technicalStaff = await Admin.findOne({ roles: 'Technical_Staff' });
         if (technicalStaff) {
            await PersonnelNotificationService.createApplicationPersonnelNotification({
               application: permit,
               recipientId: technicalStaff._id,
               type: 'PENDING_TECHNICAL_REVIEW',
               stage: 'TechnicalStaffReview',
               remarks: notes,
               priority: 'high'
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
         OOPCreated,
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
            if (OOPCreated !== undefined) {
               permit.OOPCreated = OOPCreated;
            }
            // permit.history.push({
            //    stage: currentStage,
            //    status: status,
            //    timestamp: new Date(),
            //    notes: notes || ''
            // });

            // const updatedPermit = await permit.save();

            // #region - Technical Staff Review
            //* ACCEPTANCE NOTIFICATIONS
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
            }
            //* INSPECTION NOTIFICATIONS
            if (currentStage === 'ForInspectionByTechnicalStaff' && reviewedByChief) {
               // Notify applicant
               await NotificationService.createApplicationNotification({
                  application: permit,
                  recipientId: permit.applicantId,
                  type: 'APPLICATION_REVIEWED_BY_CHIEF',
                  stage: currentStage,
                  remarks: notes
               });

               // Notify Technical Staff for inspection
               const technicalStaff = await Admin.findOne({ roles: 'Technical_Staff' });
               if (technicalStaff) {
                  await PersonnelNotificationService.createApplicationPersonnelNotification({
                     application: permit,
                     recipientId: technicalStaff._id,
                     type: 'PENDING_INSPECTION',
                     stage: currentStage,
                     remarks: notes,
                     priority: 'high'
                  });
               }
            }
            // #endregion - Technical Staff Review

            // #region - Receiving Clerk Record notifications
            if ((currentStage === 'ChiefRPSReview' || currentStage === 'CENRPENRReview') && recordedByReceivingClerk) {
               // Notify applicant
               await NotificationService.createApplicationNotification({
                  application: permit,
                  recipientId: permit.applicantId,
                  type: 'APPLICATION_RECORDED',
                  stage: currentStage,
                  remarks: notes
               });

               // Notify next personnel based on stage
               if (currentStage === 'ChiefRPSReview') {
                  // Notify Chief RPS/TSD
                  const chiefRPS = await Admin.findOne({ roles: 'Chief_RPS' });
                  if (chiefRPS) {
                     await PersonnelNotificationService.createApplicationPersonnelNotification({
                        application: permit,
                        recipientId: chiefRPS._id,
                        type: 'PENDING_CHIEF_REVIEW',
                        stage: currentStage,
                        remarks: notes,
                        priority: 'high'
                     });
                  } else {
                     console.log('Chief RPS not found');
                  }
                  // send notification to Chief TSD
                  const chiefTSD = await Admin.findOne({ roles: 'Chief_TSD' });
                  if (chiefTSD) {
                     await PersonnelNotificationService.createApplicationPersonnelNotification({
                        application: permit,
                        recipientId: chiefTSD._id,
                        type: 'PENDING_CHIEF_REVIEW',
                        stage: currentStage,
                        remarks: notes,
                        priority: 'high'
                     });
                  } else {
                     console.log('Chief TSD not found');
                  }
               }
               //* PENR/CENR Officer Approval Notifications
               if (currentStage === 'CENRPENRReview') {
                  // Notify PENR/CENR Officer
                  const penrCenrOfficer = await Admin.findOne({ roles: 'PENR_CENR_Officer' });
                  if (penrCenrOfficer) {
                     await PersonnelNotificationService.createApplicationPersonnelNotification({
                        application: permit,
                        recipientId: penrCenrOfficer._id,
                        type: 'PENDING_PENRCENR_APPROVAL',
                        stage: currentStage,
                        remarks: notes,
                        priority: 'high'
                     });
                  }
               }
            }
            // #endregion - Receiving Clerk Record notifications

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

      undoRecordApplication: async (_, {
         id,
         currentStage,
         status,
         notes,
         acceptedByPENRCENROfficer,
         reviewedByChief
      }) => {
         try {
            const permit = await Permit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }

            if (acceptedByPENRCENROfficer !== undefined) {
               permit.acceptedByPENRCENROfficer = acceptedByPENRCENROfficer;
            }
            if (reviewedByChief !== undefined) {
               permit.reviewedByChief = reviewedByChief;
            }

            if (permit.acceptedByPENRCENROfficer) {
               throw new Error('Cannot undo record: Application already accepted by PENR/CENR Officer');
            }
            if (permit.reviewedByChief) {
               throw new Error('Cannot undo record: Application already reviewed by Chief RPS/TSD');
            }

            permit.currentStage = 'ForRecordByReceivingClerk';
            permit.status = 'In Progress';
            permit.recordedByReceivingClerk = false;

            permit.history.push({
               stage: currentStage,
               status: status,
               timestamp: new Date(),
               notes: notes || ''
            });

            await permit.save();
            return permit;

         } catch (error) {
            throw error;
         }
      },


      undoAcceptanceCENRPENROfficer: async (_, {
         id,
         currentStage,
         status,
         notes,
         reviewedByChief
      }) => {
         try {
            const permit = await Permit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }

            if (reviewedByChief !== undefined) {
               permit.reviewedByChief = reviewedByChief;
            }

            if (permit.reviewedByChief) {
               throw new Error('Application cannot be undone, already reviewed by Chief RPS');
            }

            permit.currentStage = 'CENRPENRReview';
            permit.status = 'In Progress';
            permit.acceptedByPENRCENROfficer = false;

            permit.history.push({
               stage: currentStage,
               status: status,
               timestamp: new Date(),
               notes: notes || ''
            });

            await permit.save();
            return permit;

         } catch (error) {
            console.error('Error undoing record application:', error);
            throw error;
         }
      },

      recordApplication: async (_, { id, currentStage, status }, { user }) => {
         try {
            const permit = await Permit.findById(id);
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Update the fields
            permit.currentStage = currentStage;
            permit.status = status;
            permit.recordedByReceivingClerk = true;

            // Notify applicant first
            await NotificationService.createApplicationNotification({
               application: permit,
               recipientId: permit.applicantId,
               type: 'APPLICATION_RECORDED',
               stage: currentStage
            });

            // Handle notifications based on the next stage
            if (currentStage === 'ChiefRPSReview') {
               // Notify Chief RPS/TSD
               const chief = await Admin.findOne({ roles: { $in: ['Chief_RPS', 'Chief_TSD'] } });
               if (chief) {
                  await PersonnelNotificationService.createApplicationPersonnelNotification({
                     application: permit,
                     recipientId: chief._id,
                     type: 'PENDING_CHIEF_REVIEW',
                     stage: 'ChiefRPSReview',
                     priority: 'high'
                  });
               }
            } else if (currentStage === 'CENRPENRReview') {
               // Notify PENR/CENR Officer
               const penrCenrOfficer = await Admin.findOne({ roles: 'PENR_CENR_Officer' });
               if (penrCenrOfficer) {
                  await PersonnelNotificationService.createApplicationPersonnelNotification({
                     application: permit,
                     recipientId: penrCenrOfficer._id,
                     type: 'PENDING_PENRCENR_APPROVAL',
                     stage: 'CENRPENRReview',
                     priority: 'high'
                  });
               }
            }

            // Add to history
            permit.history.push({
               stage: currentStage,
               status: status,
               timestamp: new Date(),
               notes: 'Application recorded by receiving clerk',
               actionBy: user.id
            });

            await permit.save();
            return permit;

         } catch (error) {
            console.error('Error saving permit:', error);
            throw new Error(`Failed to record application: ${error.message}`);
         }
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
