async function testAPIs() {
  console.log('Testing API endpoints...');

  try {
    // Test associations API
    const associationsResponse = await fetch('http://localhost:3000/api/associations');
    const associations = await associationsResponse.json();
    console.log('✓ Associations API:', associations.length, 'associations found');

    // Test financial reports API
    const reportsResponse = await fetch('http://localhost:3000/api/financial-reports');
    const reports = await reportsResponse.json();
    console.log('✓ Financial Reports API:', reports.length, 'reports found');

    // Test ratings API
    const ratingsResponse = await fetch('http://localhost:3000/api/ratings');
    const ratings = await ratingsResponse.json();
    console.log('✓ Ratings API:', ratings.length, 'ratings found');

    console.log('✓ All API endpoints are working correctly!');
  } catch (error) {
    console.error('✗ API test failed:', error);
  }
}

testAPIs();