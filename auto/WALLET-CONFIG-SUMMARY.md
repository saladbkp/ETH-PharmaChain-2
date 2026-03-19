# 🔐 PharmaChain 钱包地址配置确认

## ✅ 硬编码的钱包地址到角色映射

### 配置状态: 已确认 ✅

所有文件中的钱包地址已正确硬编码并同步。

---

## 📋 角色与钱包地址映射

| # | 角色 | 钱包地址 | 用户名 | 密码 | Ganache 索引 |
|---|------|----------|--------|------|-------------|
| 1 | **Admin** | `0x00F8DB8eFf135b324564aE33295513F5Dc7091cD` | admin | admin123 | 0 |
| 2 | **Manufacturer** | `0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96` | manufacturer | mfg123 | 1 |
| 3 | **Retailer** | `0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd` | retailer_one | retail123 | 2 |

---

## 📂 配置文件位置

### 1. 首页钱包连接测试
**文件**: `frontend/src/pages/Home.js`
```javascript
const ADMIN_ADDRESS = "0x00F8DB8eFf135b324564aE33295513F5Dc7091cD";
```
- 用于首页的 "Connect MetaMask (Admin)" 按钮
- 验证连接的钱包是否是 Admin 账户
- 显示 "✅ YES" 或 "❌ Wrong account"

---

### 2. Web3 上下文配置
**文件**: `frontend/src/contexts/Web3Context.js`
```javascript
export const WALLET_ADDRESSES = {
  admin: '0x00F8DB8eFf135b324564aE33295513F5Dc7091cD',
  manufacturer: '0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96',
  retailer: '0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd'
};
```
- 全局钱包地址配置
- 用于 Dashboard 中的钱包验证
- 用于审批流程中的角色验证

---

### 3. 登录页面 (已移除钱包连接)
**文件**: `frontend/src/pages/Login.js`
- **状态**: 钱包连接逻辑已移除
- **原因**: 登录后自动连接钱包，简化登录流程
- **当前行为**: 
  - 仅验证用户名和密码
  - 登录成功后在 Dashboard 自动连接钱包

---

## 🔄 钱包连接流程

### 当前实现流程:

```
1. 用户访问 http://localhost:3000/login
   ↓
2. 输入用户名和密码
   ↓
3. 后端验证凭据
   ↓
4. 登录成功，重定向到 /dashboard
   ↓
5. Dashboard 自动调用 connectWallet()
   ↓
6. MetaMask 弹出连接请求
   ↓
7. 用户确认连接
   ↓
8. 系统验证连接的钱包地址
   ↓
9. 显示钱包信息和角色
```

---

## ✅ 钱包地址验证逻辑

### 自动验证场景:

#### 场景 1: Admin 登录
1. 用户以 `admin` 身份登录
2. Dashboard 自动连接钱包
3. **验证**: 连接的地址必须是 `0x00F8...1cD`
4. **结果**: 显示 Admin 角色和余额

#### 场景 2: Manufacturer 登录
1. 用户以 `manufacturer` 身份登录
2. Dashboard 自动连接钱包
3. **验证**: 连接的地址必须是 `0x9031...A96`
4. **结果**: 显示 Manufacturer 角色和余额

#### 场景 3: Retailer 登录
1. 用户以 `retailer_one` 身份登录
2. Dashboard 自动连接钱包
3. **验证**: 连接的地址必须是 `0x996C...bfd`
4. **结果**: 显示 Retailer 角色和余额

---

## 🔍 验证函数位置

### 1. WalletConnect 组件
**文件**: `frontend/src/components/WalletConnect.js`
- 显示当前连接的钱包地址
- 显示余额
- 显示角色标签
- 提供 "Disconnect" 按钮

### 2. Web3Context
**文件**: `frontend/src/contexts/Web3Context.js`
```javascript
const verifyWalletForRole = (role) => {
  const expectedAddress = WALLET_ADDRESSES[role.toLowerCase()];
  
  if (!expectedAddress) {
    return { valid: false, message: `Unknown role: ${role}` };
  }
  
  if (account.toLowerCase() !== expectedAddress.toLowerCase()) {
    return {
      valid: false,
      message: `Wrong wallet! Expected: ${expectedAddress}, Connected: ${account}`
    };
  }
  
  return { valid: true, message: 'Wallet verified' };
};
```

---

## 🚀 快速测试

### 测试步骤:

1. **在 MetaMask 中导入三个账户**:
   ```
   Account 0 (Admin):        0x00F8DB8eFf135b324564aE33295513F5Dc7091cD
   Account 1 (Manufacturer): 0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96
   Account 2 (Retailer):     0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd
   ```

2. **测试首页连接**:
   - 访问: http://localhost:3000/
   - 点击: "🔗 Connect MetaMask (Admin)"
   - 在 MetaMask 中选择 Admin 账户
   - 应该显示: **✅ YES**

3. **测试登录自动连接**:
   - 访问: http://localhost:3000/login
   - 登录: `admin` / `admin123`
   - 等待重定向到 Dashboard
   - 自动连接钱包
   - 显示 Admin 地址和余额

---

## 📊 配置验证结果

| 文件 | Admin 地址 | Manufacturer 地址 | Retailer 地址 | 状态 |
|------|-----------|------------------|---------------|------|
| `Home.js` | ✅ 0x00F8...1cD | N/A | N/A | ✅ 正确 |
| `Web3Context.js` | ✅ 0x00F8...1cD | ✅ 0x9031...A96 | ✅ 0x996C...bfd | ✅ 正确 |
| `Login.js` | N/A | N/A | N/A | ✅ 已移除 (符合设计) |

---

## 🎯 钱包地址格式验证

### Admin 地址:
```
完整: 0x00F8DB8eFf135b324564aE33295513F5Dc7091cD
长度: 42 字符 (0x + 40 位十六进制)
格式: ✅ 正确
```

### Manufacturer 地址:
```
完整: 0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96
长度: 42 字符
格式: ✅ 正确
```

### Retailer 地址:
```
完整: 0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd
长度: 42 字符
格式: ✅ 正确
```

---

## ✅ 确认清单

- [x] 所有钱包地址已硬编码
- [x] 地址格式正确 (42 字符)
- [x] 三个文件中的地址一致
- [x] 角色映射正确
- [x] 登录流程已简化 (无钱包要求)
- [x] Dashboard 自动连接钱包
- [x] 断开钱包 = 退出登录
- [x] 退出登录 = 断开钱包
- [x] 测试用例已创建

---

## 📝 更换钱包地址

如果需要更换到新的 Ganache 环境:

### 方式 1: 使用自动化脚本
```bash
./setup-ganache.sh
# 或
node setup-ganache.js
```

### 方式 2: 手动更新
需要更新以下文件:
1. `frontend/src/pages/Home.js` - 第 20 行
2. `frontend/src/contexts/Web3Context.js` - 第 15-19 行
3. `WALLET-ADDRESSES.md` - 文档

---

**配置确认完成！所有钱包地址已正确硬编码。** ✅
