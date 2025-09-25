const axios = require('axios');

// Test script to verify logo unique constraint handling
const API_BASE_URL = 'http://localhost:4002/api/v1';

// First, create an office with a valid logo
const createOfficeWithLogo = async () => {
  const officeData = {
    address: "123 Test Street, Casablanca",
    city: "86909f92-2d78-4ab1-ad41-4e1a66b50467", // Use a valid city ID
    currencyExchangeLicenseNumber: "XCH-MA-TEST-001",
    email: "test@example.com",
    location: {
      coordinates: [-7.5898, 33.5731],
      type: "Point"
    },
    // First, let's create a valid logo file
    // logo: { id: "valid-logo-id" }, // We'll add this after creating a file
    officeName: "Test Office 1",
    primaryPhoneNumber: "+212600000001",
    registrationNumber: "RC-TEST-001",
    state: "Casablanca-Settat"
  };

  try {
    console.log('Creating first office without logo...');
    const response = await axios.post(`${API_BASE_URL}/offices`, officeData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('✅ First office created successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create first office:', error.response?.data || error.message);
    return null;
  }
};

// Then try to create another office with the same logo
const createOfficeWithSameLogo = async (logoId) => {
  const officeData = {
    address: "456 Another Street, Rabat",
    city: "86909f92-2d78-4ab1-ad41-4e1a66b50467",
    currencyExchangeLicenseNumber: "XCH-MA-TEST-002",
    email: "test2@example.com",
    location: {
      coordinates: [-6.8325, 34.0209],
      type: "Point"
    },
    logo: { id: logoId },
    officeName: "Test Office 2",
    primaryPhoneNumber: "+212600000002",
    registrationNumber: "RC-TEST-002",
    state: "Rabat-Salé-Kénitra"
  };

  try {
    console.log('Creating second office with same logo...');
    const response = await axios.post(`${API_BASE_URL}/offices`, officeData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('❌ Unexpected success - should have failed:', response.data.id);
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Error Response:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.message?.includes('logo is already being used')) {
      console.log('✅ Logo constraint validation is working correctly!');
    } else {
      console.log('❌ Unexpected error response');
    }
  }
};

// Test with a non-existent logo ID
const testWithNonExistentLogo = async () => {
  const officeData = {
    address: "789 Test Avenue, Fez",
    city: "86909f92-2d78-4ab1-ad41-4e1a66b50467",
    currencyExchangeLicenseNumber: "XCH-MA-TEST-003",
    email: "test3@example.com",
    location: {
      coordinates: [-5.0003, 34.0181],
      type: "Point"
    },
    logo: { id: "8147bcd2-16df-47c7-b607-547399047f4b" }, // Non-existent logo ID
    officeName: "Test Office 3",
    primaryPhoneNumber: "+212600000003",
    registrationNumber: "RC-TEST-003",
    state: "Fès-Meknès"
  };

  try {
    console.log('\nTesting with non-existent logo ID...');
    const response = await axios.post(`${API_BASE_URL}/offices`, officeData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('❌ Unexpected success - should have failed:', response.data.id);
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Error Response:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 404 && 
        error.response?.data?.errors?.logo === 'logoFileNotFound') {
      console.log('✅ Logo file validation is working correctly!');
    } else {
      console.log('❌ Unexpected error response for non-existent logo');
    }
  }
};

// Run tests
console.log('Logo Constraint Test Script');
console.log('===========================');

// First test with non-existent logo
testWithNonExistentLogo().catch(console.error);
