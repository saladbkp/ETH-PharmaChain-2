# 🚀 PharmaChain Ganache 环境快速设置指南

## 📋 概述

当你需要更换到新的 Ganache 环境时，这些脚本会自动：
1. ✅ 从 Ganache 提取钱包地址
2. ✅ 自动更新所有硬编码的钱包地址
3. ✅ 创建配置文件供参考
4. ✅ 备份原始文件

---

## 🎯 两种脚本

### 方式 1: Bash 脚本 (macOS/Linux)

```bash
./setup-ganache.sh
```

### 方式 2: Node.js 脚本 (跨平台)

```bash
node setup-ganache.js
# 或者
./setup-ganache.js
```

---

## 📝 使用步骤

### 第 1 步: 启动新的 Ganache 环境

**GUI 版本:**
1. 打开 Ganache 应用
2. 点击 "Quickstart" 或 "New Workspace"
3. 确保端口是 7545

**CLI 版本:**
```bash
ganache-cli --port 7545
```

### 第 2 步: 运行设置脚本

```bash
cd /Users/hongruiyi/Desktop/mec-v3/ETH-PharmaChain-2-main

# 选择一个脚本运行
./setup-ganache.sh    # Bash 版本
# 或
./setup-ganache.js    # Node.js 版本
```

### 第 3 步: 在 MetaMask 中导入新账户

脚本运行后，会显示新的钱包地址：

```
📋 New Wallet Addresses:

  🔐 Admin:
     Address: 0x00F8DB8eFf135b324564aE33295513F5Dc7091cD
     
  🏭 Manufacturer:
     Address: 0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96
     
  🏪 Retailer:
     Address: 0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd
```

**导入步骤:**
1. 打开 Ganache
2. 点击每个账户旁边的 **"Key"** 图标
3. 复制私钥
4. 在 MetaMask 中:
   - 点击账户图标 → "Import Account"
   - 选择 "Private Key"
   - 粘贴私钥
   - 点击 "Import"

### 第 4 步: 确认 MetaMask 网络配置

在 MetaMask 中添加/选择 Ganache 网络:
- **Network Name**: `Ganache Local`
- **RPC URL**: `http://127.0.0.1:7545`
- **Chain ID**: `5777`
- **Currency Symbol**: `ETH`

### 第 5 步: 测试连接

1. 访问: http://localhost:3000/
2. 点击 "🔗 Connect MetaMask (Admin)" 按钮
3. 应该显示: **✅ YES**

---

## 📂 脚本会更新的文件

### 前端文件:
1. `frontend/src/pages/Home.js`
2. `frontend/src/contexts/Web3Context.js`
3. `frontend/src/pages/Login.js`

### 文档文件:
4. `WALLET-ADDRESSES.md`
5. `ganache-config.json` (新创建)

### 备份文件:
- 所有更新的文件都会创建 `.backup` 后缀的备份

---

## 🔧 配置文件

脚本会创建 `ganache-config.json`:

```json
{
  "network": {
    "name": "Ganache Local",
    "rpcUrl": "http://127.0.0.1:7545",
    "chainId": 5777
  },
  "wallets": {
    "admin": {
      "address": "0x00F8...",
      "username": "admin",
      "password": "admin123",
      "role": "admin"
    },
    "manufacturer": {
      "address": "0x9031...",
      "username": "manufacturer",
      "password": "mfg123",
      "role": "manufacturer"
    },
    "retailer": {
      "address": "0x996C...",
      "username": "retailer_one",
      "password": "retail123",
      "role": "retailer"
    }
  },
  "contract": {
    "address": "0x7698...",
    "name": "PharmaChain"
  },
  "updatedAt": "2025-03-19T10:00:00Z"
}
```

---

## 📊 输出示例

```bash
$ ./setup-ganache.sh

========================================
🚀 PharmaChain Ganache Setup Script
========================================

ℹ️  Checking if Ganache is running...
✅ Ganache is running on port 7545

ℹ️  Extracting wallet addresses from Ganache...
✅ Extracted addresses from Ganache:

  Admin:        0x00F8DB8eFf135b324564aE33295513F5Dc7091cD
  Manufacturer: 0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96
  Retailer:     0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd

ℹ️  Updating all files with new wallet addresses...
  Current addresses detected:
    Admin:        0xdd81CD832b7054e52e9c52b24391a7E035
    Manufacturer: 0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f
    Retailer:     0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e

✅ Updated: frontend/src/pages/Home.js
✅ Updated: frontend/src/contexts/Web3Context.js
✅ Updated: frontend/src/pages/Login.js
✅ Updated: WALLET-ADDRESSES.md

✅ All files updated successfully!

ℹ️  Creating/updating configuration file...
✅ Configuration saved to: ganache-config.json

========================================
✅ Setup Complete!
========================================

📋 New Wallet Addresses:
  ...
```

---

## ⚠️ 故障排除

### 问题 1: "Ganache is NOT running!"
**解决:** 确保 Ganache 正在运行并监听 7545 端口
```bash
# 检查端口
curl http://127.0.0.1:7545
```

### 问题 2: "Web3 not found"
**解决:** 安装 web3 依赖
```bash
cd frontend
npm install web3
```

### 问题 3: "Permission denied"
**解决:** 给脚本添加执行权限
```bash
chmod +x setup-ganache.sh
chmod +x setup-ganache.js
```

### 问题 4: 更新后仍然显示旧地址
**解决:** 
1. 清除浏览器缓存
2. 重启前端服务器: `cd frontend && npm start`
3. 刷新浏览器页面

---

## 🔄 恢复备份

如果需要恢复原始文件:

```bash
# 恢复单个文件
mv frontend/src/pages/Home.js.backup frontend/src/pages/Home.js

# 或恢复所有备份
find . -name "*.backup" -while read f; do
  mv "$f" "${f%.backup}"
done
```

---

## 🎯 最佳实践

1. **每次启动新 Ganache 时运行脚本**
2. **保存 `ganache-config.json` 作为记录**
3. **保留 `.backup` 文件直到确认一切正常**
4. **测试连接后再开始使用系统**

---

## 📞 需要帮助?

如果遇到问题:
1. 检查 Ganache 是否正在运行
2. 确认端口 7545 没有被占用
3. 查看脚本输出的错误信息
4. 检查 `.backup` 文件确认原始内容

---

**快速设置，一键完成！** 🚀
