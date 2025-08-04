import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import itemService from '../services/itemService';
import { getAllCategories } from '../services/categoryService';
import { getAllEmployees } from '../services/employeesService';
import { getAllDepartments } from '../services/departmentsService';
import { getAllDesignations } from '../services/designationsService';
import { getAllUsers } from '../services/usersService';
import ConfirmModal from '../components/ConfirmModal';
import EditItemModal from '../components/EditItemModal';
import AuthContext from '../context/AuthContext';

const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  const { user } = useContext(AuthContext);
  const userRole = user?.user?.role;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [itemsRes, categoriesRes, employeesRes, departmentsRes, designationsRes, usersRes] = await Promise.all([
        itemService.getAllItems(),
        getAllCategories(),
        getAllEmployees(),
        getAllDepartments(),
        getAllDesignations(),
        getAllUsers()
      ]);

      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
      setEmployees(employeesRes.data);
      setDepartments(departmentsRes.data);
      setDesignations(designationsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
      setError(`Failed to fetch data: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Calculate statistics
  const stats = {
    totalItems: items.length,
    inStock: items.filter(item => item.status === 'In Stock').length,
    issued: items.filter(item => item.status === 'Issued').length,
    outOfStock: items.filter(item => item.status === 'Out of Stock').length,
    totalCategories: categories.length,
    totalEmployees: employees.length,
    totalDepartments: departments.length,
    totalUsers: users.length,
    warrantyExpiring: items.filter(item => {
      if (!item.warranty_end_date) return false;
      const today = new Date();
      const warrantyEnd = new Date(item.warranty_end_date);
      const daysLeft = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
      return daysLeft <= 30 && daysLeft > 0;
    }).length,
    warrantyExpired: items.filter(item => {
      if (!item.warranty_end_date) return false;
      const today = new Date();
      const warrantyEnd = new Date(item.warranty_end_date);
      const daysLeft = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
      return daysLeft < 0;
    }).length
  };

  // Top categories by item count
  const topCategories = categories
    .map(category => ({
      ...category,
      itemCount: items.filter(item => item.category_id === category.category_id).length
    }))
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 5);

  // Recent items (last 5 added)
  const recentItems = items
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const openDeleteConfirm = (item) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await itemService.deleteItem(itemToDelete.item_id);
      fetchAllData();
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
    fetchAllData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

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

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.user?.username || 'User'}! Here's your inventory overview.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/add-item"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>➕</span>
              Add Item
            </Link>
            <Link
              to="/items"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <span>📋</span>
              View All Items
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span className="text-green-500">●</span>
            <span className="ml-1">{stats.inStock} in stock</span>
          </div>
        </div>

        {/* Issued Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Issued Items</p>
              <p className="text-3xl font-bold text-gray-900">{stats.issued}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">📤</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span className="text-yellow-500">●</span>
            <span className="ml-1">{stats.outOfStock} out of stock</span>
          </div>
        </div>

        {/* Warranty Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warranty Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.warrantyExpiring + stats.warrantyExpired}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span className="text-orange-500">●</span>
            <span className="ml-1">{stats.warrantyExpired} expired</span>
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">🏷️</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span className="text-green-500">●</span>
            <span className="ml-1">{stats.totalEmployees} employees</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Items</h2>
              <Link to="/items" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-lg">💻</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.brand} {item.model}</h3>
                        <p className="text-sm text-gray-600">SN: {item.serial_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                        item.status === 'Issued' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                      <button 
                        onClick={() => openEditModal(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📦</span>
                  <p>No items found. Add your first item to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Categories</h2>
            <div className="space-y-3">
              {topCategories.map((category) => (
                <div key={category.category_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">🏷️</span>
                    </div>
                    <span className="font-medium text-gray-900">{category.category_name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{category.itemCount} items</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Departments</span>
                <span className="font-semibold text-gray-900">{stats.totalDepartments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Designations</span>
                <span className="font-semibold text-gray-900">{designations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Users</span>
                <span className="font-semibold text-gray-900">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Warranty Expiring</span>
                <span className="font-semibold text-orange-600">{stats.warrantyExpiring}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/add-item"
                className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-xl">➕</span>
                <span className="font-medium text-blue-700">Add New Item</span>
              </Link>
              <Link
                to="/items"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">📋</span>
                <span className="font-medium text-gray-700">View All Items</span>
              </Link>
              <Link
                to="/categories"
                className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="text-xl">🏷️</span>
                <span className="font-medium text-green-700">Manage Categories</span>
              </Link>
              <Link
                to="/employees"
                className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span className="text-xl">👥</span>
                <span className="font-medium text-purple-700">Manage Employees</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 