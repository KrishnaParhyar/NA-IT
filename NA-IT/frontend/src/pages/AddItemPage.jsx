import React, { useEffect, useState, useContext, useRef } from 'react';
import itemService from '../services/itemService';
import { getAllCategories } from '../services/categoryService';
import { documentsService } from '../services/documentsService';
import AuthContext from '../context/AuthContext';

const statusOptions = ['In Stock', 'Issued', 'Out of Stock'];

const initialForm = {
  category_id: '',
  serial_number: '',
  brand: '',
  model: '',
  specifications: '',
  vendor: '',
  date_of_purchase: '',
  warranty_end_date: '',
  status: 'In Stock',
};

const AddItemPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documentDescription, setDocumentDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { user } = useContext(AuthContext);
  const userRole = user?.user?.role;
  const canEdit = userRole === 'Admin' || userRole === 'Operator';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data);
    } catch (err) {
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (!documentsService.validateFileType(file)) {
        errors.push(`${file.name}: Invalid file type`);
      } else if (!documentsService.validateFileSize(file)) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setFormError(errors.join(', '));
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFormError(null);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setDocumentDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setLoading(true);
    setUploadProgress(0);
    
    // Enhanced validation
    const requiredFields = {
      category_id: 'Category',
      serial_number: 'Serial Number', 
      brand: 'Brand',
      model: 'Model',
      specifications: 'Specifications',
      vendor: 'Vendor',
      date_of_purchase: 'Date of Purchase',
      warranty_end_date: 'Warranty End Date',
      status: 'Status'
    };

    const missingFields = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!form[field] || form[field].toString().trim() === '') {
        missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      setFormError(`Please fill all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // Check if at least one document is uploaded
    if (selectedFiles.length === 0) {
      setFormError('At least one document is required. Please upload a document.');
      setLoading(false);
      return;
    }
    
    try {
      // Create item first
      const itemResponse = await itemService.createItem({
        ...form,
        category_id: parseInt(form.category_id, 10),
      });
      
      const itemId = itemResponse.data.itemId;
      
      if (!itemId) {
        throw new Error('Item creation failed: No itemId returned');
      }
      
      // Upload documents if any files are selected
      if (selectedFiles.length > 0) {
        setUploadProgress(50);
        try {
          await documentsService.uploadDocuments(itemId, selectedFiles, documentDescription);
          setUploadProgress(100);
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
          // Item was created but documents failed to upload
          setFormError('Item created successfully but document upload failed: ' + (uploadError.response?.data?.message || 'Unknown error'));
          setLoading(false);
          return;
        }
      }
      
      setSuccess('Item added successfully!' + (selectedFiles.length > 0 ? ` ${selectedFiles.length} document(s) uploaded.` : ''));
      setForm(initialForm);
      clearFiles();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to add item');
    }
    setLoading(false);
    setUploadProgress(0);
  };

  if (!canEdit) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Add New Item</h1>
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            ❌ Access Denied: Only Admins and Operators can add new items.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Item</h1>
      
      <div className="max-w-2xl">
        {/* Required Fields Summary */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📋 Required Fields:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Category, Serial Number, Brand, Model</li>
            <li>• Specifications, Vendor Name</li>
            <li>• Date of Purchase, Warranty End Date</li>
            <li>• Status, At least one document</li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-700">Category *</label>
              <select 
                name="category_id" 
                value={form.category_id} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Serial Number *</label>
              <input 
                type="text" 
                name="serial_number" 
                value={form.serial_number} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Brand *</label>
              <input 
                type="text" 
                name="brand" 
                value={form.brand} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Model *</label>
              <input 
                type="text" 
                name="model" 
                value={form.model} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-700">Specifications *</label>
              <textarea 
                name="specifications" 
                value={form.specifications} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows="3"
                placeholder="Enter item specifications..."
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Vendor *</label>
              <input 
                type="text" 
                name="vendor" 
                value={form.vendor} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter vendor name..."
                required
              />
            </div>
            

            
                         <div>
               <label className="block mb-2 font-medium text-gray-700">Date of Purchase *</label>
               <input 
                 type="date" 
                 name="date_of_purchase" 
                 value={form.date_of_purchase} 
                 onChange={handleChange} 
                 className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 required 
               />
             </div>
             
             <div>
               <label className="block mb-2 font-medium text-gray-700">Warranty End Date *</label>
               <input 
                 type="date" 
                 name="warranty_end_date" 
                 value={form.warranty_end_date} 
                 onChange={handleChange} 
                 className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 required
               />
             </div>
             
             <div>
               <label className="block mb-2 font-medium text-gray-700">Status *</label>
               <select
                 name="status"
                 value={form.status}
                 onChange={handleChange}
                 className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 required
               >
                 <option value="">Select Status</option>
                 <option value="In Stock">In Stock</option>
                 <option value="Issued">Issued</option>
                 <option value="Out of Stock">Out of Stock</option>
               </select>
             </div>

             {/* Document Upload Section */}
             <div className="md:col-span-2">
               <label className="block mb-2 font-medium text-gray-700">Upload Documents *</label>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                 <input
                   type="file"
                   ref={fileInputRef}
                   onChange={handleFileSelect}
                   multiple
                   accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                   className="hidden"
                 />
                 <div className="text-center">
                   <button
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                   >
                     📁 Choose Files
                   </button>
                   <p className="mt-2 text-sm text-gray-600">
                     Supported formats: PDF, Word, Excel, Images, Text files (Max 10MB each)
                   </p>
                   <p className="mt-1 text-sm text-red-600 font-medium">
                     ⚠️ At least one document is required
                   </p>
                 </div>
               </div>

               {/* Selected Files Display */}
               {selectedFiles.length > 0 ? (
                 <div className="mt-4">
                   <h4 className="font-medium text-gray-700 mb-2">Selected Files ({selectedFiles.length})</h4>
                   <div className="space-y-2">
                     {selectedFiles.map((file, index) => (
                       <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                         <div className="flex items-center space-x-2">
                           <span>{documentsService.getFileIcon(file.type)}</span>
                           <span className="text-sm font-medium">{file.name}</span>
                           <span className="text-xs text-gray-500">
                             ({documentsService.formatFileSize(file.size)})
                           </span>
                         </div>
                         <button
                           type="button"
                           onClick={() => removeFile(index)}
                           className="text-red-500 hover:text-red-700 text-sm"
                         >
                           ✕ Remove
                         </button>
                       </div>
                     ))}
                   </div>
                   
                   {/* Document Description */}
                   <div className="mt-4">
                     <label className="block mb-2 text-sm font-medium text-gray-700">
                       Document Description (Optional)
                     </label>
                     <textarea
                       value={documentDescription}
                       onChange={(e) => setDocumentDescription(e.target.value)}
                       className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       rows="2"
                       placeholder="Describe the documents being uploaded..."
                     />
                   </div>
                   
                   <button
                     type="button"
                     onClick={clearFiles}
                     className="mt-2 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                   >
                     Clear All Files
                   </button>
                 </div>
               ) : (
                 <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                   <p className="text-yellow-700 text-sm">
                     ⚠️ No documents selected. Please upload at least one document.
                   </p>
                 </div>
               )}
             </div>
          </div>
          
          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{formError}</p>
            </div>
          )}
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading documents...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{success}</p>
            </div>
          )}
          
          <div className="mt-6 flex gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setForm(initialForm);
                clearFiles();
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemPage; 