const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const searchController = require('../controllers/search.controller');

// GET /api/search?keyword=laptop&brand=Dell&employee=123
router.get('/', protect, restrictTo('Admin', 'Operator', 'Management'), searchController.searchItems);

module.exports = router; 