import React, { useEffect, useState } from 'react';
import { getAllDepartments, deleteDepartment } from '../services/departmentsService';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getAllDepartments();
      setDepartments(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch departments');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      setDepartments(departments.filter((d) => d.department_id !== id));
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Departments</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Department Name</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dep) => (
              <tr key={dep.department_id}>
                <td className="border px-2 py-1">{dep.department_id}</td>
                <td className="border px-2 py-1">{dep.department_name}</td>
                <td className="border px-2 py-1">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(dep.department_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DepartmentsPage; 