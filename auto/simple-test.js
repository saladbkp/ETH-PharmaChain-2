/**
 * PharmaChain 简化自动化测试脚本
 *
 * 这个版本跳过文件上传，直接测试核心功能
 */

// 配置
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// 测试用户
const testUsers = {
  admin: { username: 'admin', password: 'admin123' },
  manufacturer: { username: 'manufacturer', password: 'mfg123' },
  retailer: { username: 'retailer', password: 'retail123' }
};

// 存储测试数据
let testData = {
  adminToken: null,
  manufacturerToken: null,
  retailerToken: null,
  categoryId: null,
  medicineId: null,
  malNumber: null,
  batchId: null
};

// 日志函数
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

// HTTP 请求函数
async function request(method, endpoint, data = null, token = null) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let jsonData;

    try {
      jsonData = JSON.parse(text);
    } catch (e) {
      jsonData = { message: text };
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

// 步骤 1: Admin 登录
async function step1_AdminLogin() {
  log('\n=== 步骤 1: Admin 登录 ===', 'info');

  const result = await request('POST', '/auth/login', {
    username: testUsers.admin.username,
    password: testUsers.admin.password
  });

  if (result.ok && result.data.token) {
    testData.adminToken = result.data.token;
    log('✅ Admin 登录成功', 'success');
    return true;
  } else {
    log('❌ Admin 登录失败', 'error');
    return false;
  }
}

// 步骤 2: Admin 创建类别
async function step2_CreateCategory() {
  log('\n=== 步骤 2: Admin 创建药品类别 ===', 'info');

  const result = await request('POST', '/categories', {
    name: `抗生素_${Date.now()}`
  }, testData.adminToken);

  if (result.ok && result.data.category) {
    testData.categoryId = result.data.category.id;
    log(`✅ 类别创建成功 (ID: ${testData.categoryId})`, 'success');
    return true;
  } else {
    log('❌ 类别创建失败', 'error');
    return false;
  }
}

// 步骤 3: Manufacturer 登录
async function step3_ManufacturerLogin() {
  log('\n=== 步骤 3: Manufacturer 登录 ===', 'info');

  const result = await request('POST', '/auth/login', {
    username: testUsers.manufacturer.username,
    password: testUsers.manufacturer.password
  });

  if (result.ok && result.data.token) {
    testData.manufacturerToken = result.data.token;
    log('✅ Manufacturer 登录成功', 'success');
    return true;
  } else {
    log('❌ Manufacturer 登录失败', 'error');
    return false;
  }
}

// 步骤 4: 检查已批准的药品列表
async function step4_CheckApprovedMedicines() {
  log('\n=== 步骤 4: 检查已批准的药品列表 ===', 'info');

  const result = await request('GET', '/medicines/approved', null, testData.manufacturerToken);

  if (result.ok) {
    const medicines = result.data.medicines || [];
    log(`✅ 找到 ${medicines.length} 个已批准的药品`, 'success');

    if (medicines.length > 0) {
      log(`   示例: ${medicines[0].medicineName} (MAL: ${medicines[0].malNumber})`, 'info');
      testData.medicineId = medicines[0].id;
      testData.malNumber = medicines[0].malNumber;
    }

    return true;
  } else {
    log('❌ 获取药品列表失败', 'error');
    return false;
  }
}

// 步骤 5: 创建批次
async function step5_CreateBatch() {
  log('\n=== 步骤 5: Manufacturer 创建生产批次 ===', 'info');

  if (!testData.medicineId) {
    log('⚠️  没有可用的药品，跳过批次创建', 'warning');
    return false;
  }

  const batchData = {
    medicineId: testData.medicineId,
    batchId: `BATCH-${Date.now()}`,
    quantity: 500,
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  const result = await request('POST', '/batches/create', batchData, testData.manufacturerToken);

  if (result.ok && result.data.batch) {
    testData.batchId = result.data.batch.id;
    log(`✅ 批次创建成功 (ID: ${batchData.batchId})`, 'success');
    log(`   数量: ${batchData.quantity}`, 'info');
    log(`   状态: pending (等待审批)`, 'info');
    return true;
  } else {
    log('❌ 批次创建失败', 'error');
    return false;
  }
}

// 步骤 6: Admin 审批批次
async function step6_AdminApproveBatch() {
  log('\n=== 步骤 6: Admin 审批批次 ===', 'info');

  if (!testData.batchId) {
    log('⚠️  没有待审批的批次', 'warning');
    return false;
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  const result = await request('POST', `/batches/${testData.batchId}/approve`, {}, testData.adminToken);

  if (result.ok) {
    log(`✅ 批次审批成功，已添加到库存`, 'success');
    return true;
  } else {
    log('❌ 批次审批失败', 'error');
    return false;
  }
}

// 步骤 7: 检查 Manufacturer 库存
async function step7_CheckInventory() {
  log('\n=== 步骤 7: Manufacturer 检查库存 ===', 'info');

  await new Promise(resolve => setTimeout(resolve, 500));

  const result = await request('GET', '/inventory/my-inventory', null, testData.manufacturerToken);

  if (result.ok && result.data.inventory) {
    const inventory = result.data.inventory;
    log(`✅ 当前库存: ${inventory.length} 个批次`, 'success');

    if (inventory.length > 0) {
      inventory.forEach(item => {
        log(`   - ${item.medicineName}: ${item.quantity} 单位 (到期: ${new Date(item.expiryDate).toLocaleDateString()})`, 'info');
      });
    }

    return true;
  } else {
    log('❌ 获取库存失败', 'error');
    return false;
  }
}

// 步骤 8: Retailer 登录
async function step8_RetailerLogin() {
  log('\n=== 步骤 8: Retailer 登录 ===', 'info');

  const result = await request('POST', '/auth/login', {
    username: testUsers.retailer.username,
    password: testUsers.retailer.password
  });

  if (result.ok && result.data.token) {
    testData.retailerToken = result.data.token;
    log('✅ Retailer 登录成功', 'success');
    return true;
  } else {
    log('❌ Retailer 登录失败', 'error');
    return false;
  }
}

// 步骤 9: 检查 Retailer 库存
async function step9_CheckRetailerInventory() {
  log('\n=== 步骤 9: Retailer 检查库存状态 ===', 'info');

  const result = await request('GET', '/inventory/my-inventory', null, testData.retailerToken);

  if (result.ok) {
    const inventory = result.data.inventory || [];
    log(`✅ Retailer 当前库存: ${inventory.length} 个批次`, 'success');
    return true;
  } else {
    log('❌ 获取 Retailer 库存失败', 'error');
    return false;
  }
}

// 步骤 10: 检查交易历史
async function step10_TransactionHistory() {
  log('\n=== 步骤 10: 检查交易历史 ===', 'info');

  const result = await request('GET', '/inventory/transactions', null, testData.manufacturerToken);

  if (result.ok && result.data.transactions) {
    const transactions = result.data.transactions;
    log(`✅ 交易历史: ${transactions.length} 条记录`, 'success');

    if (transactions.length > 0) {
      transactions.slice(0, 3).forEach(tx => {
        log(`   - ${tx.transactionType}: ${tx.medicineName || 'N/A'} (${tx.quantity} 单位)`, 'info');
      });
    }

    return true;
  } else {
    log('❌ 获取交易历史失败', 'error');
    return false;
  }
}

// 步骤 11: 检查审批历史
async function step11_ApprovalHistory() {
  log('\n=== 步骤 11: 检查审批历史 ===', 'info');

  const result = await request('GET', '/medicines/history', null, testData.adminToken);

  if (result.ok && result.data.history) {
    const history = result.data.history;
    log(`✅ 审批历史: ${history.length} 条记录`, 'success');

    if (history.length > 0) {
      history.slice(0, 3).forEach(record => {
        log(`   - ${record.action}: ${record.medicineName || 'N/A'} (${new Date(record.createdAt).toLocaleDateString()})`, 'info');
      });
    }

    return true;
  } else {
    log('❌ 获取审批历史失败', 'error');
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 PharmaChain 简化自动化测试');
  console.log('='.repeat(80));

  const tests = [
    { name: 'Admin 登录', fn: step1_AdminLogin },
    { name: 'Admin 创建类别', fn: step2_CreateCategory },
    { name: 'Manufacturer 登录', fn: step3_ManufacturerLogin },
    { name: '检查已批准药品', fn: step4_CheckApprovedMedicines },
    { name: '创建批次', fn: step5_CreateBatch },
    { name: 'Admin 审批批次', fn: step6_AdminApproveBatch },
    { name: '检查库存', fn: step7_CheckInventory },
    { name: 'Retailer 登录', fn: step8_RetailerLogin },
    { name: 'Retailer 检查库存', fn: step9_CheckRetailerInventory },
    { name: '交易历史', fn: step10_TransactionHistory },
    { name: '审批历史', fn: step11_ApprovalHistory }
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
      log(`❌ 测试出错: ${error.message}`, 'error');
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 输出结果
  console.log('\n' + '='.repeat(80));
  console.log('📊 测试结果摘要');
  console.log('='.repeat(80));
  console.log(`✅ 通过: ${passed}/${tests.length}`);
  console.log(`❌ 失败: ${failed}/${tests.length}`);
  console.log(`⏱️  成功率: ${((passed / tests.length) * 100).toFixed(2)}%`);
  console.log('='.repeat(80) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// 运行测试
runTests().catch(error => {
  log(`❌ 测试执行失败: ${error.message}`, 'error');
  process.exit(1);
});
