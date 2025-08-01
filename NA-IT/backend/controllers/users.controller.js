const usersModel = require('../models/users.model');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [results] = await usersModel.getAllUsers();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await usersModel.getUserById(id);
    if (!results.length) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Please provide username, password, and role.' });
  }
  try {
    const [result] = await usersModel.createUser({ username, password, role });
    res.status(201).json({ message: 'User created successfully!', userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  if (!username || !role) {
    return res.status(400).json({ message: 'Please provide username and role.' });
  }
  try {
    const [result] = await usersModel.updateUser(id, { username, password, role });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'User updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await usersModel.deleteUser(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 