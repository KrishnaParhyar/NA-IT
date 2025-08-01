import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, createUser, updateUser } from '../services/usersService';

const initialForm = { username: '', password: '', role: 'Operator' };

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.user_id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditId(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setForm({ username: user.username, password: '', role: user.role });
    setEditId(user.user_id);
    setFormError(null);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || (!editId && !form.password) || !form.role) {
      setFormError('All fields are required.');
      return;
    }
    try {
      if (editId) {
        await updateUser(editId, form);
      } else {
        await createUser(form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save user');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={openAddModal}
      >
        Add User
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Username</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td className="border px-2 py-1">{user.user_id}</td>
                <td className="border px-2 py-1">{user.username}</td>
                <td className="border px-2 py-1">{user.role}</td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    onClick={() => openEditModal(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(user.user_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit User' : 'Add User'}</h2>
            {formError && <p className="text-red-500 mb-2">{formError}</p>}
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  className="w-full border px-2 py-1 rounded"
                  value={form.username}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Password {editId && <span className="text-xs text-gray-500">(leave blank to keep unchanged)</span>}</label>
                <input
                  type="password"
                  name="password"
                  className="w-full border px-2 py-1 rounded"
                  value={form.password}
                  onChange={handleFormChange}
                  required={!editId}
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Role</label>
                <select
                  name="role"
                  className="w-full border px-2 py-1 rounded"
                  value={form.role}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage; 