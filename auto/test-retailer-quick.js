/**
 * Quick Retailer List Test
 */

async function test() {
  console.log('Testing retailer list...\n');
  
  // Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'manufacturer', password: 'mfg123' })
  });
  
  const loginData = await loginRes.json();
  
  if (loginData.token) {
    console.log('✅ Logged in');
    
    // Get retailers
    const retailersRes = await fetch('http://localhost:5000/api/users/retailers', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    if (retailersRes.ok) {
      const retailersData = await retailersRes.json();
      console.log('\n📋 Available Retailers for Transfer:');
      retailersData.retailers.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.username} (ID: ${r.id})`);
      });
      console.log(`\n✅ Total: ${retailersData.retailers.length} retailers`);
    } else {
      console.log('❌ Failed to get retailers');
    }
  } else {
    console.log('❌ Login failed');
  }
}

test();
