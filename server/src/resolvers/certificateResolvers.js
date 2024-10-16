const Certificate = require('../models/Certificate');

const certificateResolvers = {
  Query: {
    getAllCertificates: async () => {
      return await Certificate.find();
    },
    getCertificateById: async (_, { id }) => {
      return await Certificate.findById(id);
    },
  },
  Mutation: {
    createCertificate: async (_, { input }) => {
      const newCertificate = new Certificate(input);
      return await newCertificate.save();
    },
    updateCertificate: async (_, { id, input }) => {
      return await Certificate.findByIdAndUpdate(id, input, { new: true });
    },
  },
};

module.exports = certificateResolvers;
