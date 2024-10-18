const Permit = require('../../models/permits/Permit');

const permitResolvers = {
   Query: {
      getAllPermits: async () => {
         return await Permit.find();
      },
      getPermitById: async (_, { id }) => {
         return await Permit.findById(id);
      },
      getUserApplications: async (_, { status }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to view your applications');
         }

         let query = { applicantId: user.id };
         if (status) {
            query.status = status;
         }

         const permits = await Permit.find(query).sort({ dateOfSubmission: -1 });
         return permits;
      },
   },
   Mutation: {
      updatePermitStatus: async (_, { id, status }) => {
         return await Permit.findByIdAndUpdate(id, { status }, { new: true });
      },
   },
};

module.exports = permitResolvers;
