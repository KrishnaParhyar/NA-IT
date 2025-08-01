const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🔧 Setting up NA Inventory Database...\n');

  try {
    // Step 1: Create .env file if it doesn't exist
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env file...');
      const envContent = `DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=na_inventory_db
PORT=8080
JWT_SECRET=na_inventory_jwt_secret_2024`;
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created successfully!');
    } else {
      console.log('✅ .env file already exists');
    }

    // Step 2: Test database connection
    console.log('\n🔍 Testing database connection...');
    let connection;
    try {
      // Load environment variables
      require('dotenv').config();
      
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'na_inventory_db'
      });
      console.log('✅ Database connection successful!');
    } catch (error) {
      if (error.code === 'ER_BAD_DB_ERROR') {
        console.log('❌ Database "na_inventory_db" does not exist!');
        console.log('📝 Please create the database first:');
        console.log('   1. Open MySQL command line or workbench');
        console.log('   2. Run: CREATE DATABASE na_inventory_db;');
        console.log('   3. Run: USE na_inventory_db;');
        console.log('   4. Run the schema: mysql -u root -p na_inventory_db < schema.sql');
        return;
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Cannot connect to MySQL server!');
        console.log('📝 Please make sure MySQL is installed and running');
        return;
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('❌ Access denied! Please check your MySQL credentials');
        console.log('📝 You may need to set a password for root user or update .env file');
        return;
      } else {
        console.log('❌ Database connection failed:', error.message);
        return;
      }
    }

    // Step 3: Check if tables exist
    console.log('\n📊 Checking database tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    if (tables.length === 0) {
      console.log('❌ No tables found in database!');
      console.log('📝 Please run the schema first: mysql -u root -p na_inventory_db < schema.sql');
      await connection.end();
      return;
    }
    console.log(`✅ Found ${tables.length} tables in database`);

    // Step 4: Check if peripheral categories exist
    console.log('\n🔍 Checking peripheral categories...');
    const [categories] = await connection.execute('SELECT category_name FROM categories');
    const categoryNames = categories.map(cat => cat.category_name);
    const peripheralCategories = ['Mouse', 'Keyboard', 'Speaker', 'Monitor', 'Headphone', 'Webcam', 'Microphone', 'Printer', 'Scanner', 'USB Drive', 'External Hard Drive', 'Network Cable', 'Power Cable', 'Adapter'];
    
    const missingCategories = peripheralCategories.filter(cat => !categoryNames.includes(cat));
    if (missingCategories.length > 0) {
      console.log('⚠️  Missing peripheral categories:', missingCategories.join(', '));
      console.log('📝 Running add_peripherals.js to add missing categories and devices...');
      
      // Import and run the add_peripherals script
      const addPeripheralsPath = path.join(__dirname, 'add_peripherals.js');
      if (fs.existsSync(addPeripheralsPath)) {
        try {
          require('./add_peripherals.js');
          console.log('✅ Peripheral devices added successfully!');
        } catch (error) {
          console.log('❌ Error running add_peripherals.js:', error.message);
        }
      } else {
        console.log('❌ add_peripherals.js file not found!');
      }
    } else {
      console.log('✅ All peripheral categories exist');
    }

    // Step 5: Check peripheral devices count
    console.log('\n📈 Checking peripheral devices...');
    const [peripheralCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM items i 
      JOIN categories c ON i.category_id = c.category_id 
      WHERE c.category_name IN (?)
    `, [peripheralCategories]);
    
    console.log(`📊 Found ${peripheralCount[0].count} peripheral devices`);

    if (peripheralCount[0].count === 0) {
      console.log('⚠️  No peripheral devices found!');
      console.log('📝 Running add_peripherals.js to add sample devices...');
      
      const addPeripheralsPath = path.join(__dirname, 'add_peripherals.js');
      if (fs.existsSync(addPeripheralsPath)) {
        try {
          require('./add_peripherals.js');
          console.log('✅ Peripheral devices added successfully!');
        } catch (error) {
          console.log('❌ Error running add_peripherals.js:', error.message);
        }
      }
    }

    await connection.end();
    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Start frontend: cd ../frontend && npm run dev');
    console.log('   3. Open browser and navigate to the application');
    console.log('   4. Check Items page and Peripheral Devices Modal for peripherals');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase(); 