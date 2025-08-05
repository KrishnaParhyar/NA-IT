import React, { useEffect, useState, useContext } from 'react';
import { getAllEmployees, deleteEmployee, createEmployee, updateEmployee } from '../services/employeesService';
import { getAllDepartments } from '../services/departmentsService';
import { getAllDesignations } from '../services/designationsService';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const initialForm = { employee_name: '', department_id: '', designation_id: '' };

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    designation: ''
  });
  const { user } = useContext(AuthContext);
  const userRole = user?.user?.role;
  const canEdit = userRole === 'Admin' || userRole === 'Operator';

  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token };
    } else {
      return {};
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await getAllEmployees();
      setEmployees(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
    }
    setLoading(false);
  };

  const fetchUniqueDepartments = async () => {
    try {
      const response = await axios.get('/api/employees/unique/departments', { headers: getAuthHeader() });
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to fetch unique departments:', err);
      setDepartments([]);
    }
  };

  const fetchUniqueDesignations = async () => {
    try {
      const response = await axios.get('/api/employees/unique/designations', { headers: getAuthHeader() });
      setDesignations(response.data);
    } catch (err) {
      console.error('Failed to fetch unique designations:', err);
      setDesignations([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchUniqueDepartments();
    fetchUniqueDesignations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteEmployee(id);
      setEmployees(employees.filter((e) => e.employee_id !== id));
    } catch (err) {
      alert('Failed to delete employee');
    }
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditId(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setForm({ employee_name: emp.employee_name, department_id: emp.department_id, designation_id: emp.designation_id });
    setEditId(emp.employee_id);
    setFormError(null);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_name || !form.department_id || !form.designation_id) {
      setFormError('All fields are required.');
      return;
    }
    try {
      if (editId) {
        await updateEmployee(editId, form);
      } else {
        await createEmployee(form);
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save employee');
    }
  };

  // Filter employees based on filters
  const filteredEmployees = employees.filter(emp => {
    if (filters.department && emp.department_id?.toString() !== filters.department) return false;
    if (filters.designation && emp.designation_id?.toString() !== filters.designation) return false;
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
      department: '',
      designation: ''
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {canEdit ? 'Employees Management' : 'Employees View'}
      </h1>
      
      {!canEdit && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            👁️ You have read-only access to view employees. Only Admins and Operators can add/edit employees.
          </p>
        </div>
      )}
      
      {canEdit && (
        <button
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddModal}
        >
          Add Employee
        </button>
      )}
      
      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept} className="text-gray-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Designation Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <select
              value={filters.designation}
              onChange={(e) => handleFilterChange('designation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Designations</option>
              {designations.map(des => (
                <option key={des} value={des}>{des}</option>
              ))}
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
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : Array.isArray(employees) && employees.length > 0 ? (
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Department</th>
              <th className="border px-2 py-1">Designation</th>
              {canEdit && <th className="border px-2 py-1">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.employee_id}>
                <td className="border px-2 py-1">{emp.employee_id}</td>
                <td className="border px-2 py-1">{emp.employee_name}</td>
                <td className="border px-2 py-1">
                  {departments.find(d => d.department_id === emp.department_id)?.department_name || emp.department_id}
                </td>
                <td className="border px-2 py-1">
                  {designations.find(d => d.designation_id === emp.designation_id)?.designation_title || emp.designation_id}
                </td>
                {canEdit && (
                  <td className="border px-2 py-1 space-x-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      onClick={() => openEditModal(emp)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(emp.employee_id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No employees found.</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Employee' : 'Add Employee'}</h2>
            {formError && <p className="text-red-500 mb-2">{formError}</p>}
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="employee_name"
                  className="w-full border px-2 py-1 rounded"
                  value={form.employee_name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Department</label>
                <input
                  type="text"
                  name="department_id"
                  className="w-full border px-2 py-1 rounded"
                  value={form.department_id}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Designation</label>
                <input
                  type="text"
                  name="designation_id"
                  className="w-full border px-2 py-1 rounded"
                  value={form.designation_id}
                  onChange={handleFormChange}
                  required
                />
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

export default EmployeesPage; 