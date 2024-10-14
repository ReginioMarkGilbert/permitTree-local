const User = require('../models/User');
const jwt = require('jsonwebtoken');

const userResolvers = {
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
    registerUser: async (_, { firstName, lastName, username, password }) => {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      const user = new User({
        username,
        password,
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
