import React, { useEffect, useState } from 'react';
import { getAllAuditLogs, deleteAuditLog } from '../services/auditLogsService';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAllAuditLogs();
      setLogs(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch audit logs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this audit log?')) return;
    try {
      await deleteAuditLog(id);
      setLogs(logs.filter((l) => l.audit_id !== id));
    } catch (err) {
      alert('Failed to delete audit log');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">User ID</th>
              <th className="border px-2 py-1">Item ID</th>
              <th className="border px-2 py-1">Action</th>
              <th className="border px-2 py-1">Timestamp</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.audit_id}>
                <td className="border px-2 py-1">{log.audit_id}</td>
                <td className="border px-2 py-1">{log.user_id}</td>
                <td className="border px-2 py-1">{log.item_id}</td>
                <td className="border px-2 py-1">{log.action_performed}</td>
                <td className="border px-2 py-1">{log.timestamp}</td>
                <td className="border px-2 py-1">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(log.audit_id)}
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

export default AuditLogsPage; 