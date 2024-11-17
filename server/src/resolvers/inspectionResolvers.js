const Inspection = require('../models/Inspection');
const Permit = require('../models/permits/Permit');
const NotificationService = require('../services/userNotificationService');
const PersonnelNotificationService = require('../services/personnelNotificationService');

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
         const inspections = await Inspection.find({ status: 'Pending' })
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
      createInspection: async (_, { input }, { user }) => {
         try {
            const permit = await Permit.findById(input.permitId);
            if (!permit) {
               throw new Error('Permit not found');
            }

            const inspection = await Inspection.create({
               ...input,
               applicationNumber: permit.applicationNumber,
               applicationType: permit.applicationType,
               inspectorId: user.id,
               history: [{
                  action: 'Created',
                  timestamp: new Date(),
                  notes: 'Inspection scheduled',
                  performedBy: user.id
               }]
            });

            // Update permit's inspection schedule
            permit.inspectionSchedule = {
               scheduledDate: input.scheduledDate,
               scheduledTime: input.scheduledTime,
               location: input.location,
               status: 'Pending'
            };
            await permit.save();

            // Notify applicant
            await NotificationService.createApplicationNotification({
               application: permit,
               recipientId: permit.applicantId,
               type: 'INSPECTION_SCHEDULED',
               stage: 'ForInspectionByTechnicalStaff',
               remarks: `Inspection scheduled for ${input.scheduledDate} at ${input.scheduledTime}. Location: ${input.location}`
            });

            return inspection;
         } catch (error) {
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

            // Add to history
            inspection.history.push({
               action: 'Updated',
               timestamp: new Date(),
               notes: 'Inspection details updated',
               performedBy: user.id
            });

            await inspection.save();

            // Update permit's inspection schedule if status changed
            if (input.status) {
               const permit = await Permit.findById(inspection.permitId);
               if (permit && permit.inspectionSchedule) {
                  permit.inspectionSchedule.status = input.status;
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
            const inspection = await Inspection.findById(id);
            if (!inspection) {
               throw new Error('Inspection not found');
            }

            inspection.findings = findings;
            inspection.status = 'Completed';

            inspection.history.push({
               action: 'Completed',
               timestamp: new Date(),
               notes: `Inspection completed with result: ${findings.result}`,
               performedBy: user.id
            });

            await inspection.save();

            // Update permit status
            const permit = await Permit.findById(inspection.permitId);
            if (permit) {
               permit.inspectionSchedule.status = 'Completed';
               await permit.save();

               // Notify applicant
               await NotificationService.createApplicationNotification({
                  application: permit,
                  recipientId: permit.applicantId,
                  type: 'APPLICATION_INSPECTION_COMPLETE',
                  stage: 'ForInspectionByTechnicalStaff',
                  remarks: `Inspection completed with result: ${findings.result}`
               });
            }

            return inspection;
         } catch (error) {
            throw new Error(`Failed to record findings: ${error.message}`);
         }
      },

      cancelInspection: async (_, { id, reason }, { user }) => {
         try {
            const inspection = await Inspection.findById(id);
            if (!inspection) {
               throw new Error('Inspection not found');
            }

            inspection.status = 'Cancelled';
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
               permit.inspectionSchedule.status = 'Cancelled';
               await permit.save();

               // Notify applicant
               await NotificationService.createApplicationNotification({
                  application: permit,
                  recipientId: permit.applicantId,
                  type: 'INSPECTION_CANCELLED',
                  stage: 'ForInspectionByTechnicalStaff',
                  remarks: reason
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
            inspection.status = 'Rescheduled';

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
               permit.inspectionSchedule.status = 'Rescheduled';
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
      }
   }
};

module.exports = inspectionResolvers;
