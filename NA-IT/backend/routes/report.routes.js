const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');

// GET /api/reports/stock – Total items available
router.get('/stock', protect, restrictTo('Admin', 'Operator', 'Management'), reportController.getStockReport);

// GET /api/reports/items/:category – Items by type
router.get('/items/:category', protect, restrictTo('Admin', 'Operator', 'Management'), reportController.getItemsByCategory);

// GET /api/reports/model/:model – Items by model
router.get('/model/:model', protect, restrictTo('Admin', 'Operator', 'Management'), reportController.getItemsByModel);

// GET /api/reports/employee/:id – Items issued to an employee
router.get('/employee/:id', protect, restrictTo('Admin', 'Operator', 'Management'), reportController.getItemsByEmployee);

// GET /api/reports/transactions – Date-wise logs
router.get('/transactions', protect, restrictTo('Admin', 'Operator', 'Management'), reportController.getTransactions);

module.exports = router; 