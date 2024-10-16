const SPLTPPermit = require('../../models/permits/SPLTPPermit');

const spltpResolvers = {
   Query: {
      getAllSPLTPPermits: async () => {
         return await SPLTPPermit.find();
      },
      getSPLTPPermitById: async (_, { id }) => {
         return await SPLTPPermit.findById(id);
      },
   },
   Mutation: {
      createSPLTPPermit: async (_, { input }) => {
         const newPermit = new SPLTPPermit(input);
         return await newPermit.save();
      },
      updateSPLTPPermit: async (_, { id, input }) => {
         return await SPLTPPermit.findByIdAndUpdate(id, input, { new: true });
      },
   },
};

module.exports = spltpResolvers;
