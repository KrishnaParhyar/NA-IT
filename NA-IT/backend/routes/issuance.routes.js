const express = require('express');
const router = express.Router();
const issuanceController = require('../controllers/issuance.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateIssue, validateReceive, validateIssuePeripherals } = require('../validators/issuance.validation');

router.post('/issue', protect, restrictTo('Admin', 'Operator'), validateIssue, issuanceController.issueItem);
router.post('/issue-peripherals', protect, restrictTo('Admin', 'Operator'), validateIssuePeripherals, issuanceController.issuePeripherals);
router.post('/receive', protect, restrictTo('Admin', 'Operator'), validateReceive, issuanceController.receiveItem);
router.get('/logs', protect, restrictTo('Admin', 'Operator', 'Management'), issuanceController.getIssuanceLogs);
router.get('/my-items', protect, restrictTo('Admin', 'Operator', 'Management'), issuanceController.getMyIssuedItems);

module.exports = router; 