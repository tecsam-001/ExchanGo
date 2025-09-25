const axios = require('axios');

async function testAboutOfficesEndpoint() {
  const baseUrl = 'http://localhost:3000/api/v1/admins';
  
  try {
    console.log('Testing about-offices endpoint...');
    
    // Test 1: Basic request
    console.log('\n1. Testing basic request:');
    const response1 = await axios.get(`${baseUrl}/about-offices?page=1&limit=5`);
    console.log('Status:', response1.status);
    console.log('Data structure:', {
      totalOffices: response1.data.totalOffices,
      filteredCount: response1.data.filteredCount,
      dataLength: response1.data.data.length,
      pagination: response1.data.pagination,
    });
    
    if (response1.data.data.length > 0) {
      console.log('Sample office data:', response1.data.data[0]);
    }
    
    // Test 2: With duration filter
    console.log('\n2. Testing with duration filter (LAST_1_MONTH):');
    const response2 = await axios.get(`${baseUrl}/about-offices?duration=LAST_1_MONTH&limit=3`);
    console.log('Status:', response2.status);
    console.log('Filtered count:', response2.data.filteredCount);
    console.log('Applied filters:', response2.data.appliedFilters);
    
    // Test 3: With status filter
    console.log('\n3. Testing with status filter (ACCEPTED):');
    const response3 = await axios.get(`${baseUrl}/about-offices?status=ACCEPTED&limit=3`);
    console.log('Status:', response3.status);
    console.log('Filtered count:', response3.data.filteredCount);
    console.log('Applied filters:', response3.data.appliedFilters);
    
    // Test 4: With search
    console.log('\n4. Testing with search term:');
    const response4 = await axios.get(`${baseUrl}/about-offices?search=exchange&limit=3`);
    console.log('Status:', response4.status);
    console.log('Filtered count:', response4.data.filteredCount);
    console.log('Applied filters:', response4.data.appliedFilters);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAboutOfficesEndpoint();
