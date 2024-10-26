const mongoose = require('mongoose');
const Permit = require('../../models/permits/Permit');

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
               reviewedByChief: permit.reviewedByChief || false
            }));

            console.log('Server: Fetched user applications:', query);
            console.log('Server: Number of applications:', formattedPermits.length);
            console.log('Server: First application:', formattedPermits[0]);

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
      getApplicationsByStatus: async (_, { status, currentStage }) => {
         try {
            let query = {};
            if (status) query.status = status;
            if (currentStage) query.currentStage = currentStage;

            const permits = await Permit.find(query)
               .sort({ dateOfSubmission: -1 })
               .lean()
               .exec();

            const formattedPermits = permits.map(permit => ({
               ...permit,
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.toISOString(),
               currentStage: permit.currentStage || 'Submitted',
               recordedByReceivingClerk: permit.recordedByReceivingClerk || false,
               reviewedByChief: permit.reviewedByChief || false,
               history: permit.history || []
            }));

            console.log('Server: Fetched applications:', query);
            console.log('Server: Number of applications:', formattedPermits.length);
            console.log('Server: First application:', formattedPermits[0]);

            return formattedPermits;
         } catch (error) {
            console.error(`Error fetching permits:`, error);
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

         if (permit.status !== 'Draft') {
            throw new Error('Only draft permits can be submitted');
         }

         permit.status = 'Submitted';
         await permit.save();

         return permit;
      },
      updatePermitStage: async (_, { id, currentStage, status, notes }, context) => {
         const permit = await Permit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         permit.currentStage = currentStage;
         permit.status = status;
         permit.history.push({
            stage: currentStage,
            status: status,
            timestamp: new Date(),
            notes: notes || ''
         });

         try {
            await permit.save();
         } catch (error) {
            console.error('Error saving permit:', error);
            throw new Error(`Failed to update permit: ${error.message}`);
         }

         return {
            ...permit.toObject(),
            id: permit._id.toString(),
            dateOfSubmission: permit.dateOfSubmission.toISOString()
         };
      },
      recordApplication: async (_, { id }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to record an application');
         }

         const permit = await Permit.findById(id);
         if (!permit) {
            throw new Error('Permit not found');
         }

         permit.recordedByReceivingClerk = true;
         permit.history.push({
            stage: 'RecordedByReceivingClerk',
            status: permit.status,
            timestamp: new Date(),
            notes: 'Application recorded by receiving clerk',
            actionBy: user.id
         });

         await permit.save();

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
};

module.exports = permitResolvers;
