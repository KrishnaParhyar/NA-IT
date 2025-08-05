const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employees.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateEmployee } = require('../validators/employee.validation');

router.get('/', protect, restrictTo('Admin', 'Operator', 'Management'), employeesController.getAllEmployees);
router.get('/:id', protect, restrictTo('Admin', 'Operator', 'Management'), employeesController.getEmployeeById);
router.post('/', protect, restrictTo('Admin', 'Operator'), validateEmployee, employeesController.createEmployee);
router.put('/:id', protect, restrictTo('Admin', 'Operator'), validateEmployee, employeesController.updateEmployee);
router.delete('/:id', protect, restrictTo('Admin', 'Operator'), employeesController.deleteEmployee);
router.get('/unique/departments', protect, restrictTo('Admin', 'Operator', 'Management'), employeesController.getUniqueDepartments);
router.get('/unique/designations', protect, restrictTo('Admin', 'Operator', 'Management'), employeesController.getUniqueDesignations);

module.exports = router; 