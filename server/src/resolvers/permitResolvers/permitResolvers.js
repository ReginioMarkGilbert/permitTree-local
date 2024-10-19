const Permit = require('../../models/permits/Permit');

const permitResolvers = {
   Query: {
      getAllPermits: async () => {
         return await Permit.find().lean().exec();
      },
      getPermitById: async (_, { id }) => {
         return await Permit.findById(id).lean().exec();
      },
      getUserApplications: async (_, { status }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to view your applications');
         }

         let query = { applicantId: user.id };
         if (status) {
            query.status = status;
         }

         const permits = await Permit.find(query)
            .sort({ dateOfSubmission: -1 })
            .lean()
            .exec();

         const formattedPermits = permits.map(permit => ({
            ...permit,
            id: permit._id.toString(),
            dateOfSubmission: permit.dateOfSubmission.getTime()
         }));

         console.log('Permits fetched:', formattedPermits);

         return formattedPermits;
      },
   },
   Mutation: {
      updatePermitStatus: async (_, { id, status }) => {
         const updatedPermit = await Permit.findByIdAndUpdate(id, { status }, { new: true, lean: true });
         return {
            ...updatedPermit,
            id: updatedPermit._id.toString()
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
   },
};

module.exports = permitResolvers;
