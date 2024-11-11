const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Add this function at the top of the file
const generateToken = (user) => {
   return jwt.sign(
      { id: user.id, username: user.username, roles: user.roles },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '12h' }
   );
};

const userResolvers = {
   Query: {
      me: async (_, __, context) => {
         if (!context.user) {
            throw new Error('Not authenticated');
         }
         return context.user;
      },
      getUser: async (_, { id }) => {
         return await User.findById(id);
      },
      getUserDetails: async (_, __, context) => {
         if (!context.user) {
            throw new Error('Not authenticated');
         }
         const user = await User.findById(context.user.id);
         if (!user) {
            throw new Error('User not found');
         }

         // Fetch recent activities
         const recentActivities = await UserActivity.find({ userId: user._id })
            .sort({ timestamp: -1 })
            .limit(5);

         return {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            company: user.company,
            address: user.address,
            roles: user.roles,
            lastPasswordChange: user.lastPasswordChange.toISOString(),
            recentActivities: recentActivities.map(activity => ({
               id: activity._id,
               type: activity.type,
               timestamp: activity.timestamp.toISOString(),
               details: activity.details
            })),
            profilePicture: user.profilePicture && user.profilePicture.data ? {
               data: user.profilePicture.data.toString('base64'),
               contentType: user.profilePicture.contentType
            } : null
         };
      },
      getCurrentUser: async (_, __, { req }) => {
         if (!req.user) {
            throw new Error('Not authenticated');
         }
         return await User.findById(req.user._id);
      },
      getUserActivities: async (_, { limit = 10 }, context) => {
         if (!context.user) {
            throw new Error('Not authenticated');
         }

         const activities = await UserActivity.find({ userId: context.user.id })
            .sort({ timestamp: -1 })
            .limit(limit);

         return activities.map(activity => ({
            id: activity._id,
            type: activity.type,
            timestamp: activity.timestamp.toISOString(),
            details: activity.details
         }));
      }
   },
   Mutation: {
      registerUser: async (_, { firstName, lastName, username, password }) => {
         try {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
               throw new Error('Username already exists');
            }

            const newUser = new User({
               firstName,
               lastName,
               username,
               password,
               roles: ['user'] // Default role for new users
            });

            await newUser.save();

            const token = generateToken(newUser);

            return {
               token,
               user: {
                  id: newUser.id,
                  username: newUser.username,
                  firstName: newUser.firstName,
                  lastName: newUser.lastName,
                  roles: newUser.roles
               }
            };
         } catch (error) {
            throw new Error(`Failed to register user: ${error.message}`);
         }
      },
      updateUserProfile: async (_, { input }, context) => {
         if (!context.user) {
            throw new Error('Not authenticated');
         }
         try {
            const userId = context.user.id;
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
                  data: Buffer.from(profilePicture.data, 'base64'),
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

            // Log the activity
            await UserActivity.create({
               userId: context.user.id,
               type: 'PROFILE_UPDATE',
               details: 'Profile information updated'
            });

            return {
               id: updatedUser._id,
               username: updatedUser.username,
               firstName: updatedUser.firstName,
               lastName: updatedUser.lastName,
               email: updatedUser.email,
               phone: updatedUser.phone,
               company: updatedUser.company,
               address: updatedUser.address,
               roles: updatedUser.roles,
               profilePicture: updatedUser.profilePicture && updatedUser.profilePicture.data ? {
                  data: updatedUser.profilePicture.data.toString('base64'),
                  contentType: updatedUser.profilePicture.contentType
               } : null
            };
         } catch (error) {
            console.error('Error updating user profile:', error);
            throw new Error('Error updating user profile: ' + error.message);
         }
      },
      changePassword: async (_, { input }, context) => {
         if (!context.user) {
            throw new Error('Not authenticated');
         }

         const { currentPassword, newPassword, confirmPassword } = input;

         if (newPassword !== confirmPassword) {
            throw new Error('New password and confirm password do not match');
         }

         try {
            const user = await User.findById(context.user.id);
            if (!user) {
               throw new Error('User not found');
            }

            // Use the comparePassword method
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
               throw new Error('Current password is incorrect');
            }

            // Set the new password - the pre-save hook will hash it
            user.password = newPassword;
            await user.save();

            // Log the activity
            await UserActivity.create({
               userId: context.user.id,
               type: 'PASSWORD_CHANGE',
               details: 'Password was changed'
            });

            return true;
         } catch (error) {
            console.error('Error changing password:', error);
            throw new Error(error.message || 'Failed to change password');
         }
      },
   }
};

module.exports = userResolvers;
