const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/signup – Add user
router.post('/signup', authController.signup);

// POST /api/auth/login – Login and generate token
router.post('/login', authController.login);

module.exports = router; 