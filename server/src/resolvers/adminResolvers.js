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
      getCurrentAdmin: async (_, __, { admin }) => {
         if (!admin) {
            throw new Error('Not authenticated');
         }

         const currentAdmin = await Admin.findById(admin.id);
         if (!currentAdmin) {
            throw new Error('Admin not found');
         }

         if (!currentAdmin.notificationPreferences) {
            currentAdmin.notificationPreferences = {
               email: false,
               inApp: true,
               sms: false
            };
            await currentAdmin.save();
         }

         return currentAdmin;
      }
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
            lastName,
            themePreference: 'light'
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
         // if (themePreference) updateData.themePreference = themePreference;

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
      updateAdminThemePreference: async (_, { theme }, context) => {
         console.log('Attempting to update admin theme with:', {
            theme,
            contextAdmin: context.admin,
            adminId: context.admin?.id
         });

         if (!context.admin) {
            console.log('No admin found in context');
            throw new Error('Not authenticated as admin');
         }

         if (!['light', 'dark', 'system'].includes(theme)) {
            console.log('Invalid theme value:', theme);
            throw new Error('Invalid theme preference');
         }

         try {
            console.log('Finding admin with ID:', context.admin.id);

            const updatedAdmin = await Admin.findByIdAndUpdate(
               context.admin.id,
               { themePreference: theme },
               { new: true, runValidators: true }
            );

            console.log('Update result:', updatedAdmin);

            if (!updatedAdmin) {
               console.log('No admin found with ID:', context.admin.id);
               throw new Error('Admin not found');
            }

            const result = {
               id: updatedAdmin._id,
               adminId: updatedAdmin.adminId,
               username: updatedAdmin.username,
               firstName: updatedAdmin.firstName,
               lastName: updatedAdmin.lastName,
               roles: updatedAdmin.roles,
               themePreference: updatedAdmin.themePreference
            };

            console.log('Returning updated admin:', result);
            return result;
         } catch (error) {
            console.error('Error updating admin theme:', error);
            throw new Error(`Failed to update theme: ${error.message}`);
         }
      },
      updateNotificationSettings: async (_, { preferences, email }, { admin }) => {
         if (!admin) {
            throw new Error('Not authenticated');
         }

         const updatedAdmin = await Admin.findByIdAndUpdate(
            admin.id,
            {
               $set: {
                  notificationPreferences: preferences,
                  email: email || ''
               }
            },
            { new: true, runValidators: true }
         );

         if (!updatedAdmin) {
            throw new Error('Admin not found');
         }

         return updatedAdmin;
      }
   }
};

module.exports = adminResolvers;
