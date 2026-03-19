/**
 * Test Retailer List for Transfer
 */

async function request(method, endpoint, token = null) {
  const url = `http://localhost:5000${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, options);
    const jsonData = await response.json();
    return { ok: response.ok, status: response.status, data: jsonData };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function testRetailerList() {
  console.log('🧪 Testing Retailer List for Transfer...\n');

  // Step 1: Login as manufacturer
  console.log('🔑 Step 1: Login as manufacturer...');
  const loginResult = await request('POST', '/api/auth/login', null, null, {
    username: 'manufacturer',
    password: 'mfg123'
  });

  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'manufacturer', password: 'mfg123' })
  });

  const loginData = await loginResponse.json();

  if (loginResponse.ok && loginData.token) {
    console.log('✅ Manufacturer login successful');
    const token = loginData.token;

    // Step 2: Get retailers list
    console.log('\n📋 Step 2: Fetch retailer list...');
    const retailersResult = await fetch('http://localhost:5000/api/users/retailers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const retailersData = await retailersResult.json();

    if (retailersResult.ok) {
      console.log('✅ Retailers list fetched successfully');
      console.log('\n📦 Available Retailers:');
      retailersData.retailers.forEach((retailer, index) => {
        console.log(`   ${index + 1}. ${retailer.username} (ID: ${retailer.id})`);
      });

      console.log('\n✅ Retailer transfer dropdown will show these retailers!');
    } else {
      console.log('❌ Failed to fetch retailers:', retailersData.message);
    }
  } else {
    console.log('❌ Login failed');
  }

  console.log('\n' + '='.repeat(60));
}

testRetailerList();
