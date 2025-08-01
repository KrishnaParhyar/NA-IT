const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDocumentsTable = async () => {
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

        // Create item_documents table
        const createDocumentsTable = `
            CREATE TABLE IF NOT EXISTS item_documents (
                document_id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT NOT NULL,
                original_filename VARCHAR(255) NOT NULL,
                stored_filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size INT NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                uploaded_by_user_id INT,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
                FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id)
            )
        `;

        await connection.execute(createDocumentsTable);
        console.log('✅ item_documents table created successfully');

        // Create uploads directory if it doesn't exist
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, 'uploads/documents');
        
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('✅ Uploads directory created successfully');
        } else {
            console.log('✅ Uploads directory already exists');
        }

        console.log('🎉 Documents system setup completed successfully!');

    } catch (error) {
        console.error('❌ Error setting up documents table:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
};

// Run the setup if this file is executed directly
if (require.main === module) {
    setupDocumentsTable()
        .then(() => {
            console.log('✅ Documents table setup completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Documents table setup failed:', error);
            process.exit(1);
        });
}

module.exports = setupDocumentsTable; 