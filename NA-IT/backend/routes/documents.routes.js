const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documents.controller');
const { protect } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(protect);

// Upload documents for an item
router.post('/items/:item_id/documents', documentsController.uploadMiddleware, documentsController.uploadDocuments);

// Get all documents for an item
router.get('/items/:item_id/documents', documentsController.getItemDocuments);

// Download a specific document
router.get('/documents/:document_id/download', documentsController.downloadDocument);

// Delete a document
router.delete('/documents/:document_id', documentsController.deleteDocument);

// Update document description
router.put('/documents/:document_id/description', documentsController.updateDocumentDescription);

module.exports = router; 