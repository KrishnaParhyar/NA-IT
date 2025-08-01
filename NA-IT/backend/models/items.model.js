const db = require('../config/db');

// Create a new item
exports.createItem = (item, callback) => {
  const { category_id, serial_number, brand, model, specifications, date_of_purchase, status } = item;
  const sql = 'INSERT INTO items (category_id, serial_number, brand, model, specifications, date_of_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [category_id, serial_number, brand, model, specifications, date_of_purchase, status], callback);
};

// Get item by ID
exports.getItemById = (item_id, callback) => {
  const sql = 'SELECT * FROM items WHERE item_id = ?';
  db.query(sql, [item_id], callback);
};

// Get all items
exports.getAllItems = (callback) => {
  const sql = 'SELECT * FROM items';
  db.query(sql, callback);
};

// Update item
exports.updateItem = (item_id, item, callback) => {
  const { category_id, serial_number, brand, model, specifications, date_of_purchase, status } = item;
  const sql = 'UPDATE items SET category_id = ?, serial_number = ?, brand = ?, model = ?, specifications = ?, date_of_purchase = ?, status = ? WHERE item_id = ?';
  db.query(sql, [category_id, serial_number, brand, model, specifications, date_of_purchase, status, item_id], callback);
};

// Delete item
exports.deleteItem = (item_id, callback) => {
  const sql = 'DELETE FROM items WHERE item_id = ?';
  db.query(sql, [item_id], callback);
}; 