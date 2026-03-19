/**
 * Test Retailer Registration
 */

const BASE_URL = 'http://localhost:5000';

async function request(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const jsonData = await response.json();
    return { ok: response.ok, status: response.status, data: jsonData };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function testRetailerRegistration() {
  console.log('🧪 Testing Retailer Registration Flow...\n');

  // Test 1: Register new retailer
  console.log('📝 Step 1: Registering new retailer...');
  const timestamp = Date.now();
  const newRetailer = {
    username: `retailer_${timestamp}`,
    password: 'retail123',
    role: 'retailer'
  };

  const regResult = await request('POST', '/api/auth/register', newRetailer);
  if (regResult.ok) {
    console.log('✅ Registration successful!');
    console.log(`   Username: ${newRetailer.username}`);
    console.log(`   Password: ${newRetailer.password}`);
    console.log(`   Role: ${newRetailer.role}`);
  } else {
    console.log('❌ Registration failed:', regResult.data?.message || regResult.error);
    return false;
  }

  // Test 2: Login with new retailer
  console.log('\n🔑 Step 2: Logging in with new retailer...');
  const loginResult = await request('POST', '/api/auth/login', {
    username: newRetailer.username,
    password: newRetailer.password
  });

  if (loginResult.ok && loginResult.data.token) {
    console.log('✅ Login successful!');
    console.log(`   Role: ${loginResult.data.role}`);

    // Test 3: Check inventory endpoint
    console.log('\n📦 Step 3: Checking retailer inventory...');
    const inventoryResult = await request('GET', '/api/inventory/my-inventory', null, loginResult.data.token);
    
    if (inventoryResult.ok) {
      console.log('✅ Inventory endpoint accessible!');
      console.log(`   Items in inventory: ${inventoryResult.data.inventory?.length || 0}`);
    } else {
      console.log('❌ Inventory check failed:', inventoryResult.data?.message);
    }

    return true;
  } else {
    console.log('❌ Login failed:', loginResult.data?.message || loginResult.error);
    return false;
  }
}

// Run the test
testRetailerRegistration()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 All retailer registration tests passed!');
    } else {
      console.log('⚠️ Some tests failed');
    }
    console.log('='.repeat(50));
  })
  .catch(err => {
    console.error('Test error:', err);
  });
