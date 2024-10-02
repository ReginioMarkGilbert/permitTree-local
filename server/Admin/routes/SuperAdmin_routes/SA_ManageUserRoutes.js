const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, createUser, updateUser, deleteUser } = require('../../controllers/SuperAdmin_controllers/SA_ManageUserControllers');
const { authenticateSuperAdmin } = require('../../../middleware/authMiddleware');

// Get all users
router.get('/users', getAllUsers);

// Get a single user
router.get('/users/:id', getUser);

// Create a new user
router.post('/users', createUser);

// Update a user
router.put('/users/:id', updateUser);

// Delete a user
router.delete('/users/:id', deleteUser);

module.exports = router;
