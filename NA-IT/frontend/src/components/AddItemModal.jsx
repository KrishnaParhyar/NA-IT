import React, { useState, useEffect } from 'react';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';

const statusOptions = ['In Stock', 'Issued', 'Out of Stock'];

const AddItemModal = ({ isOpen, onClose, onAddItem }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [status, setStatus] = useState('In Stock');

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const response = await categoryService.getAllCategories();
          setCategories(response.data);
          if (response.data.length > 0) {
            setCategoryId(response.data[0].category_id);
          }
        } catch (err) {
          setError('Failed to fetch categories.');
        }
      };
      fetchCategories();
      setStatus('In Stock'); // Reset status when modal opens
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const newItem = {
      serial_number: serialNumber,
      brand,
      model,
      category_id: categoryId,
      specifications,
      date_of_purchase: purchaseDate,
      status,
    };

    try {
      const response = await itemService.createItem(newItem);
      setSuccess('Item added successfully!');
      onAddItem(response.data);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-white">Add New Inventory Item</h2>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-500/20 text-green-300 p-3 rounded-md mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label className="block text-gray-400 mb-2" htmlFor="serialNumber">Serial Number</label>
              <input type="text" id="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="col-span-1">
              <label className="block text-gray-400 mb-2" htmlFor="category">Category</label>
              <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-gray-400 mb-2" htmlFor="brand">Brand</label>
              <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="col-span-1">
              <label className="block text-gray-400 mb-2" htmlFor="model">Model</label>
              <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-400 mb-2" htmlFor="specifications">Specifications</label>
              <textarea id="specifications" value={specifications} onChange={(e) => setSpecifications(e.target.value)} rows="3" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-400 mb-2" htmlFor="purchaseDate">Date of Purchase</label>
              <input type="date" id="purchaseDate" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-400 mb-2" htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-200">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal; 