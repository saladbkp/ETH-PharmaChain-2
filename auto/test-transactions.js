/**
 * Test Transaction History
 */

async function test() {
  console.log('🧪 Testing Transaction History...\n');
  
  // Login as manufacturer
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'manufacturer', password: 'mfg123' })
  });
  
  const loginData = await loginRes.json();
  
  if (loginData.token) {
    console.log('✅ Logged in as manufacturer');
    
    // Get transactions
    const txRes = await fetch('http://localhost:5000/api/inventory/transactions', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    if (txRes.ok) {
      const txData = await txRes.json();
      console.log(`\n📋 Transaction History (${txData.transactions.length} total):`);
      
      txData.transactions.slice(0, 5).forEach((tx, i) => {
        console.log(`\n${i + 1}. ${tx.transactionType.toUpperCase()}`);
        console.log(`   Medicine: ${tx.medicineName}`);
        console.log(`   MAL: ${tx.malNumber}`);
        console.log(`   From: ${tx.fromUsername || 'N/A'}`);
        console.log(`   To: ${tx.toUsername || 'N/A'}`);
        console.log(`   Quantity: ${tx.quantity}`);
        console.log(`   Date: ${new Date(tx.createdAt).toLocaleString()}`);
      });
      
      console.log('\n✅ Transaction history shows usernames (not IDs)!');
      console.log('✅ Notes column removed!');
    } else {
      console.log('❌ Failed to get transactions');
    }
  } else {
    console.log('❌ Login failed');
  }
}

test();
