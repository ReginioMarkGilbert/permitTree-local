const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Add this function at the top of the file
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, roles: user.roles },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1h' }
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
        profilePicture: user.profilePicture && user.profilePicture.data ? {
          data: user.profilePicture.data.toString('base64'),
          contentType: user.profilePicture.contentType
        } : null
      };
    },
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

        return {
          id: updatedUser._id,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          company: updatedUser.company,
          address: updatedUser.address,
          role: updatedUser.role,
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
  }
};

module.exports = userResolvers;
