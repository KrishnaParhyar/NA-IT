const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateCategory } = require('../validators/category.validation');

// GET /api/categories - Get all categories
router.get('/', protect, categoryController.getAllCategories);
router.post('/', protect, restrictTo('Admin', 'Operator'), validateCategory, categoryController.createCategory);

// Parameterized routes (put these after the specific routes)
router.get('/:id', protect, categoryController.getCategoryById);
router.put('/:id', protect, restrictTo('Admin', 'Operator'), validateCategory, categoryController.updateCategory);
router.delete('/:id', protect, restrictTo('Admin'), categoryController.deleteCategory);

module.exports = router; 