const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateUser } = require('../validators/user.validation');

// Get all users
router.get('/', protect, restrictTo('Admin'), usersController.getAllUsers);
// Get user by ID
router.get('/:id', protect, restrictTo('Admin'), usersController.getUserById);
// Create user
router.post('/', protect, restrictTo('Admin'), validateUser, usersController.createUser);
// Update user
router.put('/:id', protect, restrictTo('Admin'), validateUser, usersController.updateUser);
// Delete user
router.delete('/:id', protect, restrictTo('Admin'), usersController.deleteUser);

module.exports = router; 