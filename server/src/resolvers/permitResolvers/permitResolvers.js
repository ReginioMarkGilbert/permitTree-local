const Permit = require('../../models/permits/Permit');

const permitResolvers = {
   Query: {
      getAllPermits: async () => {
         return await Permit.find();
      },
      getPermitById: async (_, { id }) => {
         return await Permit.findById(id);
      },
   },
   Mutation: {
      updatePermitStatus: async (_, { id, status }) => {
         return await Permit.findByIdAndUpdate(id, { status }, { new: true });
      },
   },
};

module.exports = permitResolvers;
