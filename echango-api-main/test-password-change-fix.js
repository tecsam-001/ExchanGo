const axios = require('axios');

const API_BASE_URL = 'https://exchango.opineomanager.com/api/v1';

async function testPasswordChangeFix() {
  try {
    console.log('Testing password change functionality...');
    
    // First, let's try to login with a test user
    console.log('\n1. Attempting to login...');
    let loginResponse;
    try {
      loginResponse = await axios.post(`${API_BASE_URL}/auth/email/login`, {
        email: 'test@example.com',
        password: 'secret'
      });
      console.log('✅ Login successful');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      return;
    }

    const token = loginResponse.data.token;
    
    // Test 1: Password confirmation mismatch (should fail with validation error)
    console.log('\n2. Testing password confirmation mismatch...');
    try {
      await axios.post(`${API_BASE_URL}/auth/change/password`, {
        oldPassword: 'secret',
        newPassword: 'newPassword123',
        confirmPassword: 'differentPassword'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with password mismatch');
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('✅ Correctly rejected password mismatch');
        console.log('Error details:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Invalid old password (should fail)
    console.log('\n3. Testing with invalid old password...');
    try {
      await axios.post(`${API_BASE_URL}/auth/change/password`, {
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with invalid old password');
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('✅ Correctly rejected invalid old password');
        console.log('Error details:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Same password as current (should fail)
    console.log('\n4. Testing with same password as current...');
    try {
      await axios.post(`${API_BASE_URL}/auth/change/password`, {
        oldPassword: 'secret',
        newPassword: 'secret',
        confirmPassword: 'secret'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with same password');
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('✅ Correctly rejected same password');
        console.log('Error details:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 4: Valid password change (should succeed)
    console.log('\n5. Testing valid password change...');
    try {
      await axios.post(`${API_BASE_URL}/auth/change/password`, {
        oldPassword: 'secret',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Password change successful');
      
      // Test login with new password
      console.log('\n6. Testing login with new password...');
      try {
        await axios.post(`${API_BASE_URL}/auth/email/login`, {
          email: 'test@example.com',
          password: 'newPassword123'
        });
        console.log('✅ Login with new password successful');
        
        // Change password back
        console.log('\n7. Changing password back to original...');
        const newLoginResponse = await axios.post(`${API_BASE_URL}/auth/email/login`, {
          email: 'test@example.com',
          password: 'newPassword123'
        });
        
        await axios.post(`${API_BASE_URL}/auth/change/password`, {
          oldPassword: 'newPassword123',
          newPassword: 'secret',
          confirmPassword: 'secret'
        }, {
          headers: {
            'Authorization': `Bearer ${newLoginResponse.data.token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Password reset to original successful');
        
      } catch (error) {
        console.log('❌ Login with new password failed:', error.response?.data || error.message);
      }
      
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('❌ Valid password change failed');
        console.log('Error details:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPasswordChangeFix();
