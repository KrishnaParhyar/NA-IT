const express = require('express');
const router = express.Router();
const auditLogsController = require('../controllers/audit_logs.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.get('/', protect, restrictTo('Admin'), auditLogsController.getAllAuditLogs);
router.get('/:id', protect, restrictTo('Admin'), auditLogsController.getAuditLogById);
router.post('/', protect, restrictTo('Admin'), auditLogsController.createAuditLog);
router.delete('/:id', protect, restrictTo('Admin'), auditLogsController.deleteAuditLog);

module.exports = router; 