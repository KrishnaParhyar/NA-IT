const express = require('express');
const router = express.Router();
const designationsController = require('../controllers/designations.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateDesignation } = require('../validators/designation.validation');

router.get('/', protect, restrictTo('Admin', 'Operator'), designationsController.getAllDesignations);
router.get('/:id', protect, restrictTo('Admin', 'Operator'), designationsController.getDesignationById);
router.post('/', protect, restrictTo('Admin', 'Operator'), validateDesignation, designationsController.createDesignation);
router.put('/:id', protect, restrictTo('Admin', 'Operator'), validateDesignation, designationsController.updateDesignation);
router.delete('/:id', protect, restrictTo('Admin', 'Operator'), designationsController.deleteDesignation);

module.exports = router; 