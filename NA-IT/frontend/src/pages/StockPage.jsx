import React, { useEffect, useState } from 'react';
import { getAllStock, deleteStock } from '../services/stockService';

const StockPage = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await getAllStock();
      setStock(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stock records');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock record?')) return;
    try {
      await deleteStock(id);
      setStock(stock.filter((s) => s.stock_id !== id));
    } catch (err) {
      alert('Failed to delete stock record');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Stock</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Item ID</th>
              <th className="border px-2 py-1">Quantity</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((s) => (
              <tr key={s.stock_id}>
                <td className="border px-2 py-1">{s.stock_id}</td>
                <td className="border px-2 py-1">{s.item_id}</td>
                <td className="border px-2 py-1">{s.quantity_in_stock}</td>
                <td className="border px-2 py-1">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(s.stock_id)}
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

export default StockPage; 