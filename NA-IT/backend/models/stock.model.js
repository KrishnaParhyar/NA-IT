const db = require('../config/db');

// Create a new stock record
exports.createStock = (item_id, quantity_in_stock, callback) => {
  const sql = 'INSERT INTO stock (item_id, quantity_in_stock) VALUES (?, ?)';
  db.query(sql, [item_id, quantity_in_stock], callback);
};

// Get stock by ID
exports.getStockById = (stock_id, callback) => {
  const sql = 'SELECT * FROM stock WHERE stock_id = ?';
  db.query(sql, [stock_id], callback);
};

// Get all stock records
exports.getAllStock = (callback) => {
  const sql = 'SELECT * FROM stock';
  db.query(sql, callback);
};

// Update stock
exports.updateStock = (stock_id, quantity_in_stock, callback) => {
  const sql = 'UPDATE stock SET quantity_in_stock = ? WHERE stock_id = ?';
  db.query(sql, [quantity_in_stock, stock_id], callback);
};

// Delete stock
exports.deleteStock = (stock_id, callback) => {
  const sql = 'DELETE FROM stock WHERE stock_id = ?';
  db.query(sql, [stock_id], callback);
}; 