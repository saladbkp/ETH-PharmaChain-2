/**
 * Clear All Pending Transfer Requests
 * This script rejects all pending transfers to clear them from the system
 */

async function clearPendingTransfers() {
  console.log('🧹 Clearing All Pending Transfer Requests...\n');

  // Step 1: Login as admin
  console.log('🔑 Step 1: Login as admin...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  const loginData = await loginRes.json();

  if (!loginData.token) {
    console.log('❌ Admin login failed');
    return;
  }

  console.log('✅ Admin login successful');

  // Step 2: Get all pending transfers
  console.log('\n📋 Step 2: Get all pending transfers...');
  const pendingRes = await fetch('http://localhost:5000/api/inventory/transfers/pending', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });

  const pendingData = await pendingRes.json();

  if (!pendingRes.ok) {
    console.log('❌ Failed to fetch pending transfers');
    return;
  }

  const pendingTransfers = pendingData.transfers;
  console.log(`✅ Found ${pendingTransfers.length} pending transfers`);

  if (pendingTransfers.length === 0) {
    console.log('\n✅ No pending transfers to clear!');
    return;
  }

  // Display pending transfers
  console.log('\n📋 Pending Transfers:');
  pendingTransfers.forEach((tx, index) => {
    console.log(`   ${index + 1}. ${tx.medicineName || tx.batchId}`);
    console.log(`      From: ${tx.fromUsername} → To: ${tx.toUsername}`);
    console.log(`      Quantity: ${tx.quantity} | Batch: ${tx.batchId}`);
    console.log(`      ID: ${tx.id}`);
  });

  // Step 3: Reject all pending transfers
  console.log('\n🗑️  Step 3: Rejecting all pending transfers...');

  let rejectedCount = 0;
  let failedCount = 0;

  for (const transfer of pendingTransfers) {
    try {
      const rejectRes = await fetch(
        `http://localhost:5000/api/inventory/transfers/${transfer.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: 'Bulk clearance - system cleanup' })
        }
      );

      const rejectData = await rejectRes.json();

      if (rejectRes.ok) {
        console.log(`   ✅ Rejected: ${transfer.batchId} (${transfer.fromUsername} → ${transfer.toUsername})`);
        rejectedCount++;
      } else {
        console.log(`   ❌ Failed to reject ${transfer.id}: ${rejectData.message}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error rejecting ${transfer.id}: ${error.message}`);
      failedCount++;
    }
  }

  // Step 4: Verify all cleared
  console.log('\n📋 Step 4: Verify all transfers cleared...');
  await new Promise(resolve => setTimeout(resolve, 500));

  const verifyRes = await fetch('http://localhost:5000/api/inventory/transfers/pending', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });

  const verifyData = await verifyRes.json();

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Summary:');
  console.log('='.repeat(60));
  console.log(`📊 Original pending transfers: ${pendingTransfers.length}`);
  console.log(`✅ Successfully rejected: ${rejectedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`📋 Remaining pending transfers: ${verifyData.transfers.length}`);
  console.log('='.repeat(60));

  if (verifyData.transfers.length === 0) {
    console.log('\n✅ All pending transfers have been cleared!');
  } else {
    console.log('\n⚠️  Some transfers still pending:');
    verifyData.transfers.forEach(tx => {
      console.log(`   - ${tx.batchId} (${tx.fromUsername} → ${tx.toUsername})`);
    });
  }
  console.log('='.repeat(60));
}

clearPendingTransfers();
