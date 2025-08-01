const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixUserPasswords() {
  console.log('🔧 Fixing user passwords...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'na_inventory_db'
    });

    // Get all users
    const [users] = await connection.execute('SELECT user_id, username, password FROM users');
    console.log(`📊 Found ${users.length} users in database`);

    let fixedCount = 0;
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        console.log(`🔧 Fixing password for user: ${user.username}`);
        
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Update the user with hashed password
        await connection.execute(
          'UPDATE users SET password = ? WHERE user_id = ?',
          [hashedPassword, user.user_id]
        );
        
        fixedCount++;
        console.log(`✅ Fixed password for: ${user.username}`);
      } else {
        console.log(`✅ Password already hashed for: ${user.username}`);
      }
    }

    await connection.end();
    
    console.log(`\n🎉 Password fix completed!`);
    console.log(`📊 Fixed ${fixedCount} user passwords`);
    
    if (fixedCount > 0) {
      console.log('\n📋 Now you can login with the original passwords you set.');
    } else {
      console.log('\n📋 All passwords were already properly hashed.');
    }

  } catch (error) {
    console.error('❌ Error fixing passwords:', error.message);
  }
}

fixUserPasswords(); 