/**
 * Debug Transaction User Lookup
 */

const users = [
  { id: 1, username: 'admin' },
  { id: 2, username: 'manufacturer' },
  { id: 3, username: 'retailer' },
  { id: 6, username: 'retailer_one' },
  { id: 7, username: 'retailer_two' },
  { id: 8, username: 'pharmacy_abc' }
];

const transactions = [
  { fromUserId: null, toUserId: 2 },
  { fromUserId: 2, toUserId: "3" },
  { fromUserId: null, toUserId: "user1" }
];

console.log('🔍 Debugging user lookup...\n');

transactions.forEach((tx, i) => {
  console.log(`Transaction ${i + 1}:`);
  console.log(`  fromUserId: ${tx.fromUserId} (${typeof tx.fromUserId})`);
  console.log(`  toUserId: ${tx.toUserId} (${typeof tx.toUserId})`);
  
  const fromUser = tx.fromUserId ? users.find(u => String(u.id) === String(tx.fromUserId)) : null;
  const toUser = tx.toUserId ? users.find(u => String(u.id) === String(tx.toUserId)) : null;
  
  console.log(`  fromUser: ${fromUser ? fromUser.username : 'N/A'}`);
  console.log(`  toUser: ${toUser ? toUser.username : 'N/A'}`);
  console.log('');
});

// Now test with real API
console.log('\n🌐 Testing with real API...\n');

async function test() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'manufacturer', password: 'mfg123' })
  });
  
  const loginData = await loginRes.json();
  
  if (loginData.token) {
    const txRes = await fetch('http://localhost:5000/api/inventory/transactions', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const txData = await txRes.json();
    
    console.log('First 3 transactions with user details:');
    txData.transactions.slice(0, 3).forEach((tx, i) => {
      console.log(`\n${i + 1}. ${tx.transactionType}`);
      console.log(`   fromUserId: ${tx.fromUserId} (${typeof tx.fromUserId})`);
      console.log(`   toUserId: ${tx.toUserId} (${typeof tx.toUserId})`);
      console.log(`   fromUsername: ${tx.fromUsername || 'N/A'}`);
      console.log(`   toUsername: ${tx.toUsername || 'N/A'}`);
    });
  }
}

test();
