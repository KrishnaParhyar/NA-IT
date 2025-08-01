const db = require('../config/db');

// Create a new category
exports.createCategory = (category_name, callback) => {
  const sql = 'INSERT INTO categories (category_name) VALUES (?)';
  db.query(sql, [category_name], callback);
};

// Get category by ID
exports.getCategoryById = (category_id, callback) => {
  const sql = 'SELECT * FROM categories WHERE category_id = ?';
  db.query(sql, [category_id], callback);
};

// Get all categories
exports.getAllCategories = (callback) => {
  const sql = 'SELECT * FROM categories';
  db.query(sql, callback);
};

// Update category
exports.updateCategory = (category_id, category_name, callback) => {
  const sql = 'UPDATE categories SET category_name = ? WHERE category_id = ?';
  db.query(sql, [category_name, category_id], callback);
};

// Delete category
exports.deleteCategory = (category_id, callback) => {
  const sql = 'DELETE FROM categories WHERE category_id = ?';
  db.query(sql, [category_id], callback);
}; 