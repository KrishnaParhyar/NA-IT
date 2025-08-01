const mysql = require('mysql2/promise');
require('dotenv').config();

const checkItemDependencies = async (itemId) => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'na_inventory_db'
    });

    try {
        console.log(`🔍 Checking dependencies for item ID: ${itemId}`);
        
        // Check if item exists
        const [items] = await connection.execute('SELECT * FROM items WHERE item_id = ?', [itemId]);
        if (items.length === 0) {
            console.log('❌ Item not found');
            return;
        }
        
        const item = items[0];
        console.log(`📦 Item: ${item.brand} ${item.model} (${item.serial_number})`);
        
        // Check issuance logs
        const [issuanceLogs] = await connection.execute('SELECT COUNT(*) as count FROM issuance_logs WHERE item_id = ?', [itemId]);
        console.log(`📋 Issuance logs: ${issuanceLogs[0].count}`);
        
        if (issuanceLogs[0].count > 0) {
            const [detailedLogs] = await connection.execute(`
                SELECT il.*, e.employee_name, u.username as issued_by
                FROM issuance_logs il
                LEFT JOIN employees e ON il.employee_id = e.employee_id
                LEFT JOIN users u ON il.issued_by_user_id = u.user_id
                WHERE il.item_id = ?
            `, [itemId]);
            
            console.log('📋 Issuance history:');
            detailedLogs.forEach(log => {
                console.log(`   - ${log.status} to ${log.employee_name || 'Unknown'} on ${log.issue_date} by ${log.issued_by || 'Unknown'}`);
            });
        }
        
        // Check documents
        const [documents] = await connection.execute('SELECT COUNT(*) as count FROM item_documents WHERE item_id = ?', [itemId]);
        console.log(`📄 Documents: ${documents[0].count}`);
        
        if (documents[0].count > 0) {
            const [detailedDocs] = await connection.execute(`
                SELECT id.*, u.username as uploaded_by
                FROM item_documents id
                LEFT JOIN users u ON id.uploaded_by_user_id = u.user_id
                WHERE id.item_id = ?
            `, [itemId]);
            
            console.log('📄 Document details:');
            detailedDocs.forEach(doc => {
                console.log(`   - ${doc.original_filename} (${doc.file_size} bytes) uploaded by ${doc.uploaded_by || 'Unknown'}`);
            });
        }
        
        // Check composite items
        const [compositeItems] = await connection.execute(`
            SELECT COUNT(*) as count FROM composite_items 
            WHERE desktop_id = ? OR cpu_id = ? OR lcd_id = ? OR keyboard_id = ? OR mouse_id = ? OR speaker_id = ?
        `, [itemId, itemId, itemId, itemId, itemId, itemId]);
        console.log(`🔗 Composite items: ${compositeItems[0].count}`);
        
        if (compositeItems[0].count > 0) {
            const [detailedComposite] = await connection.execute(`
                SELECT ci.*, i.brand, i.model, i.serial_number
                FROM composite_items ci
                LEFT JOIN items i ON ci.desktop_id = i.item_id
                WHERE ci.desktop_id = ? OR ci.cpu_id = ? OR ci.lcd_id = ? OR ci.keyboard_id = ? OR ci.mouse_id = ? OR ci.speaker_id = ?
            `, [itemId, itemId, itemId, itemId, itemId, itemId]);
            
            console.log('🔗 Composite item details:');
            detailedComposite.forEach(comp => {
                console.log(`   - Part of composite: ${comp.brand} ${comp.model} (${comp.serial_number})`);
            });
        }
        
        // Summary
        const totalDependencies = issuanceLogs[0].count + documents[0].count + compositeItems[0].count;
        if (totalDependencies === 0) {
            console.log('✅ Item can be safely deleted (no dependencies)');
        } else {
            console.log(`❌ Item cannot be deleted due to ${totalDependencies} dependencies`);
            console.log('\n💡 To delete this item, you need to:');
            if (issuanceLogs[0].count > 0) {
                console.log('   1. Return all issued items or delete issuance logs');
            }
            if (documents[0].count > 0) {
                console.log('   2. Remove all associated documents');
            }
            if (compositeItems[0].count > 0) {
                console.log('   3. Remove from composite items');
            }
        }
        
    } catch (error) {
        console.error('Error checking dependencies:', error);
    } finally {
        await connection.end();
    }
};

// Usage: node check-item-dependencies.js <item_id>
const itemId = process.argv[2];
if (!itemId) {
    console.log('Usage: node check-item-dependencies.js <item_id>');
    process.exit(1);
}

checkItemDependencies(itemId); 