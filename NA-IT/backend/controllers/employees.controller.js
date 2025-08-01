const employeesModel = require('../models/employees.model');

exports.getAllEmployees = async (req, res) => {
  try {
    const [results] = await employeesModel.getAllEmployees();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await employeesModel.getEmployeeById(id);
    if (!results.length) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  const { employee_name, department_id, designation_id } = req.body;
  if (!employee_name || !department_id || !designation_id) return res.status(400).json({ message: 'Please provide employee_name, department_id, and designation_id.' });
  try {
    const [result] = await employeesModel.createEmployee({ employee_name, department_id, designation_id });
    res.status(201).json({ message: 'Employee created successfully!', employeeId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Invalid department_id or designation_id. Please select valid values.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { employee_name, department_id, designation_id } = req.body;
  if (!employee_name || !department_id || !designation_id) return res.status(400).json({ message: 'Please provide employee_name, department_id, and designation_id.' });
  try {
    const [result] = await employeesModel.updateEmployee(id, { employee_name, department_id, designation_id });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employee not found.' });
    res.status(200).json({ message: 'Employee updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await employeesModel.deleteEmployee(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employee not found.' });
    res.status(200).json({ message: 'Employee deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 