const OOP = require('../models/OOP');

const oopResolvers = {
  Query: {
    getAllOOPs: async () => {
      return await OOP.find();
    },
    getOOPById: async (_, { id }) => {
      return await OOP.findById(id);
    },
  },
  Mutation: {
    createOOP: async (_, { input }) => {
      const newOOP = new OOP(input);
      return await newOOP.save();
    },
    updateOOP: async (_, { id, input }) => {
      return await OOP.findByIdAndUpdate(id, input, { new: true });
    },
  },
};

module.exports = oopResolvers;
