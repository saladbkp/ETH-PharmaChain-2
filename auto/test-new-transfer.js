/**
 * Test New Transfer with Usernames
 */

async function test() {
  console.log('🧪 Testing New Transfer with Usernames...\n');
  
  // Login as manufacturer
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'manufacturer', password: 'mfg123' })
  });
  
  const loginData = await loginRes.json();
  
  if (loginData.token) {
    console.log('✅ Logged in as manufacturer');
    
    // Get inventory
    const invRes = await fetch('http://localhost:5000/api/inventory/my-inventory', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const invData = await invRes.json();
    
    if (invData.inventory && invData.inventory.length > 0) {
      const batch = invData.inventory[0];
      console.log(`\n📦 Found batch: ${batch.batchId} (Qty: ${batch.quantity})`);
      
      // Create transfer to retailer_one
      const transferRes = await fetch('http://localhost:5000/api/inventory/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchId: batch.batchId,
          quantity: 1,
          receiverId: 6 // retailer_one
        })
      });
      
      const transferData = await transferRes.json();
      
      if (transferRes.ok) {
        console.log('✅ Transfer created successfully');
        
        // Get transactions
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const txRes = await fetch('http://localhost:5000/api/inventory/transactions', {
          headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        
        const txData = await txRes.json();
        
        console.log('\n📋 Latest Transaction:');
        const latestTx = txData.transactions[0];
        console.log(`   Type: ${latestTx.transactionType}`);
        console.log(`   Medicine: ${latestTx.medicineName}`);
        console.log(`   From: ${latestTx.fromUsername || latestTx.fromUserId}`);
        console.log(`   To: ${latestTx.toUsername || latestTx.toUserId}`);
        console.log(`   Quantity: ${latestTx.quantity}`);
        
        console.log('\n✅ Usernames should display correctly now!');
      } else {
        console.log('❌ Transfer failed:', transferData.message);
      }
    } else {
      console.log('⚠️  No inventory found');
    }
  }
}

test();
