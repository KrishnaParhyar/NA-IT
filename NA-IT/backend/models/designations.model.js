const db = require('../config/db');

// Create a new designation
exports.createDesignation = async (designation_title) => {
  const sql = 'INSERT INTO designations (designation_title) VALUES (?)';
  return db.query(sql, [designation_title]);
};

// Get designation by ID
exports.getDesignationById = async (designation_id) => {
  const sql = 'SELECT * FROM designations WHERE designation_id = ?';
  return db.query(sql, [designation_id]);
};

// Get all designations
exports.getAllDesignations = async () => {
  const sql = 'SELECT * FROM designations';
  return db.query(sql);
};

// Update designation
exports.updateDesignation = async (designation_id, designation_title) => {
  const sql = 'UPDATE designations SET designation_title = ? WHERE designation_id = ?';
  return db.query(sql, [designation_title, designation_id]);
};

// Delete designation
exports.deleteDesignation = async (designation_id) => {
  const sql = 'DELETE FROM designations WHERE designation_id = ?';
  return db.query(sql, [designation_id]);
}; 