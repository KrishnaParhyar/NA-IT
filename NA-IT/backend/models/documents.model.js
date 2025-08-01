const db = require('../config/db');

// Create a new document record
exports.createDocument = async (documentData) => {
    try {
        const { item_id, original_filename, stored_filename, file_path, file_size, mime_type, uploaded_by_user_id, description } = documentData;
        

        
        const [result] = await db.query(
            'INSERT INTO item_documents (item_id, original_filename, stored_filename, file_path, file_size, mime_type, uploaded_by_user_id, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [item_id, original_filename, stored_filename, file_path, file_size, mime_type, uploaded_by_user_id, description]
        );
        
        return result.insertId;
    } catch (error) {
        console.error('Database error in createDocument:', error);
        throw error;
    }
};

// Get all documents for a specific item
exports.getDocumentsByItemId = async (itemId) => {
    const [documents] = await db.query(`
        SELECT d.*, u.username as uploaded_by_username
        FROM item_documents d
        LEFT JOIN users u ON d.uploaded_by_user_id = u.user_id
        WHERE d.item_id = ?
        ORDER BY d.upload_date DESC
    `, [itemId]);
    
    return documents;
};

// Get a single document by ID
exports.getDocumentById = async (documentId) => {
    const [documents] = await db.query(`
        SELECT d.*, u.username as uploaded_by_username
        FROM item_documents d
        LEFT JOIN users u ON d.uploaded_by_user_id = u.user_id
        WHERE d.document_id = ?
    `, [documentId]);
    
    return documents[0];
};

// Delete a document
exports.deleteDocument = async (documentId) => {
    const [result] = await db.query('DELETE FROM item_documents WHERE document_id = ?', [documentId]);
    return result.affectedRows > 0;
};

// Update document description
exports.updateDocumentDescription = async (documentId, description) => {
    const [result] = await db.query(
        'UPDATE item_documents SET description = ? WHERE document_id = ?',
        [description, documentId]
    );
    return result.affectedRows > 0;
}; 