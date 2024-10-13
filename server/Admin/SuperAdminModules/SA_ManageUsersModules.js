const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateSuperAdmin } = require('../../middleware/authMiddleware');
const { User } = require('../../User/modules/userAuthModule');
const { Admin } = require('../AdminModules/adminAuthModule');

// Schema
const SA_ManageUserSchema = new mongoose.Schema({
   userId: { type: Number, required: true, unique: true },
   username: { type: String, required: true, unique: true },
   firstName: { type: String, required: true },
   lastName: { type: String, required: true },
   email: { type: String, required: true, unique: true },
   phone: { type: String, required: false },
   company: { type: String, required: false },
   address: { type: String, required: false },
   role: {
      type: String,
      required: true,
      enum: [
         'user',
         'Chief_RPS',
         'superadmin',
         'Technical_Staff',
         'Chief_TSD',
         'Recieving_Clerk',
         'Releasing_Clerk',
         'Accountant',
         'Bill_Collector',
         'PENR_CENR_Officer'
      ]
   },
   userType: { type: String, required: true, enum: ['Client', 'Personnel'] }
}, { timestamps: true });

const SA_ManageUser = mongoose.model('SA_ManageUser', SA_ManageUserSchema);

// Routes
router.get('/users', authenticateSuperAdmin, async (req, res) => {
   try {
      const regularUsers = await User.find().select('-password');
      const adminUsers = await Admin.find().select('-password'); // This now includes both ChiefRPS and superadmin

      const allUsers = [
         ...regularUsers.map(user => ({
            ...user.toObject(),
            userType: 'Client'
         })),
         ...adminUsers.map(user => ({
            ...user.toObject(),
            userType: 'Personnel'
         }))
      ];

      res.json(allUsers);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error: error.message });
   }
});

router.get('/users/:id', authenticateSuperAdmin, async (req, res) => {
   try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error: error.message });
   }
});

router.post('/users', authenticateSuperAdmin, async (req, res) => {
   try {
      const { firstName, lastName, email, password, role, userType, username } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !role || !userType || !username) {
         return res.status(400).json({ message: 'All fields are required' });
      }

      let newUser;
      if (userType === 'Personnel' && (role === 'ChiefRPS' || role === 'superadmin')) {
         const lastAdmin = await Admin.findOne().sort({ adminId: -1 });
         const newAdminId = lastAdmin ? (lastAdmin.adminId || 0) + 1 : 1;

         newUser = new Admin({
            adminId: newAdminId,
            firstName,
            lastName,
            username,
            email,
            password,
            role: role,
         });
      } else {
         const lastUser = await User.findOne().sort({ userId: -1 });
         const newUserId = lastUser ? (lastUser.userId || 0) + 1 : 1;

         newUser = new User({
            userId: newUserId,
            firstName,
            lastName,
            username,
            email,
            password,
            role: 'user',
         });
      }

      await newUser.save();

      // Remove password from the response
      const userResponse = newUser.toObject();
      delete userResponse.password;

      res.status(201).json(userResponse);
   } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ message: 'Error creating user', error: error.message });
   }
});

router.put('/users/:id', authenticateSuperAdmin, async (req, res) => {
   try {
      const { id } = req.params;
      const { userType, ...updateData } = req.body;

      let updatedUser;
      if (userType === 'Personnel') {
         updatedUser = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
      } else {
         updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
      }

      if (!updatedUser) {
         return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
   } catch (error) {
      res.status(400).json({ message: 'Error updating user', error: error.message });
   }
});

router.delete('/users/:id', authenticateSuperAdmin, async (req, res) => {
   try {
      const { id } = req.params;
      const user = await User.findById(id);
      const admin = await Admin.findById(id);

      if (user) {
         await User.findByIdAndDelete(id);
      } else if (admin) {
         await Admin.findByIdAndDelete(id);
      } else {
         return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error: error.message });
   }
});

module.exports = {
   router,
   SA_ManageUser
};
