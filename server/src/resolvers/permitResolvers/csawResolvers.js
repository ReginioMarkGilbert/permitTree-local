const CSAWPermit = require('../../models/permits/CSAWPermit');

const csawResolvers = {
   Query: {
      getAllCSAWPermits: async () => {
         return await CSAWPermit.find();
      },
      getCSAWPermitById: async (_, { id }) => {
         return await CSAWPermit.findById(id);
      },
   },
   Mutation: {
      createCSAWPermit: async (_, { input }) => {
         const newPermit = new CSAWPermit(input);
         return await newPermit.save();
      },
      updateCSAWPermit: async (_, { id, input }) => {
         return await CSAWPermit.findByIdAndUpdate(id, input, { new: true });
      },
   },
};

module.exports = csawResolvers;
