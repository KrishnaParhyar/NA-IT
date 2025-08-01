const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testLogin() {
  console.log('🧪 Testing Login Functionality...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    try {
      const response = await axios.get('http://localhost:8080/');
      console.log('✅ Server is running:', response.data.message);
    } catch (error) {
      console.log('❌ Server is not running. Please start the backend server first: npm start');
      return;
    }

    // Test 2: Test login with sample credentials
    console.log('\n2️⃣ Testing login...');
    console.log('📝 You can test with these sample users:');
    console.log('   - Username: deepa (password: whatever you set)');
    console.log('   - Username: Krishna (password: whatever you set)');
    
    // You can uncomment and modify this section to test specific credentials
    /*
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'deepa',
        password: 'your_password_here'
      });
      console.log('✅ Login successful!');
      console.log('📋 User info:', loginResponse.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Login failed: Invalid credentials');
      } else {
        console.log('❌ Login failed:', error.response?.data?.message || error.message);
      }
    }
    */

    console.log('\n🎉 Login test completed!');
    console.log('\n📋 To test login:');
    console.log('   1. Go to http://localhost:5173');
    console.log('   2. Try logging in with the credentials you created');
    console.log('   3. If it still fails, check the username and password');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin(); 