const TCEBPPermit = require('../../models/permits/TCEBPPermit');

const tcebpResolvers = {
   Query: {
      getAllTCEBPPermits: async () => {
         return await TCEBPPermit.find();
      },
      getTCEBPPermitById: async (_, { id }) => {
         return await TCEBPPermit.findById(id);
      },
   },
   Mutation: {
      createTCEBPPermit: async (_, { input }) => {
         const newPermit = new TCEBPPermit(input);
         return await newPermit.save();
      },
      updateTCEBPPermit: async (_, { id, input }) => {
         return await TCEBPPermit.findByIdAndUpdate(id, input, { new: true });
      },
   },
};

module.exports = tcebpResolvers;
