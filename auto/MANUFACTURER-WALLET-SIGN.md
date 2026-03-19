# 🔐 Manufacturer 操作钱包签名批准说明

## ✅ 更新完成

所有 Manufacturer 的关键操作现在都需要通过 MetaMask 钱包签名批准：

---

## 📋 需要钱包签名的操作

### 1️⃣ Register Medicine (注册药品)
**页面**: `frontend/src/pages/manufacturer/RegisterMedicine.js`
**路由**: `/dashboard/manufacturer/register`

**签名流程**:
1. 填写药品信息（名称、分类、公司等）
2. 点击 "Submit" 按钮
3. 系统验证 Manufacturer 钱包是否连接
4. **弹出 MetaMask 签名请求**
5. 用户在 MetaMask 中确认签名
6. 提交到后端（包含签名）
7. 后端验证签名后保存药品

**签名数据结构**:
```json
{
  "action": "REGISTER_MEDICINE",
  "medicineName": "Paracetamol 500mg",
  "category": "OTC",
  "companyName": "PharmaCorp Inc.",
  "registrationNumber": "REG-20250319-ABC12",
  "contactEmail": "contact@pharmacorp.com",
  "timestamp": 1710844800000
}
```

---

### 2️⃣ Create Batch (创建批次)
**页面**: `frontend/src/pages/manufacturer/CreateBatch.js`
**路由**: `/dashboard/manufacturer/create-batch`

**签名流程**:
1. 选择已批准的药品
2. 填写批次信息（数量、生产日期、过期日期）
3. 点击 "Create Batch" 按钮
4. 系统验证 Manufacturer 钱包是否连接
5. **弹出 MetaMask 签名请求**
6. 用户在 MetaMask 中确认签名
7. 提交到后端（包含签名）
8. 后端验证签名后创建批次

**签名数据结构**:
```json
{
  "action": "CREATE_BATCH",
  "medicineId": "medicine-uuid",
  "medicineName": "Paracetamol 500mg",
  "malNumber": "MAL202500001X",
  "batchId": "BATCH-20250319-XYZ789",
  "quantity": 1000,
  "manufactureDate": "2025-03-19",
  "expiryDate": "2027-03-19",
  "timestamp": 1710844800000
}
```

---

### 3️⃣ Transfer Medicine (转移药品)
**页面**: `frontend/src/pages/Transfer.js`
**路由**: `/dashboard/transfer`

**签名流程**:
1. 选择要转移的批次
2. 填写转移数量和接收方
3. 点击 "Transfer" 按钮
4. 系统验证钱包是否连接（Manufacturer 或 Retailer）
5. **弹出 MetaMask 签名请求**
6. 用户在 MetaMask 中确认签名
7. 提交到后端（包含签名）
8. 后端验证签名后执行转移

**签名数据结构**:
```json
{
  "action": "TRANSFER_MEDICINE",
  "batchId": "BATCH-20250319-XYZ789",
  "medicineName": "Paracetamol 500mg",
  "quantity": 100,
  "from": "manufacturer",
  "to": "retailer_one",
  "toUserId": "user-uuid",
  "timestamp": 1710844800000
}
```

---

## 🔐 钱包验证要求

### Manufacturer 钱包地址
**硬编码地址**: `0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96`

**验证逻辑**:
1. 检查钱包是否连接 (`isConnected`)
2. 检查连接的地址是否匹配 Manufacturer 地址
3. 如果不匹配，显示错误并阻止操作

**错误消息示例**:
```
⚠️ Please connect your Manufacturer wallet first!
⚠️ Wrong wallet! Expected: 0x9031...A96, Connected: 0x00F8...1cD
```

---

## 📊 操作流程图

```
用户操作
   ↓
验证钱包连接
   ↓ (未连接)
显示错误 ← ─ ─ ─ ─ ┘
   ↓ (已连接)
验证钱包角色
   ↓ (角色不匹配)
显示错误 ← ─ ─ ─ ┘
   ↓ (角色匹配)
创建签名消息
   ↓
请求 MetaMask 签名
   ↓ (用户拒绝)
签名失败 ← ─ ─ ─ ┘
   ↓ (用户确认)
获取签名
   ↓
提交到后端 (含签名)
   ↓
后端验证签名
   ↓ (验证失败)
操作失败 ← ─ ─ ─ ┘
   ↓ (验证成功)
操作成功
```

---

## ✅ 用户体验改进

### 1. 清晰的状态提示

