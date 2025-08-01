const axios = require('axios');

async function testServer() {
  try {
    console.log('🔍 Testing server connectivity...');
    
    // Test basic server response
    try {
      const response = await axios.get('http://localhost:8080/');
      console.log('✅ Server is running:', response.data);
    } catch (error) {
      console.log('❌ Server not responding:', error.message);
      return;
    }
    
    // Test categories endpoint
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      console.log('✅ Categories endpoint accessible');
    } catch (error) {
      console.log('❌ Categories endpoint failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test DELETE endpoint (should fail with 401, not 404)
    try {
      const response = await axios.delete('http://localhost:8080/api/categories/1');
      console.log('✅ DELETE endpoint accessible');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ DELETE endpoint returns 404 - route not found');
      } else if (error.response?.status === 401) {
        console.log('✅ DELETE endpoint returns 401 - authentication required (expected)');
      } else {
        console.log('❌ DELETE endpoint failed:', error.response?.status, error.response?.data?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testServer(); 