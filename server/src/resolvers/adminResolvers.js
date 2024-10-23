const Admin = require('../models/admin');
const AdminIdCounter = require('../models/AdminIdCounter');
const bcrypt = require('bcrypt');

const adminResolvers = {
  Query: {
    getAdmin: async (_, { id }) => {
      return await Admin.findById(id);
    },
    getAllAdmins: async () => {
      return await Admin.find();
    },
  },
  Mutation: {
    createAdmin: async (_, { input }, context) => {
      const { username, password, roles, firstName, lastName } = input;

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
        roles,
        firstName,
        lastName
      });

      await newAdmin.save();

      return newAdmin;
    },
    updateAdmin: async (_, { id, input }) => {
      const { username, password, roles, firstName, lastName } = input;

      const updateData = {};
      if (username) updateData.username = username;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
      if (roles) updateData.roles = roles;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedAdmin) {
        throw new Error('Admin not found');
      }
      return updatedAdmin;
    },
    deleteAdmin: async (_, { id }) => {
      const result = await Admin.findByIdAndDelete(id);
      return !!result;
    },
  }
};

module.exports = adminResolvers;
