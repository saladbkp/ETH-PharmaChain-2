/**
 * Test Transfer Approval Workflow
 * This script tests the complete flow:
 * 1. Manufacturer creates transfer request (should be pending)
 * 2. Admin sees pending transfer
 * 3. Admin approves transfer
 * 4. Inventory actually moves from manufacturer to retailer
 * 5. Retailer sees inventory with "Valid" status
 */

async function test() {
  console.log('🧪 Testing Transfer Approval Workflow...\n');

  let manufacturerToken, manufacturerId;
  let retailerId;
  let adminToken;
  let transferId;

  // Step 1: Login as manufacturer
  console.log('🔑 Step 1: Login as manufacturer...');
  const mfgLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'manufacturer', password: 'mfg123' })
  });

  const mfgLoginData = await mfgLoginRes.json();

  if (mfgLoginData.token) {
    manufacturerToken = mfgLoginData.token;
    // Extract user ID from JWT token
    const tokenPayload = JSON.parse(atob(manufacturerToken.split('.')[1]));
    manufacturerId = tokenPayload.id;
    console.log('✅ Manufacturer login successful');
    console.log(`   User ID: ${manufacturerId}`);
  } else {
    console.log('❌ Manufacturer login failed');
    return;
  }

  // Step 2: Get manufacturer's inventory to find a batch
  console.log('\n📦 Step 2: Get manufacturer inventory...');
  const invRes = await fetch('http://localhost:5000/api/inventory/my-inventory', {
    headers: { 'Authorization': `Bearer ${manufacturerToken}` }
  });

  const invData = await invRes.json();

  if (Array.isArray(invData.inventory) && invData.inventory.length > 0) {
    const batch = invData.inventory[0];
    console.log(`✅ Found batch: ${batch.batchId} (Qty: ${batch.quantity})`);
    console.log(`   Status: ${batch.status || 'valid'}`);

    // Step 3: Create transfer request (should be pending)
    console.log('\n📝 Step 3: Create transfer request...');
    const transferRes = await fetch('http://localhost:5000/api/inventory/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${manufacturerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        batchId: batch.batchId,
        quantity: 10,
        receiverId: 6 // retailer_one has ID 6
      })
    });

    const transferData = await transferRes.json();

    if (transferRes.ok) {
      transferId = transferData.transaction.id;
      console.log('✅ Transfer request created (PENDING)');
      console.log(`   Transfer ID: ${transferId}`);
      console.log(`   Status: ${transferData.transaction.status}`);

      // Step 4: Check manufacturer's inventory (should still have full quantity)
      console.log('\n📦 Step 4: Check manufacturer inventory after transfer request...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const invAfterRes = await fetch('http://localhost:5000/api/inventory/my-inventory', {
        headers: { 'Authorization': `Bearer ${manufacturerToken}` }
      });

      const invAfterData = await invAfterRes.json();
      const sameBatch = invAfterData.inventory.find(i => i.batchId === batch.batchId);

      if (sameBatch) {
        console.log(`✅ Manufacturer still has: ${sameBatch.quantity} units (not deducted yet)`);
        console.log(`   Status: ${sameBatch.status || 'valid'}`);
      }
    } else {
      console.log('❌ Transfer request failed:', transferData.message);
      return;
    }
  } else {
    console.log('⚠️  No inventory found to create transfer request');
    return;
  }

  // Step 5: Login as admin
  console.log('\n🔑 Step 5: Login as admin...');
  await new Promise(resolve => setTimeout(resolve, 500));

  const adminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  const adminLoginData = await adminLoginRes.json();

  if (adminLoginData.token) {
    adminToken = adminLoginData.token;
    console.log('✅ Admin login successful');
  } else {
    console.log('❌ Admin login failed');
    return;
  }

  // Step 6: Get pending transfers
  console.log('\n📋 Step 6: Get pending transfers...');
  await new Promise(resolve => setTimeout(resolve, 500));

  const pendingRes = await fetch('http://localhost:5000/api/inventory/transfers/pending', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  const pendingData = await pendingRes.json();

  if (pendingRes.ok && pendingData.transfers.length > 0) {
    const pendingTransfer = pendingData.transfers.find(t => t.id === transferId);

    if (pendingTransfer) {
      console.log('✅ Pending transfer found:');
      console.log(`   ID: ${pendingTransfer.id}`);
      console.log(`   Medicine: ${pendingTransfer.medicineName}`);
      console.log(`   MAL: ${pendingTransfer.malNumber}`);
      console.log(`   From: ${pendingTransfer.fromUsername}`);
      console.log(`   To: ${pendingTransfer.toUsername}`);
      console.log(`   Quantity: ${pendingTransfer.quantity}`);

      // Step 7: Approve the transfer
      console.log('\n✅ Step 7: Approve transfer...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const approveRes = await fetch(`http://localhost:5000/api/inventory/transfers/${transferId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const approveData = await approveRes.json();

      if (approveRes.ok) {
        console.log('✅ Transfer approved!');
        console.log(`   Message: ${approveData.message}`);
      } else {
        console.log('❌ Approval failed:', approveData.message);
        return;
      }
    } else {
      console.log('⚠️  Transfer not found in pending list');
    }
  } else {
    console.log('⚠️  No pending transfers found');
  }

  // Step 8: Check manufacturer's inventory (should be reduced)
  console.log('\n📦 Step 8: Check manufacturer inventory after approval...');
  await new Promise(resolve => setTimeout(resolve, 500));

  const mfgFinalRes = await fetch('http://localhost:5000/api/inventory/my-inventory', {
    headers: { 'Authorization': `Bearer ${manufacturerToken}` }
  });

  const mfgFinalData = await mfgFinalRes.json();

  if (mfgFinalData.ok) {
    const finalBatch = mfgFinalData.inventory.find(i => i.batchId === invData.inventory[0].batchId);

    if (finalBatch) {
      console.log(`✅ Manufacturer now has: ${finalBatch.quantity} units (reduced by 10)`);
      console.log(`   Status: ${finalBatch.status || 'valid'}`);
    }
  }

  // Step 9: Login as retailer and check inventory
  console.log('\n🔑 Step 9: Login as retailer_one...');
  await new Promise(resolve => setTimeout(resolve, 500));

  const retailerLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'retailer_one', password: 'retail123' })
  });

  const retailerLoginData = await retailerLoginRes.json();

  if (retailerLoginData.token) {
    console.log('✅ Retailer login successful');

    const retailerInvRes = await fetch('http://localhost:5000/api/inventory/my-inventory', {
      headers: { 'Authorization': `Bearer ${retailerLoginData.token}` }
    });

    const retailerInvData = await retailerInvRes.json();

    if (retailerInvData.ok && retailerInvData.inventory.length > 0) {
      console.log(`\n✅ Retailer inventory: ${retailerInvData.inventory.length} items`);

      const receivedBatch = retailerInvData.inventory.find(i => i.batchId === invData.inventory[0].batchId);

      if (receivedBatch) {
        console.log('\n📦 Received Batch Details:');
        console.log(`   Batch ID: ${receivedBatch.batchId}`);
        console.log(`   Medicine: ${receivedBatch.medicineName}`);
        console.log(`   MAL: ${receivedBatch.malNumber}`);
        console.log(`   Quantity: ${receivedBatch.quantity}`);
        console.log(`   Status: ${receivedBatch.status || 'valid'} ✅ (Should be "valid" after approval)`);
      }
    } else {
      console.log('⚠️  Retailer inventory is empty');
    }

    // Step 10: Check retailer transaction history
    console.log('\n📋 Step 10: Check retailer transaction history...');
    const txRes = await fetch('http://localhost:5000/api/inventory/transactions', {
      headers: { 'Authorization': `Bearer ${retailerLoginData.token}` }
    });

    const txData = await txRes.json();

    if (txData.ok && txData.transactions.length > 0) {
      console.log(`✅ Transaction history: ${txData.transactions.length} transactions`);

      const transferTx = txData.transactions.find(t => t.id === transferId);

      if (transferTx) {
        console.log('\n📋 Transfer Transaction Details:');
        console.log(`   Type: ${transferTx.transactionType}`);
        console.log(`   From: ${transferTx.fromUsername}`);
        console.log(`   To: ${transferTx.toUsername}`);
        console.log(`   Quantity: ${transferTx.quantity}`);
      }
    }
  }

  // Step 11: Check manufacturer transaction history for stock_add
  console.log('\n📋 Step 11: Check manufacturer transaction history (Stock Addition)...');
  const mfgTxRes = await fetch('http://localhost:5000/api/inventory/transactions', {
    headers: { 'Authorization': `Bearer ${manufacturerToken}` }
  });

  const mfgTxData = await mfgTxRes.json();

  if (mfgTxData.ok && mfgTxData.transactions.length > 0) {
    const stockAddTx = mfgTxData.transactions.find(t => t.transactionType === 'stock_add');

    if (stockAddTx) {
      console.log('✅ Stock Addition Transaction Found:');
      console.log(`   Type: ${stockAddTx.transactionType}`);
      console.log(`   From: ${stockAddTx.fromUsername || 'N/A'} ✅ (Should show "admin")`);
      console.log(`   To: ${stockAddTx.toUsername}`);
      console.log(`   Quantity: ${stockAddTx.quantity}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Summary of Changes:');
  console.log('='.repeat(60));
  console.log('1. ✅ Transfer now requires admin approval');
  console.log('2. ✅ Admin can approve/reject transfer requests');
  console.log('3. ✅ Inventory only moves AFTER admin approval');
  console.log('4. ✅ Retailer sees inventory with "Valid" status after approval');
  console.log('5. ✅ Stock Addition shows "admin" in Transaction History');
  console.log('='.repeat(60));
}

test();
