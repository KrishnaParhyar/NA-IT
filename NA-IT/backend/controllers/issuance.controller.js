const db = require('../config/db');

// Issue an item to an employee
exports.issueItem = async (req, res) => {
  const { item_id, employee_id, issue_date } = req.body;
  const issued_by_user_id = req.user?.userId || null; // Get from authenticated user
  
  console.log('🔍 ISSUANCE REQUEST:', { item_id, employee_id, issue_date, issued_by_user_id });
  console.log('🔍 REQ.USER:', req.user);
  
  try {
    // Check if item exists and is available
    const [itemCheck] = await db.query('SELECT status FROM items WHERE item_id = ?', [item_id]);
    if (itemCheck.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (itemCheck[0].status !== 'In Stock') {
      return res.status(400).json({ message: 'Item is not available for issuance' });
    }

    console.log('🔍 Updating item status to Issued for item_id:', item_id);
    // Mark item as issued
    await db.query('UPDATE items SET status = ? WHERE item_id = ?', ['Issued', item_id]);
    
    console.log('🔍 Adding to issuance log with issued_by_user_id:', issued_by_user_id);
    // Add to issuance log
    const [insertResult] = await db.query(
      'INSERT INTO issuance_logs (item_id, employee_id, issue_date, status, issued_by_user_id) VALUES (?, ?, ?, ?, ?)',
      [item_id, employee_id, issue_date, 'Issued', issued_by_user_id]
    );
    console.log('🔍 Insert result:', insertResult);
    
    res.status(201).json({ message: 'Item issued successfully!' });
  } catch (error) {
    console.error('ISSUE ITEM ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Issue multiple peripheral devices
exports.issuePeripherals = async (req, res) => {
  const { item_ids, employee_id, issue_date } = req.body;
  const issued_by_user_id = req.user?.userId || null;
  
  try {
    if (!Array.isArray(item_ids) || item_ids.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one item ID' });
    }

    // Check if all items exist and are available
    const placeholders = item_ids.map(() => '?').join(',');
    const [itemCheck] = await db.query(
      `SELECT item_id, status FROM items WHERE item_id IN (${placeholders})`,
      item_ids
    );

    if (itemCheck.length !== item_ids.length) {
      return res.status(404).json({ message: 'One or more items not found' });
    }

          const unavailableItems = itemCheck.filter(item => item.status !== 'In Stock');
      if (unavailableItems.length > 0) {
        return res.status(400).json({
          message: 'Some items are not available for issuance',
          unavailableItems: unavailableItems.map(item => item.item_id)
        });
      }

    // Issue all items in a transaction
    await db.query('START TRANSACTION');
    
    try {
      // Mark all items as issued
      await db.query(
        `UPDATE items SET status = ? WHERE item_id IN (${placeholders})`,
        ['Issued', ...item_ids]
      );
      
      // Add all to issuance logs
      for (const item_id of item_ids) {
        await db.query(
          'INSERT INTO issuance_logs (item_id, employee_id, issue_date, status, issued_by_user_id) VALUES (?, ?, ?, ?, ?)',
          [item_id, employee_id, issue_date, 'Issued', issued_by_user_id]
        );
      }
      
      await db.query('COMMIT');
      res.status(201).json({ message: `${item_ids.length} peripheral device(s) issued successfully!` });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('ISSUE PERIPHERALS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark an item as returned
exports.receiveItem = async (req, res) => {
  const { log_id, return_date } = req.body;
  try {
    // Update issuance log
    await db.query('UPDATE issuance_logs SET return_date = ?, status = ? WHERE log_id = ?', [return_date, 'Returned', log_id]);
    // Mark item as available
    const [log] = await db.query('SELECT item_id FROM issuance_logs WHERE log_id = ?', [log_id]);
    if (log.length > 0) {
      await db.query('UPDATE items SET status = ? WHERE item_id = ?', ['In Stock', log[0].item_id]);
    }
    res.status(200).json({ message: 'Item marked as returned!' });
  } catch (error) {
    console.error('RECEIVE ITEM ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get issuance/return history (filtered by user role)
exports.getIssuanceLogs = async (req, res) => {
  try {
    const currentUser = req.user;

    let query, params;

    // Admin, Operator, and Management can see all logs, others see only their own
    if (currentUser.role === 'Admin' || currentUser.role === 'Operator' || currentUser.role === 'Management') {
      query = `
        SELECT il.*, i.serial_number, i.brand, i.model, e.employee_name, e.department_id, d.department_name, u.username as issued_by_username
        FROM issuance_logs il
        LEFT JOIN items i ON il.item_id = i.item_id
        LEFT JOIN employees e ON il.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN users u ON il.issued_by_user_id = u.user_id
        ORDER BY il.issue_date DESC
      `;
      params = [];
    } else {
      query = `
        SELECT il.*, i.serial_number, i.brand, i.model, e.employee_name, e.department_id, d.department_name, u.username as issued_by_username
        FROM issuance_logs il
        LEFT JOIN items i ON il.item_id = i.item_id
        LEFT JOIN employees e ON il.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN users u ON il.issued_by_user_id = u.user_id
        WHERE il.issued_by_user_id = ?
        ORDER BY il.issue_date DESC
      `;
      params = [currentUser.userId];
    }

    const [logs] = await db.query(query, params);
    console.log('🔍 Raw logs from database:', logs);
    
    // Format dates to remove time part
    const formattedLogs = logs.map(log => ({
      ...log,
      issue_date: log.issue_date ? log.issue_date.toISOString().split('T')[0] : null,
      return_date: log.return_date ? log.return_date.toISOString().split('T')[0] : null
    }));
    
    console.log('🔍 Formatted logs being sent:', formattedLogs);
    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error('GET ISSUANCE LOGS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's own issued items (for regular users)
exports.getMyIssuedItems = async (req, res) => {
  try {
    const currentUser = req.user;

    
    const query = `
      SELECT il.*, i.serial_number, i.brand, i.model, e.employee_name, e.department_id, d.department_name, u.username as issued_by_username
      FROM issuance_logs il
      LEFT JOIN items i ON il.item_id = i.item_id
      LEFT JOIN employees e ON il.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN users u ON il.issued_by_user_id = u.user_id
      WHERE il.issued_by_user_id = ?
      ORDER BY il.issue_date DESC
    `;
    
    const [logs] = await db.query(query, [currentUser.userId]);
    
    // Format dates to remove time part
    const formattedLogs = logs.map(log => ({
      ...log,
      issue_date: log.issue_date ? log.issue_date.toISOString().split('T')[0] : null,
      return_date: log.return_date ? log.return_date.toISOString().split('T')[0] : null
    }));
    
    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error('GET MY ISSUED ITEMS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 