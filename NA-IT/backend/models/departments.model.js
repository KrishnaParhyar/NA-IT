const db = require('../config/db');

// Create a new department
exports.createDepartment = async (department_name) => {
  const sql = 'INSERT INTO departments (department_name) VALUES (?)';
  return db.query(sql, [department_name]);
};

// Get department by ID
exports.getDepartmentById = async (department_id) => {
  const sql = 'SELECT * FROM departments WHERE department_id = ?';
  return db.query(sql, [department_id]);
};

// Get all departments
exports.getAllDepartments = async () => {
  const sql = 'SELECT * FROM departments';
  return db.query(sql);
};

// Update department
exports.updateDepartment = async (department_id, department_name) => {
  const sql = 'UPDATE departments SET department_name = ? WHERE department_id = ?';
  return db.query(sql, [department_name, department_id]);
};

// Delete department
exports.deleteDepartment = async (department_id) => {
  const sql = 'DELETE FROM departments WHERE department_id = ?';
  return db.query(sql, [department_id]);
}; 