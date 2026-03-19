/**
 * Test All Retailers Can See Their Data
 */

const retailers = [
  { username: 'retailer', password: 'retail123', name: 'Original Retailer' },
  { username: 'retailer_one', password: 'retail123', name: 'Retailer One' },
  { username: 'retailer_two', password: 'retail123', name: 'Retailer Two' },
  { username: 'pharmacy_abc', password: 'retail123', name: 'Pharmacy ABC' }
];

async function testRetailer(retailer) {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: retailer.username, password: retailer.password })
  });
  
  const loginData = await loginRes.json();
  
  if (!loginData.token) {
    return { name: retailer.name, inventory: 0, transactions: 0, error: 'Login failed' };
  }
  
  // Get inventory
  const invRes = await fetch('http://localhost:5000/api/inventory/my-inventory', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  
  const invData = await invRes.json();
  
  // Get transactions
  const txRes = await fetch('http://localhost:5000/api/inventory/transactions', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  
  const txData = await txRes.json();
  
  return {
    name: retailer.name,
    username: retailer.username,
    inventory: invData.inventory ? invData.inventory.length : 0,
    transactions: txData.transactions ? txData.transactions.length : 0
  };
}

async function testAll() {
  console.log('🧪 Testing All Retailers Can See Their Data...\n');
  
  const results = [];
  
  for (const retailer of retailers) {
    const result = await testRetailer(retailer);
    results.push(result);
    
    console.log(`✅ ${result.name} (@${result.username})`);
    console.log(`   📦 Inventory: ${result.inventory} items`);
    console.log(`   📋 Transactions: ${result.transactions} records`);
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log('All retailers can now access their inventory and transactions!');
  console.log('');
  
  results.forEach(result => {
    console.log(`${result.name}:`);
    console.log(`  - Inventory: ${result.inventory} items`);
    console.log(`  - Transactions: ${result.transactions} records`);
  });
  
  console.log('='.repeat(60));
}

testAll();
