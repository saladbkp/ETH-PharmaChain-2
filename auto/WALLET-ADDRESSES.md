# 💰 PharmaChain 钱包地址配置

## 📋 新的 Ganache 账户地址

### 1️⃣ Admin 账户
- **完整地址**: `0x00F8DB8eFf135b324564aE33295513F5Dc7091cD`
- **余额**: 99.99 ETH (部署合约后)
- **索引**: 0
- **用户名**: admin
- **密码**: admin123

### 2️⃣ Manufacturer 账户
- **完整地址**: `0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96`
- **余额**: 100.00 ETH
- **索引**: 1
- **用户名**: manufacturer
- **密码**: mfg123

### 3️⃣ Retailer 账户
- **完整地址**: `0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd`
- **余额**: 100.00 ETH
- **索引**: 2
- **用户名**: retailer_one
- **密码**: retail123

---

## 🔐 如何在 MetaMask 中使用这些账户

### 方法 1: 导入私钥 (推荐)
1. 打开 Ganache
2. 点击账户旁边的 "Key" 图标
3. 复制私钥
4. 在 MetaMask 中:
   - 点击账户图标 → "Import Account"
   - 选择 "Private Key"
   - 粘贴私钥
   - 点击 "Import"

### 方法 2: 直接从 Ganache 复制地址
1. 在 Ganache 中点击账户地址
2. 地址会自动复制到剪贴板
3. 用于验证连接

---

## 📝 已更新的文件

所有以下文件已使用新的钱包地址更新：

1. ✅ `frontend/src/pages/Home.js` - 首页 MetaMask 连接
2. ✅ `frontend/src/contexts/Web3Context.js` - Web3 上下文配置
3. ✅ `frontend/src/pages/Login.js` - 登录页面钱包验证
4. ✅ `WALLET-ADDRESSES.md` - 本文件

---

## 🚀 测试步骤

### 1. 在 MetaMask 中导入 Admin 账户
1. 打开 Ganache
2. 复制第一个账户 (Index 0) 的私钥
3. 在 MetaMask 中导入该账户
4. 切换到该账户

### 2. 确保 MetaMask 连接到 Ganache
- Network Name: Ganache Local
- RPC URL: http://127.0.0.1:7545
- Chain ID: 5777

### 3. 测试连接
1. 访问: http://localhost:3000/
2. 点击 "🔗 Connect MetaMask (Admin)" 按钮
3. 应该显示: **✅ YES**

### 4. 测试登录
1. 访问: http://localhost:3000/login
2. 输入: admin / admin123
3. MetaMask 会自动验证钱包地址
4. 登录成功后跳转到 Dashboard

---

## 📊 快速参考

| 角色 | 用户名 | 密码 | 钱包地址 |
|------|--------|------|----------|
| Admin | admin | admin123 | 0x00F8...1cD |
| Manufacturer | manufacturer | mfg123 | 0x9031...A96 |
| Retailer | retailer_one | retail123 | 0x996C...bfd |

---

## ⚠️ 重要提示

1. **Chain ID**: 必须是 5777 (Ganache)
2. **RPC URL**: http://127.0.0.1:7545
3. **私钥安全**: 不要在生产环境中使用这些私钥
4. **本地测试**: 这些地址仅用于本地 Ganache 测试

---

## 🔍 故障排除

### 如果首页显示 "❌ Wrong account":
- 确保在 MetaMask 中选择了正确的账户
- 刷新页面并重新点击连接按钮

### 如果登录失败:
- 检查用户名和密码
- 确保钱包地址与角色匹配
- 检查 MetaMask 是否连接到 Ganache

### 如果 MetaMask 无法连接:
- 确认 Ganache 正在运行 (端口 7545)
- 检查 MetaMask 网络配置
- 确保已导入正确的账户

---

**更新完成！** 🎉

所有钱包地址已更新为新的 Ganache 账户。
