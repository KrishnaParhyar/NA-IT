import React, { useState, useEffect, useContext } from 'react';
import itemService from '../services/itemService';
import ConfirmModal from '../components/ConfirmModal';
import EditItemModal from '../components/EditItemModal';
import AuthContext from '../context/AuthContext';

const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  const { user } = useContext(AuthContext);
  const userRole = user?.user?.role; // This depends on your auth structure

  const fetchItems = async () => {
    try {
      const response = await itemService.getAllItems();
      setItems(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
      setError(`Failed to fetch items: ${errorMessage}`);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);



  const openDeleteConfirm = (item) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await itemService.deleteItem(itemToDelete.item_id);
      fetchItems(); // Refresh the list
      setError(''); // Clear any previous errors
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
    fetchItems(); // Just refetch the list for simplicity
  };

  return (
    <div>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory Items</h1>
      </div>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Serial Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Brand</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Model</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.item_id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.serial_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.category_name}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(item)} className="text-blue-400 hover:text-blue-600">Edit</button>
                      {userRole === 'Admin' && (
                        <button onClick={() => openDeleteConfirm(item)} className="ml-4 text-red-400 hover:text-red-600">Delete</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    No inventory items found. Add one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 