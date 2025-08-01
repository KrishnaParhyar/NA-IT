const axios = require('axios');

const testDeleteItem = async () => {
    try {
        console.log('🧪 Testing delete item with new logic...');
        
        // First, let's try to delete item ID 3 (which has issuance logs)
        const response = await axios.delete('http://localhost:8080/api/items/3', {
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this with a valid token
            }
        });
        
        console.log('✅ Delete successful:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('❌ Delete failed with status:', error.response.status);
            console.log('📝 Error message:', error.response.data.message);
            console.log('📊 Additional info:', error.response.data);
        } else {
            console.log('❌ Network error:', error.message);
        }
    }
};

// Note: This test requires a valid JWT token
// You can get one by logging in through the frontend
console.log('⚠️  Note: This test requires a valid JWT token');
console.log('   Please replace YOUR_TOKEN_HERE with a valid token from login');
console.log('   Or test through the frontend interface instead');

// Uncomment the line below to run the test (after adding a valid token)
// testDeleteItem(); 