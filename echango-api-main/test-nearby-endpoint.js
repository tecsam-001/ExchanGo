#!/usr/bin/env node

/**
 * Test script for the enhanced nearby offices endpoint
 * Run with: node test-nearby-endpoint.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Adjust as needed
const API_ENDPOINT = '/api/v1/offices/nearby';

// Test coordinates (Casablanca, Morocco)
const TEST_COORDINATES = {
  latitude: 33.5731,
  longitude: -7.5898,
  radiusInKm: 10
};

// Test cases for different filter combinations
const TEST_CASES = [
  {
    name: 'Basic nearby search',
    params: {
      ...TEST_COORDINATES
    }
  },
  {
    name: 'Search with currency filter',
    params: {
      ...TEST_COORDINATES,
      baseCurrency: 'MAD',
      targetCurrency: 'USD',
      rateDirection: 'SELL'
    }
  },
  {
    name: 'Search for featured offices only',
    params: {
      ...TEST_COORDINATES,
      isFeatured: true
    }
  },
  {
    name: 'Search for currently open offices',
    params: {
      ...TEST_COORDINATES,
      showOnlyOpenNow: true
    }
  },
  {
    name: 'Search for popular offices',
    params: {
      ...TEST_COORDINATES,
      isPopular: true
    }
  },
  {
    name: 'Search for most searched offices',
    params: {
      ...TEST_COORDINATES,
      mostSearched: true
    }
  },
  {
    name: 'Search with nearest sorting',
    params: {
      ...TEST_COORDINATES,
      nearest: true
    }
  },
  {
    name: 'Search with available currencies filter',
    params: {
      ...TEST_COORDINATES,
      availableCurrencies: 'USD,EUR,GBP'
    }
  },
  {
    name: 'Search with rate threshold',
    params: {
      ...TEST_COORDINATES,
      baseCurrency: 'MAD',
      targetCurrency: 'USD',
      targetCurrencyRate: 100,
      rateDirection: 'SELL'
    }
  },
  {
    name: 'Complex filter combination',
    params: {
      ...TEST_COORDINATES,
      isActive: true,
      isVerified: true,
      isFeatured: true,
      showOnlyOpenNow: true,
      baseCurrency: 'MAD',
      targetCurrency: 'USD'
    }
  }
];

// Error test cases
const ERROR_TEST_CASES = [
  {
    name: 'Invalid latitude (too high)',
    params: {
      latitude: 91,
      longitude: -7.5898,
      radiusInKm: 10
    },
    expectedError: true
  },
  {
    name: 'Invalid longitude (too low)',
    params: {
      latitude: 33.5731,
      longitude: -181,
      radiusInKm: 10
    },
    expectedError: true
  },
  {
    name: 'Invalid radius (too large)',
    params: {
      latitude: 33.5731,
      longitude: -7.5898,
      radiusInKm: 1001
    },
    expectedError: true
  },
  {
    name: 'Invalid currency rate (negative)',
    params: {
      ...TEST_COORDINATES,
      targetCurrencyRate: -1,
      rateDirection: 'SELL'
    },
    expectedError: true
  }
];

async function runTest(testCase) {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('📋 Parameters:', JSON.stringify(testCase.params, null, 2));
    
    const response = await axios.get(`${BASE_URL}${API_ENDPOINT}`, {
      params: testCase.params,
      timeout: 10000
    });
    
    if (testCase.expectedError) {
      console.log('❌ Expected error but got success');
      return false;
    }
    
    console.log(`✅ Success! Found ${response.data.length} offices`);
    
    // Log some details about the first office if available
    if (response.data.length > 0) {
      const firstOffice = response.data[0];
      console.log(`📍 First office: ${firstOffice.officeName}`);
      console.log(`📏 Distance: ${firstOffice.distanceInKm}km`);
      if (firstOffice.todayWorkingHours) {
        console.log(`🕒 Today's hours: ${firstOffice.todayWorkingHours.fromTime} - ${firstOffice.todayWorkingHours.toTime}`);
      }
    }
    
    return true;
  } catch (error) {
    if (testCase.expectedError) {
      console.log(`✅ Expected error received: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      return true;
    }
    
    console.log(`❌ Unexpected error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.errors) {
      console.log('🔍 Error details:', JSON.stringify(error.response.data.errors, null, 2));
    }
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Enhanced Nearby Offices Endpoint Tests');
  console.log(`🌐 Base URL: ${BASE_URL}${API_ENDPOINT}`);
  
  let passed = 0;
  let total = 0;
  
  // Run success test cases
  console.log('\n📈 Running Success Test Cases:');
  for (const testCase of TEST_CASES) {
    total++;
    if (await runTest(testCase)) {
      passed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  // Run error test cases
  console.log('\n🚨 Running Error Test Cases:');
  for (const testCase of ERROR_TEST_CASES) {
    total++;
    if (await runTest(testCase)) {
      passed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please check the output above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
