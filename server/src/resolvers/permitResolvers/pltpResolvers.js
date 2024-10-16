const PLTPPermit = require('../../models/permits/PLTPPermit');

const pltpResolvers = {
   Query: {
      getAllPLTPPermits: async () => {
         return await PLTPPermit.find();
      },
      getPLTPPermitById: async (_, { id }) => {
         return await PLTPPermit.findById(id);
      },
   },
   Mutation: {
      createPLTPPermit: async (_, { input }) => {
         const newPermit = new PLTPPermit(input);
         return await newPermit.save();
      },
      updatePLTPPermit: async (_, { id, input }) => {
         return await PLTPPermit.findByIdAndUpdate(id, input, { new: true });
      },
   },
};

module.exports = pltpResolvers;