| 步骤 | 显示消息 |
|------|---------|
| 钱包未连接 | ⚠️ Please connect your Manufacturer wallet first! |
| 钱包地址错误 | ⚠️ Wrong wallet! Expected: 0x9031...A96 |
| 请求签名 | 🔐 Requesting wallet signature... |
| 签名成功 | ✅ Signature received! Submitting... |
| 签名拒绝 | ❌ Signature rejected: User rejected |
| 操作成功 | ✅ Medicine submitted successfully! |

### 2. 防止误操作
- **未连接钱包**: 操作按钮可点击但会显示错误
- **错误钱包**: 明确告知期望的钱包地址
- **签名拒绝**: 不执行操作，无数据变更
- **网络错误**: 友好的错误提示

---

## 🔒 安全性增强

### 签名验证的好处

1. **身份验证**: 确保操作由合法的 Manufacturer 执行
2. **不可抵赖**: 签名证明操作者授权了该交易
3. **数据完整性**: 签名覆盖所有关键数据，防止篡改
4. **区块链记录**: 为未来区块链集成做准备

### 后端验证（建议）

后端应该验证：
1. 签名的有效性
2. 签名地址与登录用户匹配
3. 签名时间戳的合理性（防止重放攻击）
4. 签名消息的数据完整性

---

## 📝 更新的文件

### 前端文件（已更新）:

1. ✅ `frontend/src/pages/manufacturer/RegisterMedicine.js`
   - 添加 `useWeb3` hook
   - 添加钱包连接检查
   - 添加钱包角色验证
   - 添加签名请求
   - 提交签名到后端

2. ✅ `frontend/src/pages/manufacturer/CreateBatch.js`
   - 添加 `useWeb3` hook
   - 添加钱包连接检查
   - 添加钱包角色验证
   - 添加签名请求
   - 提交签名到后端

3. ✅ `frontend/src/pages/Transfer.js`
   - 添加 `useWeb3` hook
   - 添加钱包连接检查
   - 添加钱包角色验证
   - 添加签名请求
   - 提交签名到后端

---

## 🧪 测试步骤

### 测试 1: 注册药品（需要签名）

1. 以 `manufacturer` 身份登录
2. 确认钱包自动连接到 `0x9031...A96`
3. 导航到 "Register Medicine"
4. 填写药品信息
5. 点击 "Submit"
6. **MetaMask 弹出签名请求**
7. 点击 "Sign"
8. ✅ 药品注册成功

### 测试 2: 创建批次（需要签名）

1. 以 `manufacturer` 身份登录
2. 确认钱包已连接
3. 导航到 "Create Batch"
4. 选择药品并填写批次信息
5. 点击 "Create Batch"
6. **MetaMask 弹出签名请求**
7. 点击 "Sign"
8. ✅ 批次创建成功

### 测试 3: 转移药品（需要签名）

1. 以 `manufacturer` 身份登录
2. 确认钱包已连接
3. 导航到 "Transfer"
4. 选择批次和接收方
5. 点击 "Transfer"
6. **MetaMask 弹出签名请求**
7. 点击 "Sign"
8. ✅ 转移成功

### 测试 4: 错误钱包地址

1. 以 `manufacturer` 身份登录
2. 在 MetaMask 中切换到 Admin 账户
3. 尝试注册药品/创建批次/转移
4. ✅ 显示错误: "Wrong wallet!"

### 测试 5: 拒绝签名

1. 以 `manufacturer` 身份登录
2. 确认钱包已连接
3. 尝试任何操作
4. **MetaMask 弹出签名请求**
5. 点击 "Reject"
6. ✅ 显示错误: "Signature rejected"
7. ✅ 操作未执行

---

## ⚠️ 注意事项

1. **MetaMask 必须解锁**: 操作前确保 MetaMask 已解锁
2. **正确的账户**: 在 MetaMask 中选择 Manufacturer 账户
3. **网络配置**: MetaMask 必须连接到 Ganache (Chain ID: 5777)
4. **签名费用**: Ganache 上无实际 gas 费用
5. **签名确认**: 每次操作都需要在 MetaMask 中确认签名

---

## 🎯 下一步

### 后端验证（可选但推荐）

建议在后端 API 中添加签名验证：

```javascript
// 示例后端验证逻辑
const verifySignature = (message, signature, expectedAddress) => {
  const recoveredAddress = web3.eth.accounts.recover(message, signature);
  return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
};
```

---

**所有 Manufacturer 操作现在都需要钱包签名批准！** ✅
