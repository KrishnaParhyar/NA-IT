import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/documents';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

export const documentsService = {
  // Upload documents for an item
  uploadDocuments: async (itemId, files, description = '') => {
    const formData = new FormData();
    
    // Add files to form data
    files.forEach(file => {
      formData.append('documents', file);
    });
    
    // Add description if provided
    if (description) {
      formData.append('description', description);
    }
    
    const response = await axios.post(`${API_URL}/items/${itemId}/documents`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get all documents for an item
  getItemDocuments: async (itemId) => {
    const response = await axios.get(`${API_URL}/items/${itemId}/documents`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Download a document
  downloadDocument: async (documentId) => {
    const response = await axios.get(`${API_URL}/${documentId}/download`, {
      headers: getAuthHeader(),
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete a document
  deleteDocument: async (documentId) => {
    const response = await axios.delete(`${API_URL}/${documentId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Update document description
  updateDocumentDescription: async (documentId, description) => {
    const response = await axios.put(`${API_URL}/${documentId}/description`, {
      description,
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Helper function to format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper function to get file icon based on mime type
  getFileIcon: (mimeType) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text')) return '📄';
    return '📎';
  },

  // Helper function to validate file type
  validateFileType: (file) => {
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
    
    return allowedTypes.includes(file.type);
  },

  // Helper function to validate file size (10MB limit)
  validateFileSize: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }
}; 