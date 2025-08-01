import React, { useEffect, useState, useContext } from 'react';
import issuanceService from '../services/issuanceService';
import itemService from '../services/itemService';
import { getAllEmployees } from '../services/employeesService';
import PeripheralDevicesModal from '../components/PeripheralDevicesModal';
import AuthContext from '../context/AuthContext';

// Helper function to format date (remove time part)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  // If it's a full timestamp, extract just the date part
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const IssuancePage = () => {
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ item_id: '', employee_id: '', issue_date: '' });
  const [returnForm, setReturnForm] = useState({ log_id: '', return_date: '' });
  const [peripheralForm, setPeripheralForm] = useState({ employee_id: '', issue_date: '' });
  const [selectedPeripherals, setSelectedPeripherals] = useState([]);
  const [isPeripheralModalOpen, setIsPeripheralModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const userRole = user?.user?.role;
  const canIssue = userRole === 'Admin' || userRole === 'Operator';
  


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchLogs(),
          fetchItems(),
          fetchEmployees()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const fetchLogs = async () => {
    try {
      // Admin and Operator get all logs, others get only their own
      const res = (userRole === 'Admin' || userRole === 'Operator')
        ? await issuanceService.getLogs()
        : await issuanceService.getMyItems();

      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch issuance logs.');
    }
  };

  const fetchItems = async () => {
    try {
      const res = await itemService.getAllItems();
      const availableItems = res.data.filter(i => i.status === 'In Stock');
      setItems(availableItems);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to fetch items.');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getAllEmployees();
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
      setError('Failed to fetch employees.');
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    // Validation
    if (!form.item_id || !form.employee_id || !form.issue_date) {
      setError('Please fill all required fields.');
      return;
    }
    
    // Check if selected item is available
    const selectedItem = items.find(item => item.item_id.toString() === form.item_id.toString());
    
    if (!selectedItem || selectedItem.status !== 'In Stock') {
      setError('Selected item is not available for issuance.');
      return;
    }
    
    const issueData = { 
      ...form, 
      item_id: parseInt(form.item_id, 10),
      employee_id: parseInt(form.employee_id, 10),
      status: 'Issued' 
    };
    

    
    try {
      await issuanceService.issueItem(issueData);
      setSuccess('Item issued successfully!');
      setForm({ item_id: '', employee_id: '', issue_date: '' }); // Reset form
      fetchLogs(); fetchItems();
    } catch (err) {
      console.error('Issue error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to issue item.');
    }
  };

  const handleReceive = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (!returnForm.log_id || !returnForm.return_date) {
      setError('Please fill all required fields.');
      return;
    }
    
    try {
      await issuanceService.receiveItem({ 
        ...returnForm, 
        log_id: parseInt(returnForm.log_id, 10),
        status: 'Returned' 
      });
      setSuccess('Item marked as returned!');
      setReturnForm({ log_id: '', return_date: '' }); // Reset form
      fetchLogs(); fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as returned.');
    }
  };

  const handlePeripheralIssue = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (selectedPeripherals.length === 0) {
      setError('Please select at least one peripheral device.');
      return;
    }

    if (!peripheralForm.employee_id || !peripheralForm.issue_date) {
      setError('Please fill all required fields.');
      return;
    }

    try {
      // Issue all peripheral devices at once
      await issuanceService.issuePeripherals({
        item_ids: selectedPeripherals.map(device => parseInt(device.item_id, 10)),
        employee_id: parseInt(peripheralForm.employee_id, 10),
        issue_date: peripheralForm.issue_date
      });

      setSuccess(`${selectedPeripherals.length} peripheral device(s) issued successfully!`);
      setSelectedPeripherals([]);
      setPeripheralForm({ employee_id: '', issue_date: '' });
      fetchLogs(); fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue peripheral devices.');
    }
  };

  const handlePeripheralSelection = (devices) => {
    setSelectedPeripherals(devices);
  };

  const removePeripheral = (itemId) => {
    setSelectedPeripherals(prev => prev.filter(device => device.item_id !== itemId));
  };



  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Issuance & Receiving</h1>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            🔄 Loading issuance data...
          </p>
        </div>
      </div>
    );
  }

  // Add error boundary
  if (error && error.includes('Failed to fetch')) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Issuance & Receiving</h1>
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-800">
            ❌ {error}
          </p>
          <button 
            onClick={() => {
              setError('');
              fetchLogs();
              fetchItems();
              fetchEmployees();
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {userRole === 'Admin' || userRole === 'Operator' ? 'Issuance & Receiving (All)' : 'My Issuance & Receiving'}
      </h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
      
      {userRole !== 'Admin' && userRole !== 'Operator' && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            📊 You can see only the items you have issued. Admins and Operators can see all issuance records.
          </p>
        </div>
      )}
      
      {canIssue && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">
            ✅ You have permission to issue and receive items.
          </p>
          <p className="text-green-700 text-sm mt-1">
            📦 {items.length} items available for issuance
          </p>
          {userRole === 'Operator' && (
            <p className="text-green-700 text-sm mt-1">
              👁️ You can view all issuance records (Admin access)
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {/* Single Item Issue Form */}
        <form onSubmit={handleIssue} className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold mb-2">Issue Single Item</h2>
          <select value={form.item_id} onChange={e => setForm(f => ({ ...f, item_id: e.target.value }))} className="w-full border rounded p-2">
            <option value="">Select Item ({items.length} available)</option>
            {items.map(item => (
              <option key={item.item_id} value={item.item_id}>
                {item.serial_number} - {item.brand} {item.model}
              </option>
            ))}
          </select>
          <select value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} className="w-full border rounded p-2">
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.employee_id} value={emp.employee_id}>{emp.employee_name}</option>
            ))}
          </select>
          <input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} className="w-full border rounded p-2" required />
          
          {/* Issued By Field - Shows current user */}
          <div className="bg-gray-50 p-3 rounded border">
            <label className="block text-sm font-medium text-gray-700 mb-1">Issued By:</label>
            <div className="text-sm text-gray-900 font-medium">
              {user?.user?.username || 'Current User'} ({user?.user?.role || 'User'})
            </div>
            <div className="text-xs text-gray-500 mt-1">
              This item will be issued by you automatically
            </div>
          </div>
          
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Issue Item</button>
        </form>

        {/* Peripheral Devices Issue Form */}
        <form onSubmit={handlePeripheralIssue} className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold mb-2">Issue Peripheral Devices</h2>
          
          <button
            type="button"
            onClick={() => setIsPeripheralModalOpen(true)}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Select Peripheral Devices
          </button>

          {selectedPeripherals.length > 0 && (
            <div className="border rounded p-3 bg-gray-50">
              <h3 className="font-medium text-sm mb-2">Selected Devices ({selectedPeripherals.length}):</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedPeripherals.map(device => (
                  <div key={device.item_id} className="flex justify-between items-center text-xs bg-white p-2 rounded">
                    <span>{device.brand} {device.model}</span>
                    <button
                      type="button"
                      onClick={() => removePeripheral(device.item_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <select value={peripheralForm.employee_id} onChange={e => setPeripheralForm(f => ({ ...f, employee_id: e.target.value }))} className="w-full border rounded p-2">
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.employee_id} value={emp.employee_id}>{emp.employee_name}</option>
            ))}
          </select>
          <input type="date" value={peripheralForm.issue_date} onChange={e => setPeripheralForm(f => ({ ...f, issue_date: e.target.value }))} className="w-full border rounded p-2" required />
          
          {/* Issued By Field - Shows current user */}
          <div className="bg-gray-50 p-3 rounded border">
            <label className="block text-sm font-medium text-gray-700 mb-1">Issued By:</label>
            <div className="text-sm text-gray-900 font-medium">
              {user?.user?.username || 'Current User'} ({user?.user?.role || 'User'})
            </div>
            <div className="text-xs text-gray-500 mt-1">
              These devices will be issued by you automatically
            </div>
          </div>
          
          <button 
            type="submit" 
            className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={selectedPeripherals.length === 0}
          >
            Issue {selectedPeripherals.length} Device(s)
          </button>
        </form>

        {/* Return Form */}
        <form onSubmit={handleReceive} className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold mb-2">Mark Item as Returned</h2>
          <select value={returnForm.log_id} onChange={e => setReturnForm(f => ({ ...f, log_id: e.target.value }))} className="w-full border rounded p-2">
            <option value="">Select Issued Log</option>
            {logs.filter(l => l.status === 'Issued').map(log => (
              <option key={log.log_id} value={log.log_id}>{log.serial_number} to {log.employee_name} (Issued: {formatDate(log.issue_date)})</option>
            ))}
          </select>
          <input type="date" value={returnForm.return_date} onChange={e => setReturnForm(f => ({ ...f, return_date: e.target.value }))} className="w-full border rounded p-2" required />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Mark as Returned</button>
        </form>
      </div>

                <h2 className="text-lg font-semibold mb-2">
            {userRole === 'Admin' || userRole === 'Operator' ? 'All Issuance/Return History' : 'My Issuance/Return History'}
          </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Serial Number</th>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-center">Issued</th>
              <th className="px-4 py-2 text-center">Returned</th>
              <th className="px-4 py-2 text-center">Issued By</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>

            {logs.map(log => (
              <tr key={log.log_id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-left font-medium">{log.serial_number}</td>
                <td className="px-4 py-2 text-left">{log.employee_name}</td>
                <td className="px-4 py-2 text-center">{formatDate(log.issue_date)}</td>
                <td className="px-4 py-2 text-center">{formatDate(log.return_date)}</td>
                <td className="px-4 py-2 text-center">
                  <span className="text-sm text-gray-700">
                    {log.issued_by_username || '-'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    log.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                    log.status === 'Issued' ? 'bg-yellow-100 text-yellow-800' :
                    log.status === 'Returned' ? 'bg-blue-100 text-blue-800' :
                    log.status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No issuance records found.</p>
            <p className="text-sm mt-1">Try issuing an item to see it here.</p>
          </div>
        )}
      </div>

      {/* Peripheral Devices Modal */}
      <PeripheralDevicesModal
        isOpen={isPeripheralModalOpen}
        onClose={() => setIsPeripheralModalOpen(false)}
        onSelectDevices={handlePeripheralSelection}
        selectedDevices={selectedPeripherals}
      />
    </div>
  );
};

export default IssuancePage; 