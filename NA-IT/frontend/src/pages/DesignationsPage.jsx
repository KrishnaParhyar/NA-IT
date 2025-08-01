import React, { useEffect, useState } from 'react';
import { getAllDesignations, deleteDesignation } from '../services/designationsService';

const DesignationsPage = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const res = await getAllDesignations();
      setDesignations(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch designations');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this designation?')) return;
    try {
      await deleteDesignation(id);
      setDesignations(designations.filter((d) => d.designation_id !== id));
    } catch (err) {
      alert('Failed to delete designation');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Designations</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Designation Title</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {designations.map((des) => (
              <tr key={des.designation_id}>
                <td className="border px-2 py-1">{des.designation_id}</td>
                <td className="border px-2 py-1">{des.designation_title}</td>
                <td className="border px-2 py-1">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(des.designation_id)}
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

export default DesignationsPage; 