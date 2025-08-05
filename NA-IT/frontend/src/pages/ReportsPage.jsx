import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import AuthContext from '../context/AuthContext';

const ReportsPage = () => {
  const [issuanceLogs, setIssuanceLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [printing, setPrinting] = useState(false);
  const [filters, setFilters] = useState({
    employee: '',
    item: '',
    status: '',
    department: ''
  });
  const { user } = useContext(AuthContext);
  const isAdmin = user?.user?.role === 'Admin' || user?.user?.role === 'Management';
  const printRef = useRef();

  const getAuthHeader = () => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token };
    } else {
      return {};
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Admin gets all logs, others get only their own
      const logsEndpoint = isAdmin ? '/api/issuance/logs' : '/api/issuance/my-items';
      
      const [logsRes, itemsRes] = await Promise.all([
        axios.get(logsEndpoint, { headers: getAuthHeader() }),
        axios.get('/api/items', { headers: getAuthHeader() }),
      ]);
      setIssuanceLogs(logsRes.data);
      setItems(itemsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reports');
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees', { headers: getAuthHeader() });
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/employees/unique/departments', { headers: getAuthHeader() });
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchEmployees();
    fetchDepartments();
  }, []);

  // Filter issuance logs based on filters
  const filteredLogs = issuanceLogs.filter(log => {
    if (filters.employee && log.employee_id?.toString() !== filters.employee) return false;
    if (filters.item && log.item_id?.toString() !== filters.item) return false;
    if (filters.status && log.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
    if (filters.department && log.department_id?.toString() !== filters.department) return false;
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
      employee: '',
      item: '',
      status: '',
      department: ''
    });
  };

  const handlePrint = () => {
    setPrinting(true);
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NA Inventory Reports - ${currentDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { margin: 0; color: #333; }
            .header p { margin: 5px 0; color: #666; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .status-badge { padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; }
            .status-instock { background-color: #d4edda; color: #155724; }
            .status-issued { background-color: #fff3cd; color: #856404; }
            .status-returned { background-color: #cce5ff; color: #004085; }
            .status-outofstock { background-color: #f8d7da; color: #721c24; }
            .filters { margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
            .filters p { margin: 5px 0; }
            @media print {
              .no-print { display: none; }
              body { margin: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NA Inventory Management System</h1>
            <p>Report Generated: ${currentDate} at ${currentTime}</p>
            <p>Generated by: ${user?.user?.username || 'Unknown'} (${user?.user?.role || 'Unknown Role'})</p>
            <p>Report Type: ${isAdmin ? (user?.user?.role === 'Management' ? 'All Reports (Management)' : 'All Reports (Admin)') : 'My Reports'}</p>
          </div>

                     <div class="filters">
             <h3>Applied Filters:</h3>
             <p>Employee: ${filters.employee ? employees.find(emp => emp.employee_id.toString() === filters.employee)?.employee_name || filters.employee : 'All Employees'}</p>
             <p>Item: ${filters.item ? items.find(item => item.item_id.toString() === filters.item)?.serial_number || filters.item : 'All Items'}</p>
             <p>Department: ${filters.department ? departments.find(dept => dept.toString() === filters.department)?.department_name || filters.department : 'All Departments'}</p>
             <p>Status: ${filters.status || 'All Status'}</p>
             <p>Total Records: ${filteredLogs.length} of ${issuanceLogs.length} logs</p>
           </div>

          <div class="section">
            <h2>${isAdmin ? (user?.user?.role === 'Management' ? 'All Issuance Logs (Management View)' : 'All Issuance Logs') : 'My Issued Items'}</h2>
            <table>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Item Details</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Issue Date</th>
                  <th>Return Date</th>
                  <th>Issued By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredLogs.map(log => `
                  <tr>
                    <td>${log.log_id}</td>
                    <td>
                      <strong>${log.serial_number}</strong><br>
                      <small>${log.brand} ${log.model}</small>
                    </td>
                    <td>${log.employee_name || log.employee_id}</td>
                    <td>${log.department_name || '-'}</td>
                    <td>${log.issue_date}</td>
                    <td>${log.return_date || '-'}</td>
                    <td>${log.issued_by_username || 'System'}</td>
                    <td>
                      <span class="status-badge ${
                        log.status === 'Issued' ? 'status-issued' :
                        log.status === 'Returned' ? 'status-returned' : ''
                      }">
                        ${log.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>



          <div class="section">
            <h2>Summary Statistics</h2>
            <table>
              <tr>
                <th>Metric</th>
                <th>Count</th>
              </tr>
              <tr>
                <td>Total Issuance Logs</td>
                <td>${issuanceLogs.length}</td>
              </tr>
              <tr>
                <td>Filtered Logs</td>
                <td>${filteredLogs.length}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setPrinting(false);
    }, 500);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {isAdmin ? (user?.user?.role === 'Management' ? 'All Reports (Management)' : 'All Reports') : 'My Reports'}
        </h1>
        <button
          onClick={handlePrint}
          disabled={printing}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {printing ? '🔄 Printing...' : '🖨️ Print Report'}
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              {isAdmin 
                ? `📊 You can see all issuance reports as ${user?.user?.role === 'Management' ? 'Management' : 'Admin'}.` 
                : '📊 You can see only the items you have issued.'
              }
            </p>
          </div>
          
          {/* Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Employee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  value={filters.employee}
                  onChange={(e) => handleFilterChange('employee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-900">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id} className="text-gray-900">
                      {emp.employee_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item
                </label>
                <select
                  value={filters.item}
                  onChange={(e) => handleFilterChange('item', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-900">All Items</option>
                  {items.map(item => (
                    <option key={item.item_id} value={item.item_id} className="text-gray-900">
                      {item.serial_number} - {item.brand} {item.model}
                    </option>
                  ))}
                </select>
              </div>

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

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-900">All Status</option>
                  <option value="Issued" className="text-gray-900">Issued</option>
                  <option value="Returned" className="text-gray-900">Returned</option>
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
              Showing {filteredLogs.length} of {issuanceLogs.length} logs
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {isAdmin ? (user?.user?.role === 'Management' ? 'All Issuance Logs (Management View)' : 'All Issuance Logs') : 'My Issued Items'}
          </h2>
          <table className="min-w-full border text-sm mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Log ID</th>
                <th className="border px-2 py-1">Item Details</th>
                <th className="border px-2 py-1">Employee</th>
                <th className="border px-2 py-1">Department</th>
                <th className="border px-2 py-1">Issue Date</th>
                <th className="border px-2 py-1">Return Date</th>
                <th className="border px-2 py-1">Issued By</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.log_id} className="border-t">
                  <td className="border px-2 py-1">{log.log_id}</td>
                  <td className="border px-2 py-1">
                    <div>
                      <div className="font-medium">{log.serial_number}</div>
                      <div className="text-xs text-gray-600">{log.brand} {log.model}</div>
                    </div>
                  </td>
                  <td className="border px-2 py-1">{log.employee_name || log.employee_id}</td>
                  <td className="border px-2 py-1">{log.department_name || '-'}</td>
                  <td className="border px-2 py-1">{log.issue_date}</td>
                  <td className="border px-2 py-1">{log.return_date || '-'}</td>
                  <td className="border px-2 py-1">
                    <span className="text-sm text-gray-700">
                      {log.issued_by_username || 'System'}
                    </span>
                  </td>
                  <td className="border px-2 py-1">
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


        </>
      )}
    </div>
  );
};

export default ReportsPage; 