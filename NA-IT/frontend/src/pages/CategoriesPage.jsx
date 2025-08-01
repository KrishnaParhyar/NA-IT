import React, { useEffect, useState } from 'react';
import { getAllCategories, deleteCategory } from '../services/categoryService';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      setCategories(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.category_id !== id));
      alert('Category deleted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete category';
      alert(errorMessage);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Category Name</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.category_id}>
                <td className="border px-2 py-1">{cat.category_id}</td>
                <td className="border px-2 py-1">{cat.category_name}</td>
                <td className="border px-2 py-1">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(cat.category_id)}
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

export default CategoriesPage; 