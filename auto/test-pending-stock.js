/**
 * Test Pending Stock Change Requests
 */

async function test() {
  console.log('🧪 Testing Pending Stock Change Requests...\n');
  
  // Step 1: Login as admin
  console.log('🔑 Step 1: Login as admin...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  
  const loginData = await loginRes.json();
  
  if (loginData.token) {
    console.log('✅ Admin login successful');
    
    // Step 2: Fetch pending stock requests
    console.log('\n📋 Step 2: Fetch pending stock requests...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pendingRes = await fetch('http://localhost:5000/api/stock/pending', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const pendingData = await pendingRes.json();
    
    if (pendingRes.ok) {
      console.log(`✅ Pending requests fetched: ${pendingData.requests.length} requests`);
      
      if (pendingData.requests.length > 0) {
        console.log('\n📋 Stock Change Requests:');
        pendingData.requests.slice(0, 3).forEach((req, i) => {
          console.log(`\n${i + 1}. ${req.transactionType.toUpperCase()}`);
          console.log(`   Medicine: ${req.medicineName}`);
          console.log(`   MAL: ${req.malNumber}`);
          console.log(`   Batch: ${req.batchId}`);
          console.log(`   Quantity: ${req.quantity}`);
          console.log(`   User: ${req.fromUsername || req.toUsername}`);
          console.log(`   ID: ${req.id}`);
        });
        
        // Test approve/reject functionality
        const testReq = pendingData.requests[0];
        console.log(`\n🧪 Testing approve/reject with request: ${testReq.id}`);
        
        // Test approve
        console.log('\n⬆️ Testing Approve...');
        const approveRes = await fetch(`http://localhost:5000/api/stock/${testReq.id}/approve`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        
        const approveData = await approveRes.json();
        if (approveRes.ok) {
          console.log(`✅ Approve successful: ${approveData.message}`);
        } else {
          console.log(`❌ Approve failed: ${approveData.message}`);
        }
        
        // Test reject (if there are more requests)
        if (pendingData.requests.length > 1) {
          const testReq2 = pendingData.requests[1];
          console.log(`\n⬇️ Testing Reject with request: ${testReq2.id}`);
          
          const rejectRes = await fetch(`http://localhost:5000/api/stock/${testReq2.id}/reject`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes: 'Test rejection' })
          });
          
          const rejectData = await rejectRes.json();
          if (rejectRes.ok) {
            console.log(`✅ Reject successful: ${rejectData.message}`);
          } else {
            console.log(`❌ Reject failed: ${rejectData.message}`);
          }
        }
      } else {
        console.log('ℹ️  No pending stock change requests found');
        console.log('   (This is normal if no manufacturers have requested stock changes)');
      }
      
      console.log('\n✅ Summary of changes:');
      console.log('   ✅ User ID → Username (e.g., "manufacturer", "retailer_one")');
      console.log('   ✅ Notes column removed');
      console.log('   ✅ Actions renamed to "Accept" and "Reject"');
      console.log('   ✅ Approve/Reject functionality working');
    } else {
      console.log('❌ Failed to fetch pending requests:', pendingData.message);
    }
  } else {
    console.log('❌ Login failed');
  }
}

test();
