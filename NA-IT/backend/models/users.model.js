const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Create a new user
exports.createUser = async (user) => {
  const { username, password, role } = user;
  
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  return db.query(sql, [username, hashedPassword, role]);
};

// Get user by username
exports.getUserByUsername = async (username) => {
  const sql = 'SELECT * FROM users WHERE username = ?';
  return db.query(sql, [username]);
};

// Get user by ID
exports.getUserById = async (user_id) => {
  const sql = 'SELECT * FROM users WHERE user_id = ?';
  return db.query(sql, [user_id]);
};

// Get all users
exports.getAllUsers = async () => {
  const sql = 'SELECT * FROM users';
  return db.query(sql);
};

// Update user
exports.updateUser = async (user_id, user) => {
  const { username, password, role } = user;
  
  // If password is provided, hash it. If not, keep the existing password
  let sql, params;
  if (password && password.trim() !== '') {
    const hashedPassword = await bcrypt.hash(password, 12);
    sql = 'UPDATE users SET username = ?, password = ?, role = ? WHERE user_id = ?';
    params = [username, hashedPassword, role, user_id];
  } else {
    sql = 'UPDATE users SET username = ?, role = ? WHERE user_id = ?';
    params = [username, role, user_id];
  }
  
  return db.query(sql, params);
};

// Delete user
exports.deleteUser = async (user_id) => {
  const sql = 'DELETE FROM users WHERE user_id = ?';
  return db.query(sql, [user_id]);
}; 