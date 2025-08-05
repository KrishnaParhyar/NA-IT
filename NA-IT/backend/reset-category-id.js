const mysql = require('mysql2/promise');
require('dotenv').config();

const resetCategoryId = async () => {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'na_inventory_db'
        });

        console.log('🔗 Connected to database successfully');

        // Reset AUTO_INCREMENT to 1
        await connection.execute('ALTER TABLE categories AUTO_INCREMENT = 1');
        console.log('✅ Categories table AUTO_INCREMENT reset to 1');

        // Verify the current AUTO_INCREMENT value
        const [result] = await connection.execute('SHOW TABLE STATUS LIKE "categories"');
        console.log('🔍 Current AUTO_INCREMENT value:', result[0].Auto_increment);

        console.log('🎉 Category ID reset completed successfully!');

    } catch (error) {
        console.error('❌ Error resetting category ID:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
};

// Run the reset if this file is executed directly
if (require.main === module) {
    resetCategoryId()
        .then(() => {
            console.log('✅ Category ID reset completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Category ID reset failed:', error);
            process.exit(1);
        });
}

module.exports = resetCategoryId; 