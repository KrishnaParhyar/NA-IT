const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateItem, validateItemUpdate } = require('../validators/item.validation');

// Routes
router
  .route('/')
  .get(protect, restrictTo('Admin', 'Operator', 'Management'), itemController.getAllItems)
  .post(protect, restrictTo('Admin', 'Operator'), validateItem, itemController.createItem);

router
  .route('/:id')
  .get(protect, restrictTo('Admin', 'Operator', 'Management'), itemController.getItemById)
  .put(protect, restrictTo('Admin', 'Operator'), validateItemUpdate, itemController.updateItem)
  .delete(protect, restrictTo('Admin'), itemController.deleteItem);

module.exports = router; 