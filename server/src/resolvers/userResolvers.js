const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Add this function at the top of the file
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
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
      if (user.profilePicture && user.profilePicture.data) {
        user.profilePicture = `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}`;
      }
      return user;
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
          role: 'user' // Explicitly set the role to 'user'
        });

        await newUser.save();

        const token = generateToken(newUser);

        return {
          token,
          user: newUser
        };
      } catch (error) {
        throw new Error(`Failed to register user: ${error.message}`);
      }
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
  }
};

module.exports = userResolvers;
