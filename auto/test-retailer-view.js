/**
 * Test Retailer View After Transfer
 */

async function test() {
  console.log('🧪 Testing Retailer Inventory & Transactions After Transfer...\n');
  
  // Step 1: Login as retailer
  console.log('🔑 Step 1: Login as retailer_one...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'retailer_one', password: 'retail123' })
  });
  
  const loginData = await loginRes.json();
  
  if (loginData.token) {
    console.log('✅ Logged in as retailer_one');
    console.log(`   User ID: ${loginData.user ? loginData.user.id : 'N/A'}`);
    
    // Step 2: Check inventory
    console.log('\n📦 Step 2: Check retailer inventory...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const invRes = await fetch('http://localhost:5000/api/inventory/my-inventory', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const invData = await invRes.json();
    
    if (invRes.ok) {
      console.log(`✅ Inventory fetch successful`);
      console.log(`   Items in inventory: ${invData.inventory.length}`);
      
      if (invData.inventory.length > 0) {
        console.log('\n   📋 Inventory Items:');
        invData.inventory.forEach((item, i) => {
          console.log(`   ${i + 1}. Batch: ${item.batchId}, Qty: ${item.quantity}, Medicine: ${item.medicineName}`);
        });
      } else {
        console.log('   ⚠️  No inventory found (transfers may not have reached retailer)');
      }
    } else {
      console.log('❌ Inventory fetch failed:', invData.message);
    }
    
    // Step 3: Check transactions
    console.log('\n📋 Step 3: Check retailer transactions...');
    const txRes = await fetch('http://localhost:5000/api/inventory/transactions', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const txData = await txRes.json();
    
    if (txRes.ok) {
      console.log(`✅ Transactions fetch successful`);
      console.log(`   Total transactions: ${txData.transactions.length}`);
      
      if (txData.transactions.length > 0) {
        console.log('\n   📋 Recent Transactions:');
        txData.transactions.slice(0, 3).forEach((tx, i) => {
          console.log(`   ${i + 1}. ${tx.transactionType.toUpperCase()}`);
          console.log(`      From: ${tx.fromUsername || 'N/A'}`);
          console.log(`      To: ${tx.toUsername || 'N/A'}`);
          console.log(`      Qty: ${tx.quantity}`);
          console.log(`      Medicine: ${tx.medicineName || 'N/A'}`);
        });
      } else {
        console.log('   ⚠️  No transactions found');
      }
    } else {
      console.log('❌ Transactions fetch failed:', txData.message);
    }
    
    console.log('\n✅ Retailer view test completed!');
  } else {
    console.log('❌ Login failed');
  }
}

test();
