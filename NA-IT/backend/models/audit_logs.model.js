const db = require('../config/db');

// Create a new audit log
exports.createAuditLog = (log, callback) => {
  const { user_id, item_id, action_performed } = log;
  const sql = 'INSERT INTO audit_logs (user_id, item_id, action_performed) VALUES (?, ?, ?)';
  db.query(sql, [user_id, item_id, action_performed], callback);
};

// Get audit log by ID
exports.getAuditLogById = (audit_id, callback) => {
  const sql = 'SELECT * FROM audit_logs WHERE audit_id = ?';
  db.query(sql, [audit_id], callback);
};

// Get all audit logs
exports.getAllAuditLogs = (callback) => {
  const sql = 'SELECT * FROM audit_logs';
  db.query(sql, callback);
};

// Delete audit log
exports.deleteAuditLog = (audit_id, callback) => {
  const sql = 'DELETE FROM audit_logs WHERE audit_id = ?';
  db.query(sql, [audit_id], callback);
}; 