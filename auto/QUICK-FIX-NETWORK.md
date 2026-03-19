# 🚨 Quick Fix: MetaMask Network Configuration

## 问题：Wrong Network Error

你看到的错误：
```
⚠️ Wallet Error:
Wrong network! Please connect to Ganache (Chain ID: 1337)
Current: 1
```

这是因为 MetaMask 连接到以太坊主网（Chain ID: 1），而不是 Ganache 本地网络（Chain ID: 1337）。

## ✅ 快速解决方案

### 方法 1: 使用自动设置页面（推荐）

1. **打开设置页面**：
   ```bash
   # macOS/Linux
   open frontend/setup-ganache-network.html

   # Windows
   start frontend\setup-ganache-network.html
   ```

2. **点击 "Add Ganache Network to MetaMask"** 按钮

3. **在 MetaMask 中确认** 添加网络

4. **切换到 Ganache Local** 网络

### 方法 2: 手动添加网络

1. 打开 MetaMask
2. 点击网络下拉菜单
3. 点击 "Add Network" → "Add a Custom Network"
4. 输入以下信息：
   - **Network Name**: `Ganache Local`
   - **New RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
5. 点击 "Save"

### 方法 3: 使用快速设置脚本

```bash
# macOS/Linux
./setup-ganache.sh

# Windows
setup-ganache.bat
```

## 📋 完整设置步骤

### Step 1: 启动 Ganache

**GUI 方式**:
1. 打开 Ganache 应用
2. 点击 "Quickstart"

**CLI 方式**:
```bash
ganache-cli --port 7545
```

### Step 2: 添加 Ganache 网络到 MetaMask

使用方法 1、2 或 3 中的任意一种。

### Step 3: 导入 Ganache 账户到 MetaMask

你需要在 MetaMask 中导入 3 个账户：

#### 获取私钥：
1. 打开 Ganache
2. 点击一个账户（例如 Account 0）
3. 复制私钥

#### 导入到 MetaMask：
1. 点击 MetaMask 账户下拉菜单
2. 点击 "Import Account"
3. 粘贴私钥
4. 点击 "Import"
5. 对所有 3 个账户重复此操作

### Step 4: 选择正确的账户

| 角色 | 钱包地址 | 用户名 |
|------|----------|--------|
| Admin | `0xdd81CD832b7054e52e9c1e4b4c52b24391a7E035` | `admin` |
| Manufacturer | `0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f` | `manufacturer` |
| Retailer | `0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e` | `retailer_one` |

在 MetaMask 中选择对应角色的账户。

### Step 5: 切换到 Ganache 网络

在 MetaMask 中：
1. 点击网络下拉菜单
2. 选择 "Ganache Local"

### Step 6: 登录 PharmaChain

1. 打开 [http://localhost:3000/login](http://localhost:3000/login)
2. 输入用户名和密码
3. ✅ MetaMask 将自动连接！

## 🔧 验证设置

### 检查 1: Ganache 正在运行
```bash
curl http://127.0.0.1:7545
```

应该返回类似：
```json
{"jsonrpc":"2.0","id":67,"result":0x...}
```

### 检查 2: MetaMask 网络
在 MetaMask 中应该看到：
- **Network**: Ganache Local
- **Chain ID**: 1337
- **Balance**: ~100 ETH

### 检查 3: 正确的账户
确保 MetaMask 中选择的账户匹配你的角色。

## 📱 快速命令参考

### 启动所有服务

```bash
# Terminal 1: 启动后端
cd backend
node server.js

# Terminal 2: 启动前端
cd frontend
npm start

# Terminal 3: 启动 Ganache（如果使用 CLI）
ganache-cli --port 7545
```

### 自动设置
```bash
# 运行设置脚本
./setup-ganache.sh
```

## 🐛 常见问题

### Q: 仍然显示 "Wrong network" 错误
**A**:
1. 确认 Ganache 正在运行
2. 在 MetaMask 中切换到 "Ganache Local" 网络
3. 刷新页面并重试

### Q: "Wrong wallet" 错误
**A**:
1. 在 MetaMask 中切换到正确的账户
2. 确保账户地址匹配你的角色
3. 参考上表查看对应关系

### Q: MetaMask 弹窗但不连接
**A**:
1. 确保你在 MetaMask 中点击 "Connect" 或 "Next"
2. 检查 MetaMask 是否已解锁
3. 刷新页面重试

### Q: Ganache GUI 无法启动
**A**:
1. 使用 Ganache CLI: `npm install -g ganache-cli`
2. 运行: `ganache-cli --port 7545`

## 📁 文件说明

- `setup-ganache-network.html` - 一键添加 MetaMask 网络的网页
- `setup-ganache.sh` - macOS/Linux 自动设置脚本
- `setup-ganache.bat` - Windows 自动设置脚本
- `frontend/package.json.v5.backup` - v5 依赖备份

## ✅ 成功标志

当设置正确时，登录应该显示：
```
✅ Login successful!
Wallet connected: 0xdd81...E035
```

并且自动跳转到 Dashboard！

---

**需要帮助？** 查看 [AUTO-CONNECT-WALLET.md](AUTO-CONNECT-WALLET.md) 获取详细指南。
