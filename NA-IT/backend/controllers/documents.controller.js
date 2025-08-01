const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentsModel = require('../models/documents.model');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/documents');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload multiple documents for an item
exports.uploadDocuments = async (req, res) => {
    try {
        const { item_id } = req.params;
        const uploadedByUserId = req.user?.userId;
        

        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedDocuments = [];
        
        for (const file of req.files) {
            const documentData = {
                item_id: parseInt(item_id),
                original_filename: file.originalname,
                stored_filename: file.filename,
                file_path: file.path,
                file_size: file.size,
                mime_type: file.mimetype,
                uploaded_by_user_id: uploadedByUserId,
                description: req.body.description || null
            };
            
            const documentId = await documentsModel.createDocument(documentData);
            uploadedDocuments.push({
                document_id: documentId,
                original_filename: file.originalname,
                file_size: file.size,
                mime_type: file.mimetype
            });
        }
        res.status(201).json({
            message: `${uploadedDocuments.length} document(s) uploaded successfully`,
            documents: uploadedDocuments
        });
        
    } catch (error) {
        console.error('UPLOAD DOCUMENTS ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all documents for an item
exports.getItemDocuments = async (req, res) => {
    try {
        const { item_id } = req.params;
        const documents = await documentsModel.getDocumentsByItemId(item_id);
        
        res.status(200).json(documents);
    } catch (error) {
        console.error('GET ITEM DOCUMENTS ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Download a document
exports.downloadDocument = async (req, res) => {
    try {
        const { document_id } = req.params;
        const document = await documentsModel.getDocumentById(document_id);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        if (!fs.existsSync(document.file_path)) {
            return res.status(404).json({ message: 'File not found on server' });
        }
        
        res.download(document.file_path, document.original_filename);
    } catch (error) {
        console.error('DOWNLOAD DOCUMENT ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
    try {
        const { document_id } = req.params;
        const document = await documentsModel.getDocumentById(document_id);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Delete file from filesystem
        if (fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }
        
        // Delete record from database
        await documentsModel.deleteDocument(document_id);
        
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('DELETE DOCUMENT ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update document description
exports.updateDocumentDescription = async (req, res) => {
    try {
        const { document_id } = req.params;
        const { description } = req.body;
        
        const success = await documentsModel.updateDocumentDescription(document_id, description);
        
        if (!success) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        res.status(200).json({ message: 'Document description updated successfully' });
    } catch (error) {
        console.error('UPDATE DOCUMENT DESCRIPTION ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Export multer upload middleware for use in routes
exports.uploadMiddleware = upload.array('documents', 10); // Allow up to 10 files 