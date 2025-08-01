const mysql = require('mysql2/promise');

async function addPeripheralDevices() {
  try {
    console.log('🔍 Connecting to database...');

    // Load environment variables
    require('dotenv').config();
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'na_inventory_db'
    });

    console.log('✅ Connected to na_inventory_db database');

    // Add peripheral device categories
    console.log('\n📝 Adding peripheral device categories...');
    
    const categories = [
      'Mouse', 'Keyboard', 'Speaker', 'Monitor', 'Headphone', 
      'Webcam', 'Microphone', 'Printer', 'Scanner', 'USB Drive', 
      'External Hard Drive', 'Network Cable', 'Power Cable', 'Adapter'
    ];

    for (const category of categories) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO categories (category_name) VALUES (?)',
          [category]
        );
        console.log(`✅ Added category: ${category}`);
      } catch (error) {
        console.log(`⚠️  Category ${category} already exists or error: ${error.message}`);
      }
    }

    // Get category IDs for peripheral devices
    console.log('\n🔍 Getting category IDs...');
    const categoryPlaceholders = categories.map(() => '?').join(',');
    const [categoryRows] = await connection.execute(`SELECT category_id, category_name FROM categories WHERE category_name IN (${categoryPlaceholders})`, categories);
    const categoryMap = {};
    categoryRows.forEach(row => {
      categoryMap[row.category_name] = row.category_id;
    });

    console.log('📋 Found categories:', Object.keys(categoryMap));

    // Add sample peripheral devices
    console.log('\n📝 Adding sample peripheral devices...');

    const devices = [
      // Mouse devices
      { category: 'Mouse', brand: 'Logitech', model: 'M185', serial: 'MS001', specs: 'Wireless Optical Mouse, 1000 DPI' },
      { category: 'Mouse', brand: 'Dell', model: 'MS116', serial: 'MS002', specs: 'Wired Optical Mouse, 800 DPI' },
      { category: 'Mouse', brand: 'HP', model: 'X1000', serial: 'MS003', specs: 'Wireless Mouse, 1200 DPI' },
      { category: 'Mouse', brand: 'Microsoft', model: 'Basic', serial: 'MS004', specs: 'Wired USB Mouse' },
      { category: 'Mouse', brand: 'Lenovo', model: 'ThinkPad', serial: 'MS005', specs: 'TrackPoint Mouse' },

      // Keyboard devices
      { category: 'Keyboard', brand: 'Logitech', model: 'K120', serial: 'KB001', specs: 'Wired USB Keyboard' },
      { category: 'Keyboard', brand: 'Dell', model: 'KB216', serial: 'KB002', specs: 'Wired USB Keyboard' },
      { category: 'Keyboard', brand: 'HP', model: 'Elite', serial: 'KB003', specs: 'Wireless Keyboard' },
      { category: 'Keyboard', brand: 'Microsoft', model: 'Wired 600', serial: 'KB004', specs: 'Wired USB Keyboard' },
      { category: 'Keyboard', brand: 'Lenovo', model: 'ThinkPad', serial: 'KB005', specs: 'Laptop Style Keyboard' },

      // Speaker devices
      { category: 'Speaker', brand: 'Logitech', model: 'Z120', serial: 'SP001', specs: '2.0 Stereo Speakers' },
      { category: 'Speaker', brand: 'Dell', model: 'AX210', serial: 'SP002', specs: 'USB Powered Speakers' },
      { category: 'Speaker', brand: 'HP', model: 'S1000', serial: 'SP003', specs: '2.1 Speaker System' },
      { category: 'Speaker', brand: 'Creative', model: 'SBS A120', serial: 'SP004', specs: '2.0 Multimedia Speakers' },
      { category: 'Speaker', brand: 'Bose', model: 'Companion 2', serial: 'SP005', specs: 'Premium 2.0 Speakers' },

      // Monitor devices
      { category: 'Monitor', brand: 'Dell', model: 'P2419H', serial: 'MN001', specs: '24" Full HD Monitor' },
      { category: 'Monitor', brand: 'HP', model: 'E24', serial: 'MN002', specs: '23.8" IPS Monitor' },
      { category: 'Monitor', brand: 'LG', model: '24ML600', serial: 'MN003', specs: '24" LED Monitor' },
      { category: 'Monitor', brand: 'Samsung', model: 'S24F350', serial: 'MN004', specs: '24" Curved Monitor' },
      { category: 'Monitor', brand: 'Acer', model: 'R240HY', serial: 'MN005', specs: '23.8" IPS Monitor' },

      // Headphone devices
      { category: 'Headphone', brand: 'Sony', model: 'WH-1000XM4', serial: 'HP001', specs: 'Wireless Noise Cancelling' },
      { category: 'Headphone', brand: 'Bose', model: 'QuietComfort 35', serial: 'HP002', specs: 'Wireless Headphones' },
      { category: 'Headphone', brand: 'Sennheiser', model: 'HD 450BT', serial: 'HP003', specs: 'Wireless Bluetooth' },
      { category: 'Headphone', brand: 'Audio-Technica', model: 'ATH-M50x', serial: 'HP004', specs: 'Studio Monitor' },
      { category: 'Headphone', brand: 'JBL', model: 'Tune 500BT', serial: 'HP005', specs: 'Wireless On-Ear' },

      // Webcam devices
      { category: 'Webcam', brand: 'Logitech', model: 'C920', serial: 'WC001', specs: '1080p HD Webcam' },
      { category: 'Webcam', brand: 'Microsoft', model: 'LifeCam HD-3000', serial: 'WC002', specs: '720p HD Webcam' },
      { category: 'Webcam', brand: 'Razer', model: 'Kiyo', serial: 'WC003', specs: '1080p with Ring Light' },
      { category: 'Webcam', brand: 'Creative', model: 'Live! Cam Sync', serial: 'WC004', specs: '720p HD Webcam' },
      { category: 'Webcam', brand: 'HP', model: 'HD Webcam', serial: 'WC005', specs: '720p HD Webcam' },

      // Microphone devices
      { category: 'Microphone', brand: 'Blue', model: 'Yeti', serial: 'MC001', specs: 'USB Condenser Microphone' },
      { category: 'Microphone', brand: 'Audio-Technica', model: 'AT2020', serial: 'MC002', specs: 'Cardioid Condenser' },
      { category: 'Microphone', brand: 'Shure', model: 'SM58', serial: 'MC003', specs: 'Dynamic Vocal Microphone' },
      { category: 'Microphone', brand: 'Rode', model: 'NT-USB', serial: 'MC004', specs: 'USB Condenser Microphone' },
      { category: 'Microphone', brand: 'Samson', model: 'Go Mic', serial: 'MC005', specs: 'Portable USB Microphone' },

      // Printer devices
      { category: 'Printer', brand: 'HP', model: 'LaserJet Pro', serial: 'PR001', specs: 'Laser Printer' },
      { category: 'Printer', brand: 'Canon', model: 'Pixma', serial: 'PR002', specs: 'Inkjet Printer' },
      { category: 'Printer', brand: 'Epson', model: 'WorkForce', serial: 'PR003', specs: 'All-in-One Printer' },
      { category: 'Printer', brand: 'Brother', model: 'HL-L2350DW', serial: 'PR004', specs: 'Wireless Laser Printer' },
      { category: 'Printer', brand: 'Samsung', model: 'Xpress', serial: 'PR005', specs: 'Laser Printer' },

      // Scanner devices
      { category: 'Scanner', brand: 'Epson', model: 'Perfection V39', serial: 'SC001', specs: 'Photo Scanner' },
      { category: 'Scanner', brand: 'Canon', model: 'CanoScan', serial: 'SC002', specs: 'Flatbed Scanner' },
      { category: 'Scanner', brand: 'HP', model: 'ScanJet', serial: 'SC003', specs: 'Document Scanner' },
      { category: 'Scanner', brand: 'Brother', model: 'ADS-1200', serial: 'SC004', specs: 'Compact Scanner' },
      { category: 'Scanner', brand: 'Fujitsu', model: 'ScanSnap', serial: 'SC005', specs: 'Document Scanner' },

      // USB Drive devices
      { category: 'USB Drive', brand: 'SanDisk', model: 'Cruzer', serial: 'USB001', specs: '32GB USB 2.0' },
      { category: 'USB Drive', brand: 'Kingston', model: 'DataTraveler', serial: 'USB002', specs: '64GB USB 3.0' },
      { category: 'USB Drive', brand: 'Samsung', model: 'BAR Plus', serial: 'USB003', specs: '128GB USB 3.1' },
      { category: 'USB Drive', brand: 'PNY', model: 'Turbo', serial: 'USB004', specs: '16GB USB 2.0' },
      { category: 'USB Drive', brand: 'Transcend', model: 'JetFlash', serial: 'USB005', specs: '8GB USB 2.0' },

      // External Hard Drive devices
      { category: 'External Hard Drive', brand: 'Western Digital', model: 'My Passport', serial: 'EHD001', specs: '1TB Portable HDD' },
      { category: 'External Hard Drive', brand: 'Seagate', model: 'Backup Plus', serial: 'EHD002', specs: '2TB Portable HDD' },
      { category: 'External Hard Drive', brand: 'Samsung', model: 'T5', serial: 'EHD003', specs: '500GB Portable SSD' },
      { category: 'External Hard Drive', brand: 'LaCie', model: 'Rugged', serial: 'EHD004', specs: '1TB Rugged HDD' },
      { category: 'External Hard Drive', brand: 'Toshiba', model: 'Canvio', serial: 'EHD005', specs: '1TB Portable HDD' },

      // Network Cable devices
      { category: 'Network Cable', brand: 'Belkin', model: 'Cat6', serial: 'NC001', specs: '10ft Cat6 Ethernet Cable' },
      { category: 'Network Cable', brand: 'Cable Matters', model: 'Cat5e', serial: 'NC002', specs: '25ft Cat5e Cable' },
      { category: 'Network Cable', brand: 'Mediabridge', model: 'Cat7', serial: 'NC003', specs: '50ft Cat7 Cable' },
      { category: 'Network Cable', brand: 'UGREEN', model: 'Cat6', serial: 'NC004', specs: '15ft Cat6 Cable' },
      { category: 'Network Cable', brand: 'Jadaol', model: 'Cat5e', serial: 'NC005', specs: '100ft Cat5e Cable' },

      // Power Cable devices
      { category: 'Power Cable', brand: 'Tripp Lite', model: 'Standard', serial: 'PC001', specs: '6ft Power Cord' },
      { category: 'Power Cable', brand: 'Belkin', model: 'Surge', serial: 'PC002', specs: '8ft Surge Protected' },
      { category: 'Power Cable', brand: 'APC', model: 'UPS Cable', serial: 'PC003', specs: '10ft UPS Cable' },
      { category: 'Power Cable', brand: 'CyberPower', model: 'Extension', serial: 'PC004', specs: '12ft Extension Cord' },
      { category: 'Power Cable', brand: 'Monoprice', model: 'Heavy Duty', serial: 'PC005', specs: '15ft Heavy Duty' },

      // Adapter devices
      { category: 'Adapter', brand: 'Apple', model: 'USB-C', serial: 'AD001', specs: 'USB-C to USB Adapter' },
      { category: 'Adapter', brand: 'Anker', model: 'HDMI', serial: 'AD002', specs: 'USB-C to HDMI Adapter' },
      { category: 'Adapter', brand: 'Cable Matters', model: 'VGA', serial: 'AD003', specs: 'HDMI to VGA Adapter' },
      { category: 'Adapter', brand: 'UGREEN', model: 'Ethernet', serial: 'AD004', specs: 'USB to Ethernet Adapter' },
      { category: 'Adapter', brand: 'StarTech', model: 'DisplayPort', serial: 'AD005', specs: 'HDMI to DisplayPort' }
    ];

    let addedCount = 0;
    for (const device of devices) {
      try {
        const categoryId = categoryMap[device.category];
        if (categoryId) {
          await connection.execute(
            'INSERT INTO items (category_id, serial_number, brand, model, specifications, date_of_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [categoryId, device.serial, device.brand, device.model, device.specs, '2024-01-15', 'In Stock']
          );
          addedCount++;
          console.log(`✅ Added: ${device.brand} ${device.model} (${device.category})`);
        }
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Device ${device.serial} already exists`);
        } else {
          console.log(`❌ Error adding ${device.brand} ${device.model}: ${error.message}`);
        }
      }
    }

    console.log(`\n🎉 Successfully added ${addedCount} peripheral devices!`);

    // Verify the data
    console.log('\n📊 Verifying data...');
    const [totalItems] = await connection.execute('SELECT COUNT(*) as count FROM items');
    const verifyPlaceholders = categories.map(() => '?').join(',');
    const [peripheralItems] = await connection.execute(`
      SELECT COUNT(*) as count FROM items i 
      JOIN categories c ON i.category_id = c.category_id 
      WHERE c.category_name IN (${verifyPlaceholders})
    `, categories);

    console.log(`📈 Total items in database: ${totalItems[0].count}`);
    console.log(`📈 Peripheral devices: ${peripheralItems[0].count}`);

    await connection.end();
    console.log('\n✅ Database operations completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database "na_inventory_db" does not exist!');
      console.log('📝 Please create the database first.');
    }
  }
}

addPeripheralDevices(); 