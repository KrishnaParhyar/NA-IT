const db = require('../config/db');

// Create a new employee
exports.createEmployee = async (employee) => {
  const { employee_name, department_id, designation_id } = employee;
  const sql = 'INSERT INTO employees (employee_name, department_id, designation_id) VALUES (?, ?, ?)';
  return db.query(sql, [employee_name, department_id, designation_id]);
};

// Get employee by ID
exports.getEmployeeById = async (employee_id) => {
  const sql = 'SELECT * FROM employees WHERE employee_id = ?';
  return db.query(sql, [employee_id]);
};

// Get all employees
exports.getAllEmployees = async () => {
  const sql = 'SELECT * FROM employees';
  return db.query(sql);
};

// Update employee
exports.updateEmployee = async (employee_id, employee) => {
  const { employee_name, department_id, designation_id } = employee;
  const sql = 'UPDATE employees SET employee_name = ?, department_id = ?, designation_id = ? WHERE employee_id = ?';
  return db.query(sql, [employee_name, department_id, designation_id, employee_id]);
};

// Delete employee
exports.deleteEmployee = async (employee_id) => {
  const sql = 'DELETE FROM employees WHERE employee_id = ?';
  return db.query(sql, [employee_id]);
}; 