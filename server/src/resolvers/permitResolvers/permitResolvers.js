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
         console.log('getUserApplications called with status:', status);
         console.log('User from context:', user);

         if (!user) {
            console.log('No user found in context');
            throw new Error('You must be logged in to view your applications');
         }

         let query = { applicantId: user.id };
         if (status) {
            query.status = status;
         }
         console.log('Query:', query);

         try {
            const permits = await Permit.find(query)
               .sort({ dateOfSubmission: -1 })
               .lean()
               .exec();

            console.log('Permits found:', permits.length);
            console.log('First permit:', permits[0]);

            const formattedPermits = permits.map(permit => ({
               ...permit,
               id: permit._id.toString(),
               dateOfSubmission: permit.dateOfSubmission.getTime()
            }));

            console.log('Formatted permits:', formattedPermits);

            return formattedPermits;
         } catch (error) {
            console.error('Error fetching permits:', error);
            throw new Error(`Failed to fetch permits: ${error.message}`);
         }
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
