const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departments.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateDepartment } = require('../validators/department.validation');

router.get('/', protect, restrictTo('Admin', 'Operator'), departmentsController.getAllDepartments);
router.get('/:id', protect, restrictTo('Admin', 'Operator'), departmentsController.getDepartmentById);
router.post('/', protect, restrictTo('Admin', 'Operator'), validateDepartment, departmentsController.createDepartment);
router.put('/:id', protect, restrictTo('Admin', 'Operator'), validateDepartment, departmentsController.updateDepartment);
router.delete('/:id', protect, restrictTo('Admin', 'Operator'), departmentsController.deleteDepartment);

module.exports = router; 