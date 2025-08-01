const designationsModel = require('../models/designations.model');

exports.getAllDesignations = async (req, res) => {
  try {
    const [results] = await designationsModel.getAllDesignations();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDesignationById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await designationsModel.getDesignationById(id);
    if (!results.length) return res.status(404).json({ message: 'Designation not found' });
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createDesignation = async (req, res) => {
  const { designation_title } = req.body;
  if (!designation_title) return res.status(400).json({ message: 'Please provide designation_title.' });
  try {
    const [result] = await designationsModel.createDesignation(designation_title);
    res.status(201).json({ message: 'Designation created successfully!', designationId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Designation already exists.' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateDesignation = async (req, res) => {
  const { id } = req.params;
  const { designation_title } = req.body;
  if (!designation_title) return res.status(400).json({ message: 'Please provide designation_title.' });
  try {
    const [result] = await designationsModel.updateDesignation(id, designation_title);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Designation not found.' });
    res.status(200).json({ message: 'Designation updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteDesignation = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await designationsModel.deleteDesignation(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Designation not found.' });
    res.status(200).json({ message: 'Designation deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 