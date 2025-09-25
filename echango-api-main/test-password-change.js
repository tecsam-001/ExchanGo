const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjAsInJvbGUiOnsiaWQiOjIsIm5hbWUiOiJVc2VyIiwiX19lbnRpdHkiOiJSb2xlRW50aXR5In0sInNlc3Npb25JZCI6MTAwLCJpYXQiOjE3NTMzNjI5NTgsImV4cCI6MTc1MzM2ODg5OH0.uzf2VqD2H_qrMAVj9YqsN7WNdz0p74qAu75ThRlEOD4';

async function testPasswordChange() {
  try {
    console.log('Testing password change endpoint...');
    
    // Test 1: Invalid old password
    console.log('\n1. Testing with invalid old password...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/change/password`, {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      }, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with invalid old password');
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('✅ Correctly rejected invalid old password');
        console.log('Error:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Password confirmation mismatch
    console.log('\n2. Testing with password confirmation mismatch...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/change/password`, {
        oldPassword: 'currentpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword'
      }, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with password mismatch');
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('✅ Correctly rejected password mismatch');
        console.log('Error:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Same password as current
    console.log('\n3. Testing with same password as current...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/change/password`, {
        oldPassword: 'secret',
        newPassword: 'secret',
        confirmPassword: 'secret'
      }, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with same password');
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('✅ Correctly rejected same password');
        console.log('Error:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 4: Valid password change (you'll need to know the current password)
    console.log('\n4. Testing valid password change...');
    console.log('Note: You need to replace "currentpassword" with the actual current password');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test if the endpoint exists
async function testEndpointExists() {
  try {
    console.log('Testing if endpoint exists...');
    const response = await axios.post(`${API_BASE_URL}/auth/change/password`, {}, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error.response?.status === 422 || error.response?.status === 400) {
      console.log('✅ Endpoint exists and is responding');
      return true;
    } else if (error.response?.status === 404) {
      console.log('❌ Endpoint not found');
      return false;
    } else if (error.response?.status === 401) {
      console.log('❌ Token is invalid or expired');
      return false;
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      return false;
    }
  }
}

async function main() {
  const endpointExists = await testEndpointExists();
  if (endpointExists) {
    await testPasswordChange();
  }
}

main();
