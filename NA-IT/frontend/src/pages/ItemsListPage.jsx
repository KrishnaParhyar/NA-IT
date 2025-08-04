import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import itemService from '../services/itemService';
import { getAllCategories } from '../services/categoryService';
import { documentsService } from '../services/documentsService';
import ConfirmModal from '../components/ConfirmModal';
import EditItemModal from '../components/EditItemModal';
import AuthContext from '../context/AuthContext';

// Helper function to format date (remove time part)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  // If it's a full timestamp, extract just the date part
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Helper function to calculate warranty end date
const calculateWarrantyEndDate = (purchaseDate, warrantyPeriod) => {
  if (!purchaseDate || !warrantyPeriod) return '-';
  
  try {
    const purchase = new Date(purchaseDate);
    if (isNaN(purchase.getTime())) return '-';
    
    // Parse warranty period (assuming format like "1 year", "2 years", "6 months", etc.)
    const warrantyText = warrantyPeriod.toLowerCase();
    let months = 0;
    
    if (warrantyText.includes('year')) {
      const years = parseInt(warrantyText.match(/\d+/)?.[0] || '0');
      months = years * 12;
    } else if (warrantyText.includes('month')) {
      months = parseInt(warrantyText.match(/\d+/)?.[0] || '0');
    } else {
      // If no specific format, try to extract number and assume months
      const num = parseInt(warrantyText.match(/\d+/)?.[0] || '0');
      months = num;
    }
    
    if (months === 0) return '-';
    
    // Add months to purchase date
    const warrantyEnd = new Date(purchase);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + months);
    
    return warrantyEnd.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error calculating warranty end date:', error);
    return '-';
  }
};

const ItemsListPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedItemForDocuments, setSelectedItemForDocuments] = useState(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [viewMode, setViewMode] = useState('compact'); // 'compact' or 'detailed'
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    model: '',
    status: '',
    specifications: ''
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [error, setError] = useState('');
  
  const { user } = useContext(AuthContext);
  const userRole = user?.user?.role;
  const canEdit = userRole === 'Admin' || userRole === 'Operator';
  const canDelete = userRole === 'Admin'; // Only admins can delete items

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await itemService.getAllItems();
      setItems(res.data);
      
      // Fetch documents for all items (we'll optimize this later if needed)
      const itemIds = res.data.map(item => item.item_id);
      await fetchDocumentsForItems(itemIds);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchDocumentsForItems = async (itemIds) => {
    setDocumentsLoading(true);
    const documentsData = {};
    
    for (const itemId of itemIds) {
      try {
        const docs = await documentsService.getItemDocuments(itemId);
        documentsData[itemId] = docs;
      } catch (err) {
        console.error(`Error fetching documents for item ${itemId}:`, err);
        documentsData[itemId] = [];
      }
    }
    
    setDocuments(documentsData);
    setDocumentsLoading(false);
  };

  const handleViewDocuments = (item) => {
    setSelectedItemForDocuments(item);
    setShowDocumentsModal(true);
  };

  const handleDownloadDocument = async (documentId, filename) => {
    try {
      const blob = await documentsService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  // Filter items based on filters
  const filteredItems = items.filter(item => {
    if (filters.category && item.category_id?.toString() !== filters.category) return false;
    if (filters.brand && item.brand?.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters.model && item.model?.toLowerCase() !== filters.model.toLowerCase()) return false;
    if (filters.status && item.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
    if (filters.specifications && !item.specifications?.toLowerCase().includes(filters.specifications.toLowerCase())) return false;
    return true;
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      model: '',
      status: '',
      specifications: ''
    });
  };

  // Get unique brands and models for filter dropdowns
  const uniqueBrands = [...new Set(items.map(item => item.brand).filter(Boolean))];
  const uniqueModels = [...new Set(items.map(item => item.model).filter(Boolean))];

  // Toggle row expansion
  const toggleRowExpansion = (itemId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(itemId)) {
      newExpandedRows.delete(itemId);
    } else {
      newExpandedRows.add(itemId);
    }
    setExpandedRows(newExpandedRows);
  };

  const openDeleteConfirm = (item) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await itemService.deleteItem(itemToDelete.item_id);
      fetchItems(); // Refresh the items list
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete item. Please try again.';
      setError(errorMessage);
      console.error('Delete item error:', err);
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const openEditModal = (item) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = () => {
    fetchItems(); // Refresh the items list
  };

  return (
    <div className="p-6">
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteItem}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the item with serial number "${itemToDelete?.serial_number}"? This action cannot be undone.`}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateItem={handleUpdateItem}
        itemToEdit={itemToEdit}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
             <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold">
           {canEdit ? 'Items Management' : 'Items View'}
         </h1>
         
         {/* View Mode Toggle */}
         <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-gray-700">View Mode:</span>
             <div className="flex bg-gray-100 rounded-lg p-1">
               <button
                 onClick={() => setViewMode('compact')}
                 className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                   viewMode === 'compact'
                     ? 'bg-white text-blue-600 shadow-sm'
                     : 'text-gray-600 hover:text-gray-900'
                 }`}
               >
                 📋 Compact
               </button>
               <button
                 onClick={() => setViewMode('detailed')}
                 className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                   viewMode === 'detailed'
                     ? 'bg-white text-blue-600 shadow-sm'
                     : 'text-gray-600 hover:text-gray-900'
                 }`}
               >
                 📊 Detailed
               </button>
             </div>
           </div>
           
           <div className="text-sm text-gray-500">
             {filteredItems.length} of {items.length} items
           </div>
         </div>
       </div>
      
      {!canEdit && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            👁️ You have read-only access to view items. Only Admins and Operators can add/edit items.
          </p>
        </div>
      )}
      
             {/* Filter Section */}
       <div className="mb-6 p-4 bg-gray-50 rounded-lg">
         <h3 className="text-lg font-semibold mb-3">Filters</h3>
         
                   {/* Specifications Search Bar */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔍</span>
              <label className="text-lg font-semibold text-blue-800">
                Search by Specifications
              </label>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={filters.specifications}
                  onChange={(e) => handleFilterChange('specifications', e.target.value)}
                  placeholder="Type specifications to search... (e.g., 8GB RAM, Intel i7, 512GB SSD)"
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
                />
                {filters.specifications && (
                  <button
                    onClick={() => handleFilterChange('specifications', '')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              💡 Search for items by their technical specifications like RAM, processor, storage, operating system, etc.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-blue-800">Quick Search:</span>
              <button
                onClick={() => handleFilterChange('specifications', '8GB')}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                💾 8GB RAM
              </button>
              <button
                onClick={() => handleFilterChange('specifications', 'Intel')}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                🔧 Intel
              </button>
              <button
                onClick={() => handleFilterChange('specifications', 'SSD')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors text-sm font-medium"
              >
                💿 SSD
              </button>
              <button
                onClick={() => handleFilterChange('specifications', 'Windows')}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors text-sm font-medium"
              >
                🪟 Windows
              </button>
              <button
                onClick={() => handleFilterChange('specifications', 'i7')}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors text-sm font-medium"
              >
                ⚡ i7
              </button>
            </div>
          </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id} className="text-gray-900">
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand} className="text-gray-900">
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Model Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Models</option>
              {uniqueModels.map(model => (
                <option key={model} value={model} className="text-gray-900">
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Status</option>
              <option value="In Stock" className="text-gray-900">In Stock</option>
              <option value="Issued" className="text-gray-900">Issued</option>
              <option value="Out of Stock" className="text-gray-900">Out of Stock</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
                 {/* Results Counter */}
         <div className="mt-3 text-sm text-gray-600">
           Showing {filteredItems.length} of {items.length} items
           {viewMode === 'compact' && (
             <span className="ml-2 text-blue-600">
               💡 Click on any row to see more details
             </span>
           )}
         </div>
      </div>
      
             {loading ? (
         <div className="flex justify-center items-center py-8">
           <div className="text-gray-500">Loading items...</div>
         </div>
       ) : (
         <div className="bg-white rounded-lg shadow overflow-hidden">
           {viewMode === 'compact' ? (
             // Compact View
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Item
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Category
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Status
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Warranty
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Actions
                     </th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {filteredItems.map((item) => (
                     <React.Fragment key={item.item_id}>
                       <tr 
                         className="hover:bg-gray-50 cursor-pointer"
                         onClick={() => toggleRowExpansion(item.item_id)}
                       >
                         <td className="px-4 py-4">
                           <div className="flex items-center">
                             <button className="mr-2 text-gray-400 hover:text-gray-600">
                               {expandedRows.has(item.item_id) ? '▼' : '▶'}
                             </button>
                             <div>
                               <div className="text-sm font-medium text-gray-900">
                                 {item.brand} {item.model}
                               </div>
                               <div className="text-sm text-gray-500">
                                 SN: {item.serial_number}
                               </div>
                             </div>
                           </div>
                         </td>
                         <td className="px-4 py-4 text-sm text-gray-900">
                           {categories.find((c) => c.category_id === item.category_id)?.category_name || item.category_id}
                         </td>
                         <td className="px-4 py-4">
                           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                             item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                             item.status === 'Issued' ? 'bg-yellow-100 text-yellow-800' :
                             item.status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                             'bg-gray-100 text-gray-800'
                           }`}>
                             {item.status}
                           </span>
                         </td>
                         <td className="px-4 py-4 text-sm text-gray-900">
                           {item.warranty_end_date ? (
                             (() => {
                               const today = new Date();
                               const warrantyEnd = new Date(item.warranty_end_date);
                               const daysLeft = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
                               
                               if (daysLeft < 0) {
                                 return (
                                   <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                     ❌ Expired
                                   </span>
                                 );
                               } else if (daysLeft <= 30) {
                                 return (
                                   <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                     ⚠️ {daysLeft}d
                                   </span>
                                 );
                               } else if (daysLeft <= 90) {
                                 const monthsLeft = Math.floor(daysLeft / 30);
                                 return (
                                   <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                     ⏳ {monthsLeft}m
                                   </span>
                                 );
                               } else {
                                 const yearsLeft = Math.floor(daysLeft / 365);
                                 return (
                                   <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                     ✅ {yearsLeft}y
                                   </span>
                                 );
                               }
                             })()
                           ) : (
                             <span className="text-gray-400 text-xs">-</span>
                           )}
                         </td>
                                                   <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDocuments(item);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs underline"
                              >
                                📄 Docs
                              </button>
                              {canEdit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(item);
                                  }}
                                  className="text-green-600 hover:text-green-800 text-xs underline"
                                >
                                  ✏️ Edit
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteConfirm(item);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-xs underline"
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </div>
                          </td>
                       </tr>
                       
                       {/* Expanded Row Details */}
                       {expandedRows.has(item.item_id) && (
                         <tr className="bg-gray-50">
                           <td colSpan="5" className="px-4 py-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                               <div>
                                 <span className="font-medium text-gray-700">Vendor:</span>
                                 <span className="ml-2 text-gray-900">{item.vendor || '-'}</span>
                               </div>
                               <div>
                                 <span className="font-medium text-gray-700">Warranty Period:</span>
                                 <span className="ml-2 text-gray-900">{item.warranty_period || '-'}</span>
                               </div>
                               <div>
                                 <span className="font-medium text-gray-700">Purchase Date:</span>
                                 <span className="ml-2 text-gray-900">{formatDate(item.date_of_purchase)}</span>
                               </div>
                               <div className="md:col-span-2 lg:col-span-3">
                                 <span className="font-medium text-gray-700">Specifications:</span>
                                 <div className="mt-1 text-gray-900">
                                   {item.specifications ? (
                                     <div>
                                       <div className="truncate" title={item.specifications}>
                                         {item.specifications}
                                       </div>
                                       <div className="flex flex-wrap gap-1 mt-1">
                                         {item.specifications.toLowerCase().includes('ram') && (
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                                             💾 RAM
                                           </span>
                                         )}
                                         {item.specifications.toLowerCase().includes('ssd') && (
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                                             💿 SSD
                                           </span>
                                         )}
                                         {item.specifications.toLowerCase().includes('intel') && (
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
                                             🔧 Intel
                                           </span>
                                         )}
                                         {item.specifications.toLowerCase().includes('windows') && (
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">
                                             🪟 Windows
                                           </span>
                                         )}
                                       </div>
                                     </div>
                                   ) : (
                                     <span className="text-gray-400 italic">No specifications</span>
                                   )}
                                 </div>
                               </div>
                             </div>
                           </td>
                         </tr>
                       )}
                     </React.Fragment>
                   ))}
                 </tbody>
               </table>
             </div>
                                               ) : (
                          // Detailed View - Original full table
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Serial Number
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Model
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Specifications
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Warranty Period
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Warranty End Date
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Documents
                                  </th>
                                  {canDelete && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map((item) => (
                                  <tr key={item.item_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {item.item_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {categories.find((c) => c.category_id === item.category_id)?.category_name || item.category_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {item.serial_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {item.brand}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {item.model}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {item.vendor || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                      {item.specifications ? (
                                        <div className="space-y-1">
                                          <div className="truncate" title={item.specifications}>
                                            {filters.specifications ? (
                                              <span dangerouslySetInnerHTML={{
                                                __html: item.specifications.replace(
                                                  new RegExp(`(${filters.specifications})`, 'gi'),
                                                  '<mark class="bg-yellow-200 px-1 rounded font-medium">$1</mark>'
                                                )
                                              }} />
                                            ) : (
                                              item.specifications
                                            )}
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {item.specifications.toLowerCase().includes('ram') && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                                                💾 RAM
                                              </span>
                                            )}
                                            {item.specifications.toLowerCase().includes('ssd') && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                                                💿 SSD
                                              </span>
                                            )}
                                            {item.specifications.toLowerCase().includes('intel') && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
                                                🔧 Intel
                                              </span>
                                            )}
                                            {item.specifications.toLowerCase().includes('windows') && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">
                                                🪟 Windows
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-gray-400 italic text-xs">
                                          No specifications
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                                        item.status === 'Issued' ? 'bg-yellow-100 text-yellow-800' :
                                        item.status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {item.warranty_period ? (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                              ⏰ {item.warranty_period}
                                            </span>
                                          </div>
                                          {item.warranty_end_date && (
                                            <div className="space-y-1">
                                              {(() => {
                                                const today = new Date();
                                                const warrantyEnd = new Date(item.warranty_end_date);
                                                const daysLeft = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
                                                
                                                if (daysLeft < 0) {
                                                  const daysExpired = Math.abs(daysLeft);
                                                  const yearsExpired = Math.floor(daysExpired / 365);
                                                  const monthsExpired = Math.floor((daysExpired % 365) / 30);
                                                  const remainingDaysExpired = daysExpired % 30;
                                                  
                                                  let expiredText = '❌ Expired ';
                                                  if (yearsExpired > 0) expiredText += `${yearsExpired} year${yearsExpired > 1 ? 's' : ''} `;
                                                  if (monthsExpired > 0) expiredText += `${monthsExpired} month${monthsExpired > 1 ? 's' : ''} `;
                                                  if (remainingDaysExpired > 0) expiredText += `${remainingDaysExpired} day${remainingDaysExpired > 1 ? 's' : ''} ago`;
                                                  
                                                  return (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                      {expiredText.trim()}
                                                    </span>
                                                  );
                                                } else if (daysLeft <= 30) {
                                                  return (
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                      ⚠️ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                                    </span>
                                                  );
                                                } else if (daysLeft <= 90) {
                                                  const monthsLeft = Math.floor(daysLeft / 30);
                                                  const remainingDays = daysLeft % 30;
                                                  
                                                  let warningText = '⏳ ';
                                                  if (monthsLeft > 0) warningText += `${monthsLeft} month${monthsLeft > 1 ? 's' : ''} `;
                                                  if (remainingDays > 0) warningText += `${remainingDays} day${remainingDays > 1 ? 's' : ''} left`;
                                                  
                                                  return (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                      {warningText.trim()}
                                                    </span>
                                                  );
                                                } else {
                                                  const yearsLeft = Math.floor(daysLeft / 365);
                                                  const monthsLeft = Math.floor((daysLeft % 365) / 30);
                                                  const remainingDays = daysLeft % 30;
                                                  
                                                  let activeText = '✅ ';
                                                  if (yearsLeft > 0) activeText += `${yearsLeft} year${yearsLeft > 1 ? 's' : ''} `;
                                                  if (monthsLeft > 0) activeText += `${monthsLeft} month${monthsLeft > 1 ? 's' : ''} `;
                                                  if (remainingDays > 0) activeText += `${remainingDays} day${remainingDays > 1 ? 's' : ''} left`;
                                                  
                                                  return (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                      {activeText.trim()}
                                                    </span>
                                                  );
                                                }
                                              })()}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs italic">Not specified</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {item.warranty_end_date ? (
                                        <div className="flex flex-col space-y-1">
                                          <span className="font-medium">{formatDate(item.warranty_end_date)}</span>
                                          {(() => {
                                            const today = new Date();
                                            const warrantyEnd = new Date(item.warranty_end_date);
                                            const daysLeft = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
                                            
                                            if (daysLeft < 0) {
                                              const daysExpired = Math.abs(daysLeft);
                                              const yearsExpired = Math.floor(daysExpired / 365);
                                              const monthsExpired = Math.floor((daysExpired % 365) / 30);
                                              const remainingDaysExpired = daysExpired % 30;
                                              
                                              let expiredText = 'Expired ';
                                              if (yearsExpired > 0) expiredText += `${yearsExpired} year${yearsExpired > 1 ? 's' : ''} `;
                                              if (monthsExpired > 0) expiredText += `${monthsExpired} month${monthsExpired > 1 ? 's' : ''} `;
                                              if (remainingDaysExpired > 0) expiredText += `${remainingDaysExpired} day${remainingDaysExpired > 1 ? 's' : ''} ago`;
                                              
                                              return (
                                                <span className="text-xs text-red-600 font-medium">
                                                  {expiredText.trim()}
                                                </span>
                                              );
                                            } else if (daysLeft <= 30) {
                                              return (
                                                <span className="text-xs text-orange-600 font-medium">
                                                  Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                                                </span>
                                              );
                                            } else if (daysLeft <= 90) {
                                              const monthsLeft = Math.floor(daysLeft / 30);
                                              const remainingDays = daysLeft % 30;
                                              
                                              let warningText = 'Expires in ';
                                              if (monthsLeft > 0) warningText += `${monthsLeft} month${monthsLeft > 1 ? 's' : ''} `;
                                              if (remainingDays > 0) warningText += `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
                                              
                                              return (
                                                <span className="text-xs text-yellow-600 font-medium">
                                                  {warningText.trim()}
                                                </span>
                                              );
                                            } else {
                                              const yearsLeft = Math.floor(daysLeft / 365);
                                              const monthsLeft = Math.floor((daysLeft % 365) / 30);
                                              const remainingDays = daysLeft % 30;
                                              
                                              let validText = 'Valid for ';
                                              if (yearsLeft > 0) validText += `${yearsLeft} year${yearsLeft > 1 ? 's' : ''} `;
                                              if (monthsLeft > 0) validText += `${monthsLeft} month${monthsLeft > 1 ? 's' : ''} `;
                                              if (remainingDays > 0) validText += `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
                                              
                                              return (
                                                <span className="text-xs text-green-600 font-medium">
                                                  {validText.trim()}
                                                </span>
                                              );
                                            }
                                          })()}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs italic">Not set</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {documentsLoading ? (
                                        <span className="text-gray-400 text-xs">Loading...</span>
                                      ) : documents[item.item_id] && documents[item.item_id].length > 0 ? (
                                        <div className="flex flex-col space-y-1">
                                          <span className="text-xs text-blue-600 font-medium">
                                            {documents[item.item_id].length} document(s)
                                          </span>
                                          <div className="flex flex-wrap gap-1">
                                            {documents[item.item_id].slice(0, 3).map((doc, index) => (
                                              <span key={doc.document_id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                                {documentsService.getFileIcon(doc.mime_type)} {doc.original_filename}
                                              </span>
                                            ))}
                                            {documents[item.item_id].length > 3 && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                                +{documents[item.item_id].length - 3} more
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            onClick={() => handleViewDocuments(item)}
                                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                                          >
                                            View All Documents
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs">No documents</span>
                                      )}
                                    </td>
                                    {canEdit && (
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => openEditModal(item)}
                                            className="text-green-600 hover:text-green-800 text-xs underline"
                                          >
                                            ✏️ Edit
                                          </button>
                                          {canDelete && (
                                            <button
                                              onClick={() => openDeleteConfirm(item)}
                                              className="text-red-600 hover:text-red-800 text-xs underline"
                                            >
                                              🗑️ Delete
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    )}
                                    {!canEdit && canDelete && (
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                          onClick={() => openDeleteConfirm(item)}
                                          className="text-red-600 hover:text-red-800 text-xs underline"
                                        >
                                          🗑️ Delete
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        {filteredItems.length === 0 && !loading && (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No items found matching your filters.</p>
                          </div>
                        )}
                      </div>
                    )}

      {/* Documents Modal */}
      {showDocumentsModal && selectedItemForDocuments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Documents for {selectedItemForDocuments.brand} {selectedItemForDocuments.model}
              </h3>
              <button
                onClick={() => setShowDocumentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {documents[selectedItemForDocuments.item_id] && documents[selectedItemForDocuments.item_id].length > 0 ? (
                documents[selectedItemForDocuments.item_id].map((doc) => (
                  <div key={doc.document_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{documentsService.getFileIcon(doc.mime_type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{doc.original_filename}</p>
                        <p className="text-sm text-gray-500">
                          {documentsService.formatFileSize(doc.file_size)} • 
                          Uploaded by {doc.uploaded_by_username || 'Unknown'} • 
                          {new Date(doc.upload_date).toLocaleDateString()}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadDocument(doc.document_id, doc.original_filename)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Download
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No documents found for this item.</p>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDocumentsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsListPage; 