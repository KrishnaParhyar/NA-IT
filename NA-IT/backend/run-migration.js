const db = require('./config/db');

async function runMigration() {
  try {
    console.log('Running migration: Adding warranty_end_date column...');
    
    // Check if column already exists
    const [columns] = await db.query("SHOW COLUMNS FROM items LIKE 'warranty_end_date'");
    
    if (columns.length === 0) {
      // Add the column
      await db.query('ALTER TABLE items ADD COLUMN warranty_end_date DATE AFTER date_of_purchase');
      console.log('✅ Successfully added warranty_end_date column to items table');
    } else {
      console.log('ℹ️ warranty_end_date column already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration(); 