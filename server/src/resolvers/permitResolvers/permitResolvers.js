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
   },
};

module.exports = permitResolvers;
