const Admin = require('../models/admin');
const AdminIdCounter = require('../models/AdminIdCounter');

const adminResolvers = {
  Query: {
    getAdmin: async (_, { id }) => {
      return await Admin.findById(id);
    },
  },
  Mutation: {
    createAdmin: async (_, { input }, context) => {
      const { username, password, role, firstName, lastName } = input;

      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        throw new Error('Username already exists');
      }

      const adminIdCounter = await AdminIdCounter.findOneAndUpdate(
        { name: 'adminId' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );

      const newAdmin = new Admin({
        adminId: adminIdCounter.value,
        username,
        password,
        role,
        firstName,
        lastName
      });

      await newAdmin.save();

      return newAdmin;
    },
  }
};

module.exports = adminResolvers;
