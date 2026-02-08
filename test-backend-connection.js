// Test Backend Connection
// Run this with: node test-backend-connection.js

const BASE_URL = "http://https://api.hetdcl.com"; // Change if needed

const testEndpoints = [
  '/api/customer/products/?page_size=5',
  '/api/store/categories/?pagination=0',
  '/api/store/public/',
  '/api/customer/carts/',
];

console.log('🔍 Testing Backend Connection...');
console.log('🔗 BASE_URL:', BASE_URL);
console.log('');

async function testEndpoint(path) {
  const url = `${BASE_URL}${path}`;
  console.log(`📡 Testing: ${path}`);

  try {
    const response = await fetch(url);
    const status = response.status;

    if (status === 200) {
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`   ✅ Status: ${status} - JSON response received`);
        console.log(`   📊 Data preview:`, JSON.stringify(data).substring(0, 100) + '...');
      } else {
        const text = await response.text();
        console.log(`   ⚠️  Status: ${status} - NOT JSON (got ${contentType})`);
        console.log(`   📄 Response:`, text.substring(0, 200) + '...');
      }
    } else if (status === 404) {
      const text = await response.text();
      if (text.includes('<!DOCTYPE html>')) {
        console.log(`   ❌ Status: 404 - Django page not found (HTML error page)`);
        console.log(`   💡 Fix: Check URL routing in Backend/config/urls.py`);
      } else {
        console.log(`   ❌ Status: 404 - Endpoint not found`);
      }
    } else {
      console.log(`   ⚠️  Status: ${status}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    console.log(`   💡 Fix: Make sure Django backend is running`);
  }

  console.log('');
}

async function runTests() {
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
  }

  console.log('');
  console.log('📋 Summary:');
  console.log('  ✅ = Working correctly');
  console.log('  ⚠️  = Needs attention');
  console.log('  ❌ = Not working');
  console.log('');
  console.log('Next Steps:');
  console.log('1. If all ❌: Start Django backend with "python manage.py runserver"');
  console.log('2. If 404 errors: Check Backend URL configuration');
  console.log('3. If all ✅: Update mobile app BASE_URL to match');
}

runTests().catch(console.error);
