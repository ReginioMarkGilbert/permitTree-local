const PTPRPermit = require('../../models/permits/PTPRPermit');

const ptprResolvers = {
   Query: {
      getAllPTPRPermits: async () => {
         return await PTPRPermit.find();
      },
      getPTPRPermitById: async (_, { id }) => {
         return await PTPRPermit.findById(id);
      },
   },
   Mutation: {
      createPTPRPermit: async (_, { input }) => {
         const newPermit = new PTPRPermit(input);
         return await newPermit.save();
      },
      updatePTPRPermit: async (_, { id, input }) => {
         return await PTPRPermit.findByIdAndUpdate(id, input, { new: true });
      },
   },
};

module.exports = ptprResolvers;
