import React, { useState, useEffect } from 'react';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';

const EditItemModal = ({ isOpen, onClose, onUpdateItem, itemToEdit }) => {
  const [formData, setFormData] = useState({
    serial_number: '',
    brand: '',
    model: '',
    category_id: '',
    specifications: '',
    date_of_purchase: '',
    status: 'In Stock',
  });
  
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Pre-fill form when itemToEdit is available
    if (itemToEdit) {
      setFormData({
        serial_number: itemToEdit.serial_number || '',
        brand: itemToEdit.brand || '',
        model: itemToEdit.model || '',
        category_id: itemToEdit.category_id || '',
        specifications: itemToEdit.specifications || '',
        date_of_purchase: itemToEdit.date_of_purchase ? new Date(itemToEdit.date_of_purchase).toISOString().split('T')[0] : '',
        status: itemToEdit.status || 'In Stock',
      });
    }

    // Fetch categories when the modal is opened
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const response = await categoryService.getAllCategories();
          setCategories(response.data);
        } catch (err) {
          setError('Failed to fetch categories.');
        }
      };
      fetchCategories();
    }
  }, [itemToEdit, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await itemService.updateItem(itemToEdit.item_id, formData);
      setSuccess('Item updated successfully!');
      onUpdateItem();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg text-gray-900">
        <h2 className="text-2xl font-bold mb-6">Edit Inventory Item</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="serial_number" value={formData.serial_number} onChange={handleInputChange} placeholder="Serial Number" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
              ))}
            </select>
            <input name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Brand" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            <input name="model" value={formData.model} onChange={handleInputChange} placeholder="Model" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option>In Stock</option>
              <option>Issued</option>
              <option>Out of Stock</option>
            </select>
            <input type="date" name="date_of_purchase" value={formData.date_of_purchase} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <textarea name="specifications" value={formData.specifications} onChange={handleInputChange} placeholder="Specifications" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md">Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Update Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal; 