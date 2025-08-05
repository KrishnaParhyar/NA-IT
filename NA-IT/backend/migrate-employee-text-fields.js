const mysql = require('mysql2/promise');
require('dotenv').config();

const migrateEmployeeTextFields = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'na_inventory_db',
      multipleStatements: true
    });
    console.log('🔗 Connected to database successfully');

    // Get foreign key constraint names
    const [fkRows] = await connection.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'employees' AND TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    for (const row of fkRows) {
      console.log(`Dropping foreign key: ${row.CONSTRAINT_NAME}`);
      await connection.query(`ALTER TABLE employees DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
    }

    // Change columns to VARCHAR(255)
    await connection.query(`
      ALTER TABLE employees
        MODIFY department_id VARCHAR(255),
        MODIFY designation_id VARCHAR(255)
    `);
    console.log('✅ Columns department_id and designation_id changed to VARCHAR(255)');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

if (require.main === module) {
  migrateEmployeeTextFields()
    .then(() => {
      console.log('✅ Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateEmployeeTextFields;