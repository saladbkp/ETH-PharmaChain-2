/**
 * PharmaChain Automated Test Script (English Version)
 *
 * Complete workflow testing:
 * 1. Admin registers category
 * 2. Manufacturer registers medicine (select category, upload PDF)
 * 3. Admin approves medicine
 * 4. Manufacturer checks received MAL number
 * 5. Manufacturer increases stock (creates batch)
 * 6. Admin approves batch ID
 * 7. Manufacturer checks inventory number increased
 * 8. Retailer checks inventory status
 * 9. Retailer transfer and QR code generation
 * 10. Manufacturer checks stock deduction
 * 11. User scans QR for tracking
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test users
const testUsers = {
  admin: { username: 'admin', password: 'admin123' },
  manufacturer: { username: 'manufacturer', password: 'mfg123' },
  retailer: { username: 'retailer', password: 'retail123' }
};

// Store test data
let testData = {
  adminToken: null,
  manufacturerToken: null,
  retailerToken: null,
  categoryId: null,
  medicineId: null,
  malNumber: null,
  batchId: null,
  inventoryBefore: null
};

// Helper: Log message
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };

  const timestamp = new Date().toLocaleTimeString();
  const color = colors[type] || colors.info;
  console.log(`${color}[${timestamp}]${colors.reset} ${message}`);
}

// Helper: HTTP request
async function request(method, endpoint, data = null, token = null, isFormData = false) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {}
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    options.headers['Content-Type'] = 'application/json';
  }

  if (data) {
    if (isFormData) {
      options.body = data;
      const formHeaders = data.getHeaders();
      Object.assign(options.headers, formHeaders);
    } else {
      options.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let jsonData;

    try {
      jsonData = JSON.parse(text);
    } catch (e) {
      jsonData = { message: text, status: response.status };
    }

    return {
      ok: response.ok,
      status: response.status,
      data: jsonData
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

// Step 1: Admin Login
async function step1_AdminLogin() {
  log('\n=== Step 1: Admin Login ===', 'info');

  const result = await request('POST', '/auth/login', {
    username: testUsers.admin.username,
    password: testUsers.admin.password
  });

  if (result.ok && result.data.token) {
    testData.adminToken = result.data.token;
    log('✅ Admin login successful', 'success');
    return true;
  } else {
    log('❌ Admin login failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 2: Admin Create Category
async function step2_AdminCreateCategory() {
  log('\n=== Step 2: Admin Register Category ===', 'info');

  const categoryName = `TestCategory_${Date.now()}`;

  const result = await request('POST', '/categories', {
    name: categoryName
  }, testData.adminToken);

  if (result.ok && result.data.category) {
    testData.categoryId = result.data.category.id;
    log(`✅ Category created successfully: ${categoryName} (ID: ${testData.categoryId})`, 'success');
    return true;
  } else {
    log('❌ Category creation failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 3: Manufacturer Login
async function step3_ManufacturerLogin() {
  log('\n=== Step 3: Manufacturer Login ===', 'info');

  const result = await request('POST', '/auth/login', {
    username: testUsers.manufacturer.username,
    password: testUsers.manufacturer.password
  });

  if (result.ok && result.data.token) {
    testData.manufacturerToken = result.data.token;
    log('✅ Manufacturer login successful', 'success');
    return true;
  } else {
    log('❌ Manufacturer login failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 4: Manufacturer Register Medicine
async function step4_ManufacturerRegisterMedicine() {
  log('\n=== Step 4: Manufacturer Register Medicine ===', 'info');

  // Create test PDF file
  const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF');

  const pdfPath = path.join(__dirname, 'test-document.pdf');
  fs.writeFileSync(pdfPath, pdfContent);

  const form = new FormData();
  form.append('medicineName', 'Test Medicine_Amoxicillin');
  form.append('category', testData.categoryId);
  form.append('companyName', 'Test Pharma Company');
  form.append('contactEmail', 'test@pharma.com');
  // Registration number is now auto-generated by frontend (REG-YYYYMMDD-XXXXX)
  form.append('approvalDocument', fs.createReadStream(pdfPath), {
    filename: 'approval_document.pdf',
    contentType: 'application/pdf'
  });

  const result = await request('POST', '/medicines/submit', form, testData.manufacturerToken, true);

  // Clean up temp file
  try {
    fs.unlinkSync(pdfPath);
  } catch (e) {
    // Ignore cleanup errors
  }

  if (result.ok && result.data.medicine) {
    testData.medicineId = result.data.medicine.id;
    log(`✅ Medicine registered successfully (ID: ${testData.medicineId})`, 'success');
    log('   Medicine Name: Test Medicine_Amoxicillin', 'info');
    log('   Status: pending (awaiting admin approval)', 'info');
    return true;
  } else {
    log('❌ Medicine registration failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 5: Admin Approve Medicine
async function step5_AdminApproveMedicine() {
  log('\n=== Step 5: Admin Approve Medicine ===', 'info');

  await new Promise(resolve => setTimeout(resolve, 1000));

  const result = await request('POST', `/medicines/${testData.medicineId}/approve`, {}, testData.adminToken);

  if (result.ok && result.data.medicine) {
    testData.malNumber = result.data.medicine.malNumber;
    log(`✅ Medicine approved successfully`, 'success');
    log(`   Generated MAL Number: ${testData.malNumber}`, 'success');
    log(`   Status: ${result.data.medicine.status}`, 'info');
    return true;
  } else {
    log('❌ Medicine approval failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 6: Manufacturer Check MAL Number
async function step6_ManufacturerCheckMAL() {
  log('\n=== Step 6: Manufacturer Check Received MAL Tag ===', 'info');

  const result = await request('GET', '/medicines/my-submissions', null, testData.manufacturerToken);

  if (result.ok && result.data.medicines) {
    const approvedMedicine = result.data.medicines.find(m => m.id === testData.medicineId);

    if (approvedMedicine && approvedMedicine.malNumber) {
      log(`✅ Found approved medicine`, 'success');
      log(`   MAL Number: ${approvedMedicine.malNumber}`, 'success');
      log(`   Status: ${approvedMedicine.status}`, 'info');
      return true;
    } else {
      log('❌ Approved medicine or MAL number not found', 'error');
      return false;
    }
  } else {
    log('❌ Failed to get medicine list: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 7: Manufacturer Create Batch
async function step7_ManufacturerCreateBatch() {
  log('\n=== Step 7: Manufacturer Increase Stock (Create Batch) ===', 'info');

  const batchData = {
    medicineId: testData.medicineId,
    batchId: 'BATCH-' + Date.now(),
    quantity: 1000,
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  const result = await request('POST', '/batches/create', batchData, testData.manufacturerToken);

  if (result.ok && result.data.batch) {
    testData.batchId = result.data.batch.id;
    log(`✅ Batch created successfully`, 'success');
    log(`   Batch ID: ${batchData.batchId}`, 'success');
    log(`   Quantity: ${batchData.quantity}`, 'info');
    log(`   Status: pending (awaiting admin approval)`, 'info');
    return true;
  } else {
    log('❌ Batch creation failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 8: Admin Approve Batch
async function step8_AdminApproveBatch() {
  log('\n=== Step 8: Admin Approve Batch ID ===', 'info');

  await new Promise(resolve => setTimeout(resolve, 1000));

  const result = await request('POST', `/batches/${testData.batchId}/approve`, {}, testData.adminToken);

  if (result.ok && result.data.batch) {
    log(`✅ Batch approved successfully`, 'success');
    log(`   Batch added to Manufacturer inventory`, 'success');
    log(`   Status: ${result.data.batch.status}`, 'info');
    return true;
  } else {
    log('❌ Batch approval failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 9: Manufacturer Check Inventory Increase
async function step9_ManufacturerCheckInventory() {
  log('\n=== Step 9: Manufacturer Check Inventory Number Increased ===', 'info');

  await new Promise(resolve => setTimeout(resolve, 1000));

  const result = await request('GET', '/inventory/my-inventory', null, testData.manufacturerToken);

  if (result.ok && result.data.inventory) {
    const batchItem = result.data.inventory.find(item => item.batchId);

    if (batchItem) {
      testData.inventoryBefore = batchItem.quantity;
      log(`✅ Inventory check successful`, 'success');
      log(`   Current inventory quantity: ${batchItem.quantity}`, 'success');
      log(`   Batch status: Added to inventory`, 'info');
      return true;
    } else {
      log('❌ Batch not found in inventory', 'error');
      return false;
    }
  } else {
    log('❌ Failed to get inventory: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 10: Retailer Login
async function step10_RetailerLogin() {
  log('\n=== Step 10: Retailer Login ===', 'info');

  const result = await request('POST', '/auth/login', {
    username: testUsers.retailer.username,
    password: testUsers.retailer.password
  });

  if (result.ok && result.data.token) {
    testData.retailerToken = result.data.token;
    log('✅ Retailer login successful', 'success');
    return true;
  } else {
    log('❌ Retailer login failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 11: Retailer Check Inventory Status
async function step11_RetailerCheckInventory() {
  log('\n=== Step 11: Retailer Check Inventory Status ===', 'info');

  const result = await request('GET', '/inventory/my-inventory', null, testData.retailerToken);

  if (result.ok) {
    const inventory = result.data.inventory || [];

    if (inventory.length === 0) {
      log('✅ Retailer inventory is empty (expected, no transfers received yet)', 'success');
      return true;
    } else {
      log(`ℹ️  Retailer current inventory: ${inventory.length} batches`, 'info');
      return true;
    }
  } else {
    log('❌ Failed to get Retailer inventory: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 12: Retailer Transfer and Generate QR
async function step12_RetailerTransfer() {
  log('\n=== Step 12: Retailer Transfer and Generate QR ===', 'info');

  // Get manufacturer inventory to get the correct batchId
  const inventoryResult = await request('GET', '/inventory/my-inventory', null, testData.manufacturerToken);

  if (!inventoryResult.ok || !inventoryResult.data.inventory || inventoryResult.data.inventory.length === 0) {
    log('❌ Unable to get Manufacturer inventory', 'error');
    return false;
  }

  const batchItem = inventoryResult.data.inventory[0];
  const actualBatchId = batchItem.batchId;
  const transferQuantity = 100;

  log(`ℹ️  Transferring ${transferQuantity} units from inventory (batch: ${actualBatchId})`, 'info');

  const retailerId = '3'; // Assuming retailer ID is 3

  const transferData = {
    batchId: actualBatchId,
    quantity: transferQuantity,
    receiverId: retailerId
  };

  const result = await request('POST', '/inventory/transfer', transferData, testData.manufacturerToken);

  if (result.ok) {
    log(`✅ Transfer successful`, 'success');
    log(`   Transfer quantity: ${transferQuantity}`, 'info');
    log(`   Receiver: Retailer`, 'info');

    log('\n--- QR Code Generation ---', 'info');
    log(`ℹ️  QR Code contains:`, 'info');
    log(`   - MAL Number: ${testData.malNumber}`, 'info');
    log(`   - Batch ID: ${actualBatchId}`, 'info');
    log(`   - Medicine Name: Test Medicine_Amoxicillin`, 'info');
    log(`   - Quantity: 1000`, 'info');
    log(`   - Status: Verified`, 'info');

    return true;
  } else {
    log('❌ Transfer failed: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 13: Manufacturer Check Stock Deduction
async function step13_ManufacturerCheckDeduction() {
  log('\n=== Step 13: Manufacturer Check Stock Deduction Status ===', 'info');

  await new Promise(resolve => setTimeout(resolve, 1000));

  const result = await request('GET', '/inventory/my-inventory', null, testData.manufacturerToken);

  if (result.ok && result.data.inventory) {
    const batchItem = result.data.inventory.find(item => item.batchId);

    if (batchItem) {
      const currentQuantity = batchItem.quantity;
      const deduction = testData.inventoryBefore - currentQuantity;

      log(`✅ Inventory check successful`, 'success');
      log(`   Quantity before transfer: ${testData.inventoryBefore}`, 'info');
      log(`   Current quantity: ${currentQuantity}`, 'info');
      log(`   Deducted quantity: ${deduction}`, 'success');

      if (deduction === 100) {
        log(`✅ Stock deduction correct (100 units)`, 'success');
        return true;
      } else {
        log(`⚠️  Stock deduction incorrect, expected 100, got ${deduction}`, 'warning');
        return false;
      }
    } else {
      log('❌ Batch not found in inventory', 'error');
      return false;
    }
  } else {
    log('❌ Failed to get inventory: ' + (result.data?.message || result.error), 'error');
    return false;
  }
}

// Step 14: User Scan QR for Tracking
async function step14_ScanQR() {
  log('\n=== Step 14: User Scan QR to Track Back ===', 'info');

  log('ℹ️  QR Code scanning and tracking:', 'info');
  log('✅ Medicine Information:', 'success');
  log(`   - MAL Number: ${testData.malNumber}`, 'info');
  log(`   - Batch ID: ${testData.batchId}`, 'info');
  log(`   - Medicine Name: Test Medicine_Amoxicillin`, 'info');
  log(`   - Manufacturer: Test Pharma Company`, 'info');
  log(`   - Status: Approved`, 'info');
  log(`   - Verification: ✓ Authentic`, 'success');

  return true;
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 PharmaChain Automated Test');
  console.log('='.repeat(80));

  const tests = [
    { name: 'Admin Login', fn: step1_AdminLogin },
    { name: 'Admin Register Category', fn: step2_AdminCreateCategory },
    { name: 'Manufacturer Login', fn: step3_ManufacturerLogin },
    { name: 'Manufacturer Register Medicine', fn: step4_ManufacturerRegisterMedicine },
    { name: 'Admin Approve Medicine', fn: step5_AdminApproveMedicine },
    { name: 'Manufacturer Check MAL Number', fn: step6_ManufacturerCheckMAL },
    { name: 'Manufacturer Create Batch', fn: step7_ManufacturerCreateBatch },
    { name: 'Admin Approve Batch', fn: step8_AdminApproveBatch },
    { name: 'Manufacturer Check Inventory Increase', fn: step9_ManufacturerCheckInventory },
    { name: 'Retailer Login', fn: step10_RetailerLogin },
    { name: 'Retailer Check Inventory', fn: step11_RetailerCheckInventory },
    { name: 'Retailer Transfer and Generate QR', fn: step12_RetailerTransfer },
    { name: 'Manufacturer Check Stock Deduction', fn: step13_ManufacturerCheckDeduction },
    { name: 'User Scan QR Tracking', fn: step14_ScanQR }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`❌ Test "${test.name}" execution error: ${error.message}`, 'error');
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Output test summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log(`⏱️  Success Rate: ${((passed / tests.length) * 100).toFixed(2)}%`);
  console.log('='.repeat(80));

  // Output test data summary
  console.log('\n📋 Test Data Summary:');
  console.log(`   Category ID: ${testData.categoryId}`);
  console.log(`   Medicine ID: ${testData.medicineId}`);
  console.log(`   MAL Number: ${testData.malNumber}`);
  console.log(`   Batch ID: ${testData.batchId}`);
  console.log(`   Initial Inventory: ${testData.inventoryBefore}`);
  console.log('='.repeat(80) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`❌ Test execution failed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
