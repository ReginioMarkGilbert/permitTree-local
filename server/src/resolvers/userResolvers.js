const User = require('../models/User');
const Admin = require('../models/admin');
const UserActivity = require('../models/UserActivity');
const { OOP } = require('../models/OOP');
const Permit = require('../models/permits/Permit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { logUserActivity } = require('../utils/activityLogger');

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
         try {
            const user = await User.findById(id);
            if (!user) {
               throw new Error('User not found');
            }
            return {
               ...user.toObject(),
               createdAt: user.createdAt.toISOString(),
               lastLoginDate: user.lastLoginDate ? user.lastLoginDate.toISOString() : null
            };
         } catch (error) {
            throw new Error(`Error fetching user: ${error.message}`);
         }
      },
      getUserDetails: async (_, __, context) => {
         if (!context.user) {
            throw new Error('Not authenticated');
         }
         const user = await User.findById(context.user.id);
         if (!user) {
            throw new Error('User not found');
         }

         // Get stats
         const stats = await userResolvers.Query.getUserStats(_, __, context);

         // Get the most recent activity of each type
         const recentActivities = await UserActivity.aggregate([
            { $match: { userId: user._id } },
            { $sort: { timestamp: -1 } },
            {
               $group: {
                  _id: '$type',
                  id: { $first: '$_id' },
                  type: { $first: '$type' },
                  timestamp: { $first: '$timestamp' },
                  details: { $first: '$details' }
               }
            },
            { $limit: 2 } // Limit to 2 most recent unique activities
         ]);

         return {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            company: user.company,
            address: user.address,
            roles: user.roles,
            lastPasswordChange: user.lastPasswordChange.toISOString(),
            recentActivities: recentActivities.map(activity => ({
               id: activity.id,
               type: activity.type,
               timestamp: activity.timestamp.toISOString(),
               details: activity.details
            })),
            stats,
            profilePicture: user.profilePicture && user.profilePicture.data ? {
               data: user.profilePicture.data.toString('base64'),
               contentType: user.profilePicture.contentType
            } : null
         };
      },
      getCurrentUser: async (_, __, context) => {
         if (!context.user) {
            return null;
         }
         try {
            const user = await User.findById(context.user.id);
            if (!user) {
               return null;
            }
            return {
               id: user._id,
               username: user.username,
               firstName: user.firstName,
               lastName: user.lastName,
               email: user.email,
               roles: user.roles,
               themePreference: user.themePreference,
               profilePicture: user.profilePicture && user.profilePicture.data ? {
                  data: user.profilePicture.data.toString('base64'),
                  contentType: user.profilePicture.contentType
               } : null
            };
         } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
         }
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
      },
      getUserStats: async (_, __, context) => {
         if (!context.user) {
            throw new Error('Not authenticated');
         }

         try {
            // Get total applications
            const totalApplications = await Permit.countDocuments({
               applicantId: context.user.id
            });

            // Get active permits (status is 'Approved' or 'Released')
            const activePermits = await Permit.countDocuments({
               applicantId: context.user.id,
               status: { $in: ['Approved', 'Released'] }
            });

            // Get pending payments (OOPs with status 'Awaiting Payment')
            const pendingPayments = await OOP.countDocuments({
               userId: context.user.id,
               OOPstatus: 'Awaiting Payment'
            });

            return {
               totalApplications,
               activePermits,
               pendingPayments
            };
         } catch (error) {
            console.error('Error fetching user stats:', error);
            throw new Error('Failed to fetch user statistics');
         }
      },
      users: async (_, __, { admin }) => {
         if (!admin || !admin.roles.includes('superadmin')) {
            throw new Error('Not authorized to view all users');
         }
         try {
            // Fetch regular users
            const regularUsers = await User.find({}).select('+createdAt +lastLoginDate');

            // Fetch admin/personnel users
            const adminUsers = await Admin.find({}).select('+createdAt +lastLoginDate');

            // Combine and format both sets of users
            const allUsers = [
               ...regularUsers.map(user => ({
                  id: user._id.toString(),
                  ...user.toObject(),
                  _id: undefined,
                  createdAt: user.createdAt?.toISOString(),
                  lastLoginDate: user.lastLoginDate?.toISOString(),
                  userType: 'Client'
               })),
               ...adminUsers.map(admin => ({
                  id: admin._id.toString(),
                  ...admin.toObject(),
                  _id: undefined,
                  createdAt: admin.createdAt?.toISOString(),
                  lastLoginDate: admin.lastLoginDate?.toISOString(),
                  userType: 'Personnel'
               }))
            ];

            // Ensure all required fields are present
            return allUsers.map(user => ({
               id: user.id,
               username: user.username || '',
               firstName: user.firstName || '',
               lastName: user.lastName || '',
               email: user.email || '',
               phone: user.phone || '',
               company: user.company || '',
               address: user.address || '',
               roles: user.roles || [],
               userType: user.userType || 'Client',
               isActive: typeof user.isActive === 'boolean' ? user.isActive : true,
               lastLoginDate: user.lastLoginDate || null,
               createdAt: user.createdAt || null,
               updatedAt: user.updatedAt || null
            }));

         } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to fetch users');
         }
      },
   },
   Mutation: {
      registerUser: async (_, { firstName, lastName, username, password, email, role, userType }) => {
         try {
            const existingUser = await User.findOne({ username });
            const existingAdmin = await Admin.findOne({ username });

            if (existingUser || existingAdmin) {
               throw new Error('Username already exists');
            }

            // Determine if the role is a personnel role
            const personnelRoles = [
               'Chief_RPS',
               'superadmin',
               'Technical_Staff',
               'Chief_TSD',
               'Receiving_Clerk',
               'Releasing_Clerk',
               'Accountant',
               'OOP_Staff_Incharge',
               'Bill_Collector',
               'Credit_Officer',
               'PENR_CENR_Officer',
               'Deputy_CENR_Officer',
               'Inspection_Team'
            ];

            const isPersonnel = personnelRoles.includes(role);

            let newUser;

            if (isPersonnel) {
               // Create admin account
               newUser = new Admin({
                  firstName,
                  lastName,
                  username,
                  password,
                  email,
                  roles: [role],
                  notificationPreferences: {
                     email: false,
                     inApp: true,
                     sms: false
                  }
               });
            } else {
               // Create regular user account
               newUser = new User({
                  firstName,
                  lastName,
                  username,
                  password,
                  email,
                  roles: [role],
                  userType,
                  isActive: true,
                  createdAt: new Date(),
                  lastLoginDate: null
               });
            }

            await newUser.save();

            // Log the activity
            await logUserActivity({
               userId: newUser._id,
               userModel: isPersonnel ? 'Admin' : 'User',
               type: 'ACCOUNT_CREATED',
               details: 'New user account created',
               metadata: {
                  userType: userType,
                  isAdmin: isPersonnel
               }
            });

            const token = jwt.sign(
               { id: newUser.id, username: newUser.username, roles: newUser.roles },
               process.env.JWT_SECRET || 'default_secret',
               { expiresIn: '12h' }
            );

            return {
               token,
               user: {
                  id: newUser.id,
                  username: newUser.username,
                  firstName: newUser.firstName,
                  lastName: newUser.lastName,
                  email: newUser.email,
                  roles: newUser.roles,
                  userType: userType,
                  isActive: true,
                  createdAt: newUser.createdAt
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
            const { firstName, lastName, username, email, phone, company, address, removeProfilePicture, profilePicture, themePreference, ...otherInputs } = input;

            if (username) {
               const existingUser = await User.findOne({
                  username,
                  _id: { $ne: userId } // Exclude current user
               });
               if (existingUser) {
                  throw new Error('Username already exists');
               }
            }

            const updateData = {
               firstName,
               lastName,
               username,
               email,
               phone,
               company,
               address,
               ...(themePreference && { themePreference })
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
            await logUserActivity({
               userId: context.user.id,
               type: 'PROFILE_UPDATE',
               details: 'User updated their profile information',
               metadata: {
                  updatedFields: Object.keys(input).join(', ')
               }
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
            await logUserActivity({
               userId: context.user.id,
               type: 'PASSWORD_CHANGE',
               details: 'User changed their password'
            });

            return true;
         } catch (error) {
            console.error('Error changing password:', error);
            throw new Error(error.message || 'Failed to change password');
         }
      },
      updateThemePreference: async (_, { theme }, context) => {
         if (!context.user) {
            throw new Error('Not authenticated');
         }

         if (!['light', 'dark', 'system'].includes(theme)) {
            throw new Error('Invalid theme preference');
         }

         try {
            const updatedUser = await User.findByIdAndUpdate(
               context.user.id,
               { themePreference: theme },
               { new: true, runValidators: true }
            );

            if (!updatedUser) {
               throw new Error('User not found');
            }

            console.log('Updated user theme preference:', {
               userId: updatedUser._id,
               theme: updatedUser.themePreference
            });

            return updatedUser;
         } catch (error) {
            console.error('Error updating theme preference:', error);
            throw new Error(`Failed to update theme: ${error.message}`);
         }
      },
      deactivateUser: async (_, { id }, { admin }) => {
         // Check if requester is a superadmin
         if (!admin || !admin.roles.includes('superadmin')) {
            throw new Error('Not authorized to deactivate users');
         }

         const user = await User.findById(id);
         if (!user) {
            throw new Error('User not found');
         }

         user.isActive = false;
         await user.save();

         return user;
      },
      activateUser: async (_, { id }, { admin }) => {
         // Check if requester is a superadmin
         if (!admin || !admin.roles.includes('superadmin')) {
            throw new Error('Not authorized to activate users');
         }

         const user = await User.findById(id);
         if (!user) {
            throw new Error('User not found');
         }

         user.isActive = true;
         await user.save();

         return user;
      },
      deleteUser: async (_, { id }, context) => {
         try {
            // Check if user exists
            const userToDelete = await User.findById(id);
            if (!userToDelete) {
               throw new Error('User not found');
            }

            // Delete the user
            const deletedUser = await User.findByIdAndDelete(id);

            if (!deletedUser) {
               throw new Error('Failed to delete user');
            }

            return {
               id: deletedUser._id,
               username: deletedUser.username,
               firstName: deletedUser.firstName,
               lastName: deletedUser.lastName,
               email: deletedUser.email,
               roles: deletedUser.roles,
               isActive: deletedUser.isActive,
               userType: deletedUser.userType
            };
         } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
         }
      },
   }
};

module.exports = userResolvers;
