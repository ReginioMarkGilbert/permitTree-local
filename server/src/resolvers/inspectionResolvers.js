const Inspection = require('../models/Inspection');
const Permit = require('../models/permits/Permit');
const NotificationService = require('../services/userNotificationService');
const PersonnelNotificationService = require('../services/personnelNotificationService');
const { format } = require('date-fns');
const mongoose = require('mongoose');

const inspectionResolvers = {
   Query: {
      getInspections: async () => {
         const inspections = await Inspection.find()
            .sort({ scheduledDate: -1 })
            .lean();

         return inspections.map(inspection => ({
            ...inspection,
            id: inspection._id.toString(),
            scheduledDate: inspection.scheduledDate.toISOString(),
            createdAt: inspection.createdAt.toISOString(),
            updatedAt: inspection.updatedAt.toISOString()
         }));
      },

      getInspectionById: async (_, { id }) => {
         const inspection = await Inspection.findById(id).lean();
         if (!inspection) return null;

         return {
            ...inspection,
            id: inspection._id.toString(),
            scheduledDate: inspection.scheduledDate.toISOString(),
            createdAt: inspection.createdAt.toISOString(),
            updatedAt: inspection.updatedAt.toISOString()
         };
      },

      getInspectionsByPermit: async (_, { permitId }) => {
         const inspections = await Inspection.find({ permitId })
            .sort({ scheduledDate: -1 })
            .lean();

         return inspections.map(inspection => ({
            ...inspection,
            id: inspection._id.toString(),
            scheduledDate: inspection.scheduledDate.toISOString(),
            createdAt: inspection.createdAt.toISOString(),
            updatedAt: inspection.updatedAt.toISOString()
         }));
      },

      getPendingInspections: async () => {
         const inspections = await Inspection.find({ inspectionStatus: 'Pending' })
            .sort({ scheduledDate: 1 })
            .lean();

         return inspections.map(inspection => ({
            ...inspection,
            id: inspection._id.toString(),
            scheduledDate: inspection.scheduledDate.toISOString(),
            createdAt: inspection.createdAt.toISOString(),
            updatedAt: inspection.updatedAt.toISOString()
         }));
      }
   },

   Mutation: {
      createInspection: async (_, { input }, context) => {
         try {
            // Check for either admin or user authentication
            const inspector = context.admin || context.user;
            if (!inspector) {
               throw new Error('Authentication required');
            }

            const permit = await Permit.findById(input.permitId);
            if (!permit) {
               throw new Error('Permit not found');
            }

            // Parse the date and time
            const [year, month, day] = input.scheduledDate.split('-').map(Number);
            const [hours, minutes] = input.scheduledTime.split(':').map(Number);

            // Create date object preserving the local time
            const scheduledDate = new Date(
               year,
               month - 1,
               day,
               hours,
               minutes,
               0,
               0
            );

            console.log('Creating inspection:', {
               input_date: input.scheduledDate,
               input_time: input.scheduledTime,
               inspector: inspector.id,
               created_date: scheduledDate.toISOString(),
               local_time: scheduledDate.toString()
            });

            const inspection = await Inspection.create({
               ...input,
               scheduledDate,
               applicationNumber: permit.applicationNumber,
               applicationType: permit.applicationType,
               inspectorId: inspector.id,
               history: [{
                  action: 'Created',
                  timestamp: new Date(),
                  notes: 'Inspection scheduled',
                  performedBy: inspector.id
               }]
            });

            // Update permit with the exact same date object
            permit.inspectionSchedule = {
               scheduledDate,
               scheduledTime: input.scheduledTime,
               location: input.location,
               inspectionStatus: 'Pending'
            };
            await permit.save();

            // Notify applicant
            await NotificationService.createApplicationNotification({
               application: permit,
               recipientId: permit.applicantId,
               type: 'INSPECTION_SCHEDULED',
               stage: 'ForInspectionByTechnicalStaff',
               remarks: `Inspection scheduled for ${format(scheduledDate, 'PPP')} at ${input.scheduledTime}. Location: ${input.location}`
            });

            return inspection;
         } catch (error) {
            console.error('Inspection creation error:', error);
            throw new Error(`Failed to create inspection: ${error.message}`);
         }
      },

      updateInspection: async (_, { id, input }, { user }) => {
         try {
            const inspection = await Inspection.findById(id);
            if (!inspection) {
               throw new Error('Inspection not found');
            }

            // Update inspection details
            Object.assign(inspection, input);

            inspection.history.push({
               action: 'Updated',
               timestamp: new Date(),
               notes: 'Inspection details updated',
               performedBy: user.id
            });

            await inspection.save();

            // Update permit's inspection schedule if inspectionStatus changed
            if (input.inspectionStatus) {
               const permit = await Permit.findById(inspection.permitId);
               if (permit && permit.inspectionSchedule) {
                  permit.inspectionSchedule.inspectionStatus = input.inspectionStatus;
                  await permit.save();
               }
            }

            return inspection;
         } catch (error) {
            throw new Error(`Failed to update inspection: ${error.message}`);
         }
      },

      recordInspectionFindings: async (_, { id, findings }, { user }) => {
         try {
            console.log('Recording findings for inspection:', id);
            console.log('User context:', user);
            console.log('Findings:', findings);

            // Validate inspection ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
               throw new Error('Invalid inspection ID format');
            }

            // Find inspection
            const inspection = await Inspection.findById(id);
            if (!inspection) {
               throw new Error(`Inspection not found with ID: ${id}`);
            }

            // Find permit
            const permit = await Permit.findById(inspection.permitId);
            if (!permit) {
               throw new Error('Associated permit not found');
            }

            // Update inspection findings
            inspection.findings = {
               result: findings.result,
               observations: findings.observations || '',
               recommendations: findings.recommendations || '',
               attachments: findings.attachments?.map(file => ({
                  filename: file.filename,
                  contentType: file.contentType,
                  data: Buffer.from(file.data, 'base64')
               })) || []
            };

            // Update status
            inspection.inspectionStatus = 'Completed';

            // Add history entry - use inspector ID from inspection if user context is unavailable
            inspection.history.push({
               action: 'Completed',
               timestamp: new Date(),
               notes: `Inspection completed with result: ${findings.result}`,
               performedBy: inspection.inspectorId // Use inspector ID from inspection
            });

            await inspection.save();

            // Update permit
            permit.inspectionSchedule = {
               ...permit.inspectionSchedule,
               inspectionStatus: 'Completed'
            };
            permit.hasInspectionReport = true;
            permit.currentStage = 'InspectionReportForReviewByChief';
            await permit.save();

            // Format response
            const response = inspection.toObject();
            response.id = inspection._id.toString();

            // Convert attachments to base64
            if (response.findings?.attachments) {
               response.findings.attachments = response.findings.attachments.map(file => ({
                  filename: file.filename,
                  contentType: file.contentType,
                  data: file.data.toString('base64')
               }));
            }

            return response;
         } catch (error) {
            console.error('Error in recordInspectionFindings:', error);
            throw new Error(`Failed to record findings: ${error.message}`);
         }
      },

      cancelInspection: async (_, { id, reason }, { user }) => {
         try {
            const inspection = await Inspection.findById(id);
            if (!inspection) {
               throw new Error('Inspection not found');
            }

            inspection.inspectionStatus = 'Cancelled';
            inspection.history.push({
               action: 'Cancelled',
               timestamp: new Date(),
               notes: reason,
               performedBy: user.id
            });

            await inspection.save();

            // Update permit's inspection schedule
            const permit = await Permit.findById(inspection.permitId);
            if (permit && permit.inspectionSchedule) {
               permit.inspectionSchedule.inspectionStatus = 'Cancelled';
               await permit.save();

               // Notify applicant
               await NotificationService.createApplicationNotification({
                  application: permit,
                  recipientId: permit.applicantId,
                  type: 'INSPECTION_CANCELLED',
                  stage: 'ForInspectionByTechnicalStaff',
                  remarks: `The inspection for your application ${permit.applicationNumber} has been cancelled. ${reason}`
               });
            }

            return inspection;
         } catch (error) {
            throw new Error(`Failed to cancel inspection: ${error.message}`);
         }
      },

      rescheduleInspection: async (_, { id, newDate, newTime }, { user }) => {
         try {
            const inspection = await Inspection.findById(id);
            if (!inspection) {
               throw new Error('Inspection not found');
            }

            inspection.scheduledDate = new Date(newDate);
            inspection.scheduledTime = newTime;
            inspection.inspectionStatus = 'Rescheduled';

            inspection.history.push({
               action: 'Rescheduled',
               timestamp: new Date(),
               notes: `Rescheduled to ${newDate} at ${newTime}`,
               performedBy: user.id
            });

            await inspection.save();

            // Update permit's inspection schedule
            const permit = await Permit.findById(inspection.permitId);
            if (permit && permit.inspectionSchedule) {
               permit.inspectionSchedule.scheduledDate = new Date(newDate);
               permit.inspectionSchedule.scheduledTime = newTime;
               permit.inspectionSchedule.inspectionStatus = 'Rescheduled';
               await permit.save();

               // Notify applicant
               await NotificationService.createApplicationNotification({
                  application: permit,
                  recipientId: permit.applicantId,
                  type: 'INSPECTION_RESCHEDULED',
                  stage: 'ForInspectionByTechnicalStaff',
                  remarks: `Inspection rescheduled to ${newDate} at ${newTime}`
               });
            }

            return inspection;
         } catch (error) {
            throw new Error(`Failed to reschedule inspection: ${error.message}`);
         }
      },

      deleteInspection: async (_, { id, reason = 'No reason provided' }, { user }) => {
         try {
            const inspection = await Inspection.findById(id);
            if (!inspection) {
               throw new Error('Inspection not found');
            }

            // Update permit's inspection schedule
            const permit = await Permit.findById(inspection.permitId);
            if (permit) {
               permit.inspectionSchedule = undefined; // Remove the schedule
               await permit.save();
            }

            // Notify applicant with the provided reason
            await NotificationService.createApplicationNotification({
               application: permit,
               recipientId: permit.applicantId,
               type: 'INSPECTION_CANCELLED',
               stage: 'ForInspectionByTechnicalStaff',
               remarks: reason // Use the default if no reason provided
            });

            await Inspection.findByIdAndDelete(id);
            return true;
         } catch (error) {
            console.error('Error deleting inspection:', error);
            throw new Error(`Failed to delete inspection: ${error.message}`);
         }
      },

      undoInspectionReport: async (_, { id }, context) => {
         try {
            // Check for authentication
            const user = context.admin || context.user;
            if (!user) {
               throw new Error('Authentication required');
            }

            const inspection = await Inspection.findById(id);
            if (!inspection) {
               throw new Error('Inspection not found');
            }

            // Reset inspection findings and status
            inspection.findings = undefined;
            inspection.inspectionStatus = 'Pending';

            // Add to history
            inspection.history.push({
               action: 'Report Undone',
               timestamp: new Date(),
               notes: 'Inspection report has been undone',
               performedBy: user._id // Use _id instead of id
            });

            await inspection.save();

            // Update permit status
            const permit = await Permit.findById(inspection.permitId);
            if (permit) {
               permit.hasInspectionReport = false;
               permit.currentStage = 'ForInspectionByTechnicalStaff';
               if (permit.inspectionSchedule) {
                  permit.inspectionSchedule.inspectionStatus = 'Pending';
               }
               await permit.save();
            }

            // Return formatted inspection data
            const response = inspection.toObject();
            response.id = inspection._id.toString();
            response.scheduledDate = inspection.scheduledDate.toISOString();

            return response;
         } catch (error) {
            console.error('Error undoing inspection report:', error);
            throw new Error(`Failed to undo inspection report: ${error.message}`);
         }
      }
   }
};

module.exports = inspectionResolvers;
