const mysql = require('mysql2/promise');
require('dotenv').config();

async function testPeripherals() {
  console.log('🧪 Testing Peripheral Devices Setup...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'na_inventory_db'
    });

    // Test 1: Check peripheral categories
    console.log('1️⃣ Checking peripheral categories...');
    const [categories] = await connection.execute(`
      SELECT category_name, COUNT(*) as item_count 
      FROM categories c 
      LEFT JOIN items i ON c.category_id = i.category_id 
      WHERE c.category_name IN ('Mouse', 'Keyboard', 'Speaker', 'Monitor', 'Headphone', 'Webcam', 'Microphone', 'Printer', 'Scanner', 'USB Drive', 'External Hard Drive', 'Network Cable', 'Power Cable', 'Adapter')
      GROUP BY c.category_id, c.category_name
      ORDER BY item_count DESC
    `);
    
    console.log(`✅ Found ${categories.length} peripheral categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.category_name}: ${cat.item_count} items`);
    });

    // Test 2: Check total peripheral devices
    console.log('\n2️⃣ Checking total peripheral devices...');
    const [totalPeripherals] = await connection.execute(`
      SELECT COUNT(*) as count FROM items i 
      JOIN categories c ON i.category_id = c.category_id 
      WHERE c.category_name IN ('Mouse', 'Keyboard', 'Speaker', 'Monitor', 'Headphone', 'Webcam', 'Microphone', 'Printer', 'Scanner', 'USB Drive', 'External Hard Drive', 'Network Cable', 'Power Cable', 'Adapter')
    `);
    console.log(`✅ Total peripheral devices: ${totalPeripherals[0].count}`);

    // Test 3: Check available peripheral devices
    console.log('\n3️⃣ Checking available peripheral devices...');
    const [availablePeripherals] = await connection.execute(`
      SELECT COUNT(*) as count FROM items i 
      JOIN categories c ON i.category_id = c.category_id 
      WHERE c.category_name IN ('Mouse', 'Keyboard', 'Speaker', 'Monitor', 'Headphone', 'Webcam', 'Microphone', 'Printer', 'Scanner', 'USB Drive', 'External Hard Drive', 'Network Cable', 'Power Cable', 'Adapter')
      AND i.status = 'In Stock'
    `);
    console.log(`✅ Available peripheral devices: ${availablePeripherals[0].count}`);

    // Test 4: Check employees (needed for issuance)
    console.log('\n4️⃣ Checking employees...');
    const [employees] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    console.log(`✅ Total employees: ${employees[0].count}`);
    
    if (employees[0].count === 0) {
      console.log('⚠️  No employees found! You need employees to issue items.');
      console.log('📝 Add some employees first through the Employees page.');
    } else {
      const [sampleEmployees] = await connection.execute('SELECT employee_id, employee_name FROM employees LIMIT 3');
      console.log('📋 Sample employees:');
      sampleEmployees.forEach(emp => {
        console.log(`   - ${emp.employee_name} (ID: ${emp.employee_id})`);
      });
    }

    // Test 5: Sample peripheral devices
    console.log('\n5️⃣ Sample peripheral devices:');
    const [sampleDevices] = await connection.execute(`
      SELECT i.item_id, i.brand, i.model, i.serial_number, c.category_name, i.status
      FROM items i 
      JOIN categories c ON i.category_id = c.category_id 
      WHERE c.category_name IN ('Mouse', 'Keyboard', 'Speaker', 'Monitor', 'Headphone', 'Webcam', 'Microphone', 'Printer', 'Scanner', 'USB Drive', 'External Hard Drive', 'Network Cable', 'Power Cable', 'Adapter')
      AND i.status = 'In Stock'
      LIMIT 10
    `);
    
    console.log('📋 Available peripheral devices (first 10):');
    sampleDevices.forEach(device => {
      console.log(`   - ${device.brand} ${device.model} (${device.category_name}) - ${device.serial_number}`);
    });

    await connection.end();
    
    console.log('\n🎉 Peripheral devices test completed!');
    console.log('\n📋 Summary:');
    if (totalPeripherals[0].count > 0) {
      console.log('✅ Peripheral devices are properly loaded');
      console.log('✅ You can now issue peripheral devices through the UI');
    } else {
      console.log('❌ No peripheral devices found');
      console.log('📝 Run: node add_peripherals.js to add devices');
    }
    
    if (employees[0].count === 0) {
      console.log('⚠️  No employees found - add employees first');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPeripherals(); 