const departmentsModel = require('../models/departments.model');

exports.getAllDepartments = async (req, res) => {
  try {
    const [results] = await departmentsModel.getAllDepartments();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await departmentsModel.getDepartmentById(id);
    if (!results.length) return res.status(404).json({ message: 'Department not found' });
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  const { department_name } = req.body;
  if (!department_name) return res.status(400).json({ message: 'Please provide department_name.' });
  try {
    const [result] = await departmentsModel.createDepartment(department_name);
    res.status(201).json({ message: 'Department created successfully!', departmentId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Department already exists.' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { department_name } = req.body;
  if (!department_name) return res.status(400).json({ message: 'Please provide department_name.' });
  try {
    const [result] = await departmentsModel.updateDepartment(id, department_name);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Department not found.' });
    res.status(200).json({ message: 'Department updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await departmentsModel.deleteDepartment(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Department not found.' });
    res.status(200).json({ message: 'Department deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 