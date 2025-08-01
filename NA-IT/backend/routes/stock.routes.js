const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.get('/', protect, restrictTo('Admin', 'Operator'), stockController.getAllStock);
router.get('/:id', protect, restrictTo('Admin', 'Operator'), stockController.getStockById);
router.post('/', protect, restrictTo('Admin', 'Operator'), stockController.createStock);
router.put('/:id', protect, restrictTo('Admin', 'Operator'), stockController.updateStock);
router.delete('/:id', protect, restrictTo('Admin', 'Operator'), stockController.deleteStock);

module.exports = router; 