# 🚀 PharmaChain Web3 快速开始指南

## ✅ 当前状态

- ✅ Ganache 正在运行 (端口 7545)
- ✅ 智能合约已部署到地址: `0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA`
- ✅ 合约 Chain ID: 5777
- ✅ 测试页面已在浏览器中打开

---

## 🔧 MetaMask 配置步骤

### 步骤 1: 检查当前网络
1. 打开 MetaMask
2. 查看当前连接的网络（顶部显示）
3. 如果显示 "Ethereum Mainnet" 或其他非 Ganache 网络，需要切换

### 步骤 2: 添加 Ganache 网络
**方法 A - 手动添加:**
1. 点击 MetaMask 顶部的网络下拉菜单
2. 点击 "Add Network" 或 "添加网络"
3. 选择 "Add a Custom Network" 或 "添加自定义网络"
4. 填写以下信息:
   - **Network Name**: `Ganache Local`
   - **RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `5777`
   - **Currency Symbol**: `ETH`
5. 点击 "Save" 或 "保存"

**方法 B - 使用测试页面:**
1. 在已打开的测试页面中
2. 点击 "🌐 检查网络配置" 按钮
3. 页面会显示详细网络信息和修复步骤

### 步骤 3: 导入钱包账户

如果 MetaMask 中没有系统需要的账户，需要导入:

#### 导入 Admin 账户:
1. 点击 MetaMask 右上角的账户图标
2. 选择 "Import Account" 或 "导入账户"
3. 选择 "Type" -> "Private Key"
4. 粘贴 Admin 私钥 (从 Ganache 复制)
5. 点击 "Import" 或 "导入"

#### 重复以上步骤导入 Manufacturer 和 Retailer 账户

---

## 💰 钱包地址列表

| 角色 | 地址 | 用户名 | 密码 |
|------|------|--------|------|
| Admin | `0xdd81CD832b7054e52e9c52b24391a7E035` | admin | admin123 |
| Manufacturer | `0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f` | manufacturer | mfg123 |
| Retailer | `0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e` | retailer_one | retail123 |

---

## 🧪 测试流程

### 1. 测试 Web3 连接
在已打开的测试页面中:
1. 点击 "🔗 测试 Web3 连接" 按钮
2. MetaMask 会弹出连接请求
3. 点击 "Next" → "Connect"
4. 查看测试结果

**预期结果:**
- ✅ 网络连接成功
- ✅ 账户验证成功
- ✅ 合约连接成功

### 2. 测试不同角色
**Admin 测试:**
1. 在 MetaMask 中切换到 Admin 账户
2. 刷新测试页面
3. 点击 "测试 Web3 连接"
4. 验证显示 "Admin 👑" 角色

**Manufacturer 测试:**
1. 在 MetaMask 中切换到 Manufacturer 账户
2. 刷新测试页面
3. 点击 "测试 Web3 连接"
4. 验证显示 "Manufacturer 🏭" 角色

**Retailer 测试:**
1. 在 MetaMask 中切换到 Retailer 账户
2. 刷新测试页面
3. 点击 "测试 Web3 连接"
4. 验证显示 "Retailer 🏪" 角色

### 3. 测试登录系统
访问: http://localhost:3000/login

**以 Admin 身份登录:**
1. 确保 MetaMask 已选择 Admin 账户
2. 确保 MetaMask 连接到 Ganache 网络
3. 输入用户名: `admin`
4. 输入密码: `admin123`
5. 点击 "Login" 按钮
6. MetaMask 会弹出签名请求（可选）
7. 登录成功后自动跳转到 Dashboard

**重复以上步骤测试其他角色**

---

## ⚠️ 常见问题

### 问题 1: "Wrong network! Please connect to Ganache"
**解决方法:**
1. 打开 MetaMask
2. 切换网络到 "Ganache Local"
3. 如果没有该网络，按照上面的步骤添加

### 问题 2: "Wrong wallet! Please import account"
**解决方法:**
1. 打开 MetaMask
2. 导入对应角色的私钥（从 Ganache 复制）
3. 切换到正确的账户

### 问题 3: "MetaMask not installed"
**解决方法:**
1. 访问 https://metamask.io
2. 下载并安装 MetaMask 扩展
3. 创建或导入钱包

### 问题 4: 测试页面显示 "网络不匹配"
**解决方法:**
1. 在 MetaMask 中确保连接到 Ganache (Chain ID: 5777)
2. 刷新测试页面
3. 重新点击 "测试 Web3 连接"

### 问题 5: 连接成功但登录失败
**检查清单:**
- [ ] 用户名和密码正确
- [ ] MetaMask 连接到 Ganache
- [ ] MetaMask 选择了正确的账户
- [ ] 后端服务器正在运行 (端口 5000)
- [ ] 前端服务器正在运行 (端口 3000)

---

## 📋 快速命令

```bash
# 启动后端
cd backend
node server.js

# 启动前端
cd frontend
npm start

# 运行 Web3 测试
./test-web3-connection.sh

# 查看合约信息
cat frontend/src/contracts/README.md
```

---

## 🎯 下一步

测试成功后，你可以:

1. **作为 Admin:**
   - 审批待处理的药品注册
   - 审批批次
   - 管理分类
   - 查看审批历史

2. **作为 Manufacturer:**
   - 注册新药品
   - 创建批次
   - 管理库存
   - 转移药品

3. **作为 Retailer:**
   - 查看库存
   - 扫描 QR 码
   - 查看交易历史

---

## 📞 需要帮助?

如果遇到问题:
1. 查看浏览器控制台 (F12) 的错误信息
2. 确认 Ganache 正在运行
3. 确认 MetaMask 配置正确
4. 检查后端和前端服务器是否运行

---

**祝你测试顺利！** 🎉
