const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/admin');

const authResolvers = {
  Mutation: {
    login: async (_, { username, password }) => {
      console.log('Login attempt for username:', username);
      let user = await User.findOne({ username });
      if (!user) {
        console.log('User not found in User model, checking Admin model');
        user = await Admin.findOne({ username });
      }

      if (!user) {
        console.log('User not found in either model');
        throw new Error('Invalid credentials');
      }

      const isValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValid);

      if (!isValid) {
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
    logout: async (_, __, context) => {
      // Here you would typically invalidate the token on the server side
      // For now, we'll just return true to indicate successful logout
      return true;
    },
  }
};

module.exports = authResolvers;
