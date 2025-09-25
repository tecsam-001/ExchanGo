const axios = require('axios');

// Test script to verify logo validation in office creation
const API_BASE_URL = 'https://exchango.opineomanager.com/api/v1';

// Test data with invalid logo ID
const testOfficeData = {
  address: "15 Avenue Fal Ould Oueir, Agdal",
  city: "d4039d73-b926-4b8f-9e09-aed0645aca78",
  currencyExchangeLicenseNumber: "XCH-MA-20250709",
  email: "contact@albaraka.ma",
  location: {
    coordinates: [-6.8416, 34.0084],
    type: "Point"
  },
  logo: {
    id: "8147bcd2-16df-47c7-b607-547399047f4b" // This ID doesn't exist
  },
  officeName: "Al Baraka Exchange",
  owner: "user_1234567890abcdef",
  primaryPhoneNumber: "+212661234567",
  registrationNumber: "RC-2025-78956",
  secondaryPhoneNumber: "+212661234568",
  state: "Rabat-Salé-Kénitra",
  thirdPhoneNumber: "+212661234569",
  whatsappNumber: "+212612345678"
};

async function testLogoValidation() {
  try {
    console.log('Testing office creation with invalid logo ID...');
    
    const response = await axios.post(`${API_BASE_URL}/offices`, testOfficeData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('Unexpected success:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      
      // Check if we get the expected logo validation error
      if (error.response.status === 404 && 
          error.response.data.errors && 
          error.response.data.errors.logo === 'logoFileNotFound') {
        console.log('✅ Logo validation is working correctly!');
      } else if (error.response.status === 400 && 
                 error.response.data.errors && 
                 error.response.data.errors.logo === 'invalidReference') {
        console.log('✅ Foreign key constraint validation is working correctly!');
      } else {
        console.log('❌ Unexpected error response');
      }
    } else {
      console.error('Network error:', error.message);
    }
  }
}

// Test with no logo (should work)
async function testWithoutLogo() {
  try {
    console.log('\nTesting office creation without logo...');
    
    const testDataWithoutLogo = { ...testOfficeData };
    delete testDataWithoutLogo.logo;
    
    const response = await axios.post(`${API_BASE_URL}/offices`, testDataWithoutLogo, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('✅ Office creation without logo works:', response.data.id);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Network error:', error.message);
    }
  }
}

// Run tests
console.log('Logo Validation Test Script');
console.log('===========================');

testLogoValidation().then(() => {
  // Uncomment to test without logo
  // return testWithoutLogo();
}).catch(console.error);
