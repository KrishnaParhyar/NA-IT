const db = require('../config/db');

// Create a new issuance log
exports.createIssuanceLog = (log, callback) => {
  const { item_id, employee_id, issue_date, return_date, status, issued_by_user_id } = log;
  const sql = 'INSERT INTO issuance_logs (item_id, employee_id, issue_date, return_date, status, issued_by_user_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [item_id, employee_id, issue_date, return_date, status, issued_by_user_id], callback);
};

// Get issuance log by ID
exports.getIssuanceLogById = (log_id, callback) => {
  const sql = 'SELECT * FROM issuance_logs WHERE log_id = ?';
  db.query(sql, [log_id], callback);
};

// Get all issuance logs
exports.getAllIssuanceLogs = (callback) => {
  const sql = 'SELECT * FROM issuance_logs';
  db.query(sql, callback);
};

// Update issuance log
exports.updateIssuanceLog = (log_id, log, callback) => {
  const { item_id, employee_id, issue_date, return_date, status, issued_by_user_id } = log;
  const sql = 'UPDATE issuance_logs SET item_id = ?, employee_id = ?, issue_date = ?, return_date = ?, status = ?, issued_by_user_id = ? WHERE log_id = ?';
  db.query(sql, [item_id, employee_id, issue_date, return_date, status, issued_by_user_id, log_id], callback);
};

// Delete issuance log
exports.deleteIssuanceLog = (log_id, callback) => {
  const sql = 'DELETE FROM issuance_logs WHERE log_id = ?';
  db.query(sql, [log_id], callback);
}; 