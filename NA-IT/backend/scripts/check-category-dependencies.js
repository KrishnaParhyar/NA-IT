const mysql = require('mysql2/promise');
require('dotenv').config();

const checkCategoryDependencies = async (categoryId) => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'na_inventory_db'
    });

    try {
        console.log(`🔍 Checking dependencies for category ID: ${categoryId}`);
        
        // Check if category exists
        const [categories] = await connection.execute('SELECT * FROM categories WHERE category_id = ?', [categoryId]);
        if (categories.length === 0) {
            console.log('❌ Category not found');
            return;
        }
        
        const category = categories[0];
        console.log(`📂 Category: ${category.category_name}`);
        
        // Check items using this category
        const [items] = await connection.execute('SELECT COUNT(*) as count FROM items WHERE category_id = ?', [categoryId]);
        console.log(`📦 Items using this category: ${items[0].count}`);
        
        if (items[0].count > 0) {
            const [detailedItems] = await connection.execute(`
                SELECT item_id, brand, model, serial_number, status
                FROM items 
                WHERE category_id = ?
                ORDER BY brand, model
            `, [categoryId]);
            
            console.log('📦 Items in this category:');
            detailedItems.forEach(item => {
                console.log(`   - ${item.brand} ${item.model} (${item.serial_number}) - ${item.status}`);
            });
        }
        
        // Summary
        if (items[0].count === 0) {
            console.log('✅ Category can be safely deleted (no items using it)');
        } else {
            console.log(`❌ Category cannot be deleted due to ${items[0].count} items using it`);
            console.log('\n💡 To delete this category, you need to:');
            console.log('   1. Delete or reassign all items in this category to another category');
        }
        
    } catch (error) {
        console.error('Error checking dependencies:', error);
    } finally {
        await connection.end();
    }
};

// Usage: node check-category-dependencies.js <category_id>
const categoryId = process.argv[2];
if (!categoryId) {
    console.log('Usage: node check-category-dependencies.js <category_id>');
    process.exit(1);
}

checkCategoryDependencies(categoryId); 