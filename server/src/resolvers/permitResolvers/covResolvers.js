const COVPermit = require('../../models/permits/COVPermit');

const covResolvers = {
   Query: {
      getAllCOVPermits: async () => {
         return await COVPermit.find();
      },
      getCOVPermitById: async (_, { id }) => {
         return await COVPermit.findById(id);
      },
   },
   Mutation: {
      createCOVPermit: async (_, { input }) => {
         const newPermit = new COVPermit(input);
         return await newPermit.save();
      },
      updateCOVPermit: async (_, { id, input }) => {
         return await COVPermit.findByIdAndUpdate(id, input, { new: true });
      },
   },
};

module.exports = covResolvers;
