const db = require('../config/db');

// Get all items from the inventory
exports.getAllItems = async (req, res) => {
    try {
        const { search, brand, category, status } = req.query;
        let sql = `
            SELECT i.*, c.category_name 
            FROM items i
            LEFT JOIN categories c ON i.category_id = c.category_id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += " AND (i.serial_number LIKE ? OR i.model LIKE ? OR i.brand LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        if (brand) {
            sql += " AND i.brand = ?";
            params.push(brand);
        }
        if (category) {
            sql += " AND i.category_id = ?";
            params.push(category);
        }
        if (status) {
            sql += " AND i.status = ?";
            params.push(status);
        }

        const [items] = await db.query(sql, params);
        
        // Format dates to remove time part
        const formattedItems = items.map(item => ({
          ...item,
          date_of_purchase: item.date_of_purchase ? item.date_of_purchase.toISOString().split('T')[0] : null
        }));
        
        res.status(200).json(formattedItems);
    } catch (error) {
        console.error("GET ALL ITEMS ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new item
exports.createItem = async (req, res) => {
    const { category_id, serial_number, brand, model, specifications, vendor, date_of_purchase, warranty_end_date } = req.body;
    
    console.log('🔍 CREATE ITEM REQUEST:', req.body);

    if (!category_id || !serial_number || !brand || !model) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ message: 'Please provide all required fields: category, serial number, brand, and model.' });
    }

    try {
        // Check for duplicate serial number
        const [existing] = await db.query('SELECT item_id FROM items WHERE serial_number = ?', [serial_number]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'An item with this serial number already exists.' });
        }

        const [result] = await db.query(
            'INSERT INTO items (category_id, serial_number, brand, model, specifications, vendor, date_of_purchase, warranty_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [category_id, serial_number, brand, model, specifications, vendor, date_of_purchase, warranty_end_date]
        );

        const itemId = result.insertId;

        res.status(201).json({ 
            message: 'Item created successfully!', 
            itemId: itemId
        });
    } catch (error) {
        console.error("CREATE ITEM ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single item by its ID
exports.getItemById = async (req, res) => {
    const { id } = req.params;
    try {
        const [items] = await db.query(`
            SELECT i.*, c.category_name 
            FROM items i
            LEFT JOIN categories c ON i.category_id = c.category_id
            WHERE i.item_id = ?
        `, [id]);

        if (items.length === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        
        // Format date to remove time part
        const formattedItem = {
            ...items[0],
            date_of_purchase: items[0].date_of_purchase ? items[0].date_of_purchase.toISOString().split('T')[0] : null
        };
        
        res.status(200).json(formattedItem);
    } catch (error) {
        console.error("GET ITEM BY ID ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update an existing item
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { category_id, serial_number, brand, model, specifications, vendor, date_of_purchase, warranty_end_date, status } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE items SET category_id = ?, serial_number = ?, brand = ?, model = ?, specifications = ?, vendor = ?, date_of_purchase = ?, warranty_end_date = ?, status = ? WHERE item_id = ?',
            [category_id, serial_number, brand, model, specifications, vendor, date_of_purchase, warranty_end_date, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found or no new data to update.' });
        }
        res.status(200).json({ message: 'Item updated successfully!' });
    } catch (error) {
        console.error("UPDATE ITEM ERROR:", error);
        // Handle duplicate serial number on update
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Another item with this serial number already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete an item from the inventory
exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        console.log('🔍 DELETE ITEM REQUEST:', { id, user: req.user });
        
        // Check if item exists
        const [items] = await db.query('SELECT * FROM items WHERE item_id = ?', [id]);
        if (items.length === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        
        // Check if item has issuance logs
        const [issuanceLogs] = await db.query('SELECT COUNT(*) as count FROM issuance_logs WHERE item_id = ?', [id]);
        console.log('🔍 Issuance logs for this item:', issuanceLogs[0].count);
        
        if (issuanceLogs[0].count > 0) {
            console.log('❌ Cannot delete item - has issuance history');
            return res.status(400).json({ 
                message: 'Cannot delete item. It has issuance history. Please return all issued items first.',
                issuanceCount: issuanceLogs[0].count
            });
        }
        
        // Check if item has documents
        const [documents] = await db.query('SELECT COUNT(*) as count FROM item_documents WHERE item_id = ?', [id]);
        console.log('🔍 Documents for this item:', documents[0].count);
        
        if (documents[0].count > 0) {
            console.log('❌ Cannot delete item - has documents');
            return res.status(400).json({ 
                message: 'Cannot delete item. It has associated documents. Please remove documents first.',
                documentCount: documents[0].count
            });
        }
        
        // Check if item is part of composite items
        const [compositeItems] = await db.query('SELECT COUNT(*) as count FROM composite_items WHERE desktop_id = ? OR cpu_id = ? OR lcd_id = ? OR keyboard_id = ? OR mouse_id = ? OR speaker_id = ?', [id, id, id, id, id, id]);
        console.log('🔍 Composite items using this item:', compositeItems[0].count);
        
        if (compositeItems[0].count > 0) {
            console.log('❌ Cannot delete item - part of composite items');
            return res.status(400).json({ 
                message: 'Cannot delete item. It is part of composite items. Please remove from composite items first.',
                compositeCount: compositeItems[0].count
            });
        }
        
        // Delete the item
        const [result] = await db.query('DELETE FROM items WHERE item_id = ?', [id]);
        console.log('✅ Item deleted successfully');
        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error("DELETE ITEM ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 