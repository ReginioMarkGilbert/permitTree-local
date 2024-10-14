const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { GraphQLUpload } = require('graphql-upload-minimal');
const fs = require('fs').promises;
const path = require('path');
const AdminIdCounter = require('../models/AdminIdCounter'); // You'll need to create this model

const getContentType = (filename) => {
   const ext = path.extname(filename).toLowerCase();
   switch (ext) {
      case '.jpg':
      case '.jpeg':
         return 'image/jpeg';
      case '.png':
         return 'image/png';
      case '.gif':
         return 'image/gif';
      default:
         return 'application/octet-stream';
   }
};

const resolvers = {
   Upload: GraphQLUpload,
   Query: {
      me: async (_, __, context) => {
         if (!context.token) {
            throw new Error('Not authenticated');
         }
         try {
            const decoded = jwt.verify(context.token.replace('Bearer ', ''), process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
               throw new Error('User not found');
            }
            return user;
         } catch (error) {
            throw new Error('Invalid token');
         }
      },
      getUser: async (_, { id }) => {
         return await User.findById(id);
      },
      getAdmin: async (_, { id }) => {
         return await Admin.findById(id);
      },
      getUserDetails: async (_, __, context) => {
         if (!context.token) {
            throw new Error('Not authenticated');
         }
         try {
            const decoded = jwt.verify(context.token.replace('Bearer ', ''), process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
               throw new Error('User not found');
            }
            if (user.profilePicture && user.profilePicture.data) {
               user.profilePicture = `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}`;
            }
            return user;
         } catch (error) {
            throw new Error('Invalid token');
         }
      },
   },
   Mutation: {
      login: async (_, { username, password }) => {
         let user = await User.findOne({ username });
         if (!user) {
            user = await Admin.findOne({ username });
         }

         if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
         }

         const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
         );

         return {
            token,
            user: {
               id: user.id,
               username: user.username,
               firstName: user.firstName,
               lastName: user.lastName,
               role: user.role
            }
         };
      },
      registerUser: async (_, { firstName, lastName, username, password }) => {
         const existingUser = await User.findOne({ username });
         if (existingUser) {
            throw new Error('Username already exists');
         }

         const user = new User({
            username,
            password, // bcrypt will hash this in the pre-save hook
            firstName,
            lastName,
            role: 'user'
         });

         await user.save();

         const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
         );

         return { token, user };
      },
      createAdmin: async (_, { input }, context) => {
         // Remove or modify this check based on your requirements
         // For now, we'll comment it out to allow admin creation
         // if (!context.user || context.user.role !== 'superadmin') {
         //   throw new Error('Not authorized to create admin accounts');
         // }

         const { username, password, role, firstName, lastName } = input;

         // Check if the username already exists
         const existingAdmin = await Admin.findOne({ username });
         if (existingAdmin) {
            throw new Error('Username already exists');
         }

         // Generate a new adminId
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
      updateUserProfile: async (_, { input }, context) => {
         if (!context.token) {
            throw new Error('Not authenticated');
         }
         try {
            const decoded = jwt.verify(context.token.replace('Bearer ', ''), process.env.JWT_SECRET);
            const userId = decoded.id;

            const { firstName, lastName, email, phone, company, address, removeProfilePicture, profilePicture } = input;

            const updateData = {
               firstName,
               lastName,
               email,
               phone,
               company,
               address
            };

            if (removeProfilePicture) {
               updateData.profilePicture = null;
            } else if (profilePicture) {
               updateData.profilePicture = {
                  data: profilePicture.data,
                  contentType: profilePicture.contentType
               };
            }

            const updatedUser = await User.findByIdAndUpdate(
               userId,
               updateData,
               { new: true }
            );

            if (!updatedUser) {
               throw new Error('User not found');
            }

            return updatedUser;
         } catch (error) {
            throw new Error('Error updating user profile: ' + error.message);
         }
      },
      logout: async (_, __, context) => {
         // Here you would typically invalidate the token on the server side
         // For now, we'll just return true to indicate successful logout
         return true;
      }
   }
};

module.exports = resolvers;
