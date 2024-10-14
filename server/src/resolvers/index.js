const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const resolvers = {
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
      getAdmin: async (_, { id }) => {
         return await Admin.findById(id);
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

         return { token, user };
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
      createAdmin: async (_, { username, password, role, firstName, lastName }) => {
         const existingAdmin = await Admin.findOne({ username });
         if (existingAdmin) {
            throw new Error('Admin username already exists');
         }

         const hashedPassword = await bcrypt.hash(password, 10);
         const admin = new Admin({
            username,
            password: hashedPassword,
            role,
            firstName,
            lastName
         });

         await admin.save();
         return admin;
      }
   }
};

module.exports = resolvers;
