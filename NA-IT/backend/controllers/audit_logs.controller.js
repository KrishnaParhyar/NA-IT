const auditLogsModel = require('../models/audit_logs.model');

exports.getAllAuditLogs = (req, res) => {
  auditLogsModel.getAllAuditLogs((err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
};

exports.getAuditLogById = (req, res) => {
  const { id } = req.params;
  auditLogsModel.getAuditLogById(id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    if (!results.length) return res.status(404).json({ message: 'Audit log not found' });
    res.status(200).json(results[0]);
  });
};

exports.createAuditLog = (req, res) => {
  const { user_id, item_id, action_performed } = req.body;
  if (!user_id || !item_id || !action_performed) return res.status(400).json({ message: 'Please provide user_id, item_id, and action_performed.' });
  auditLogsModel.createAuditLog({ user_id, item_id, action_performed }, (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(201).json({ message: 'Audit log created successfully!', auditId: result.insertId });
  });
};

exports.deleteAuditLog = (req, res) => {
  const { id } = req.params;
  auditLogsModel.deleteAuditLog(id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Audit log not found.' });
    res.status(200).json({ message: 'Audit log deleted successfully!' });
  });
}; 