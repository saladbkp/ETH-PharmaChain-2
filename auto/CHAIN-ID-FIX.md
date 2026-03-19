# 🔧 Chain ID 问题 - 已修复

## ⚠️ 问题原因

你的 Ganache 实例使用的 **Chain ID: 5777**，但代码期望的是 **Chain ID: 1337**。

## ✅ 已修复

我已经更新了代码，现在支持 **两个 Chain ID**：
- ✅ Chain ID 1337 (标准 Ganache)
- ✅ Chain ID 5777 (你的 Ganache 实例)

## 🚀 现在请刷新浏览器

1. **在浏览器中按**: `Cmd + Shift + R` (Mac) 或 `Ctrl + Shift + R` (Windows)
2. **清除缓存并重新加载**
3. **再次尝试登录**

## 📋 登录步骤

1. **打开 MetaMask**
   - 确保已选择正确的账户（Admin/Manufacturer/Retailer）
   - 确保已连接到 Ganache 网络

2. **访问登录页**
   ```
   http://localhost:3000/login
   ```

3. **输入凭据**
   - 用户名: `admin`
   - 密码: `admin123`

4. **点击 "Login"**
   - 系统会自动检查你的 MetaMask
   - 如果一切正确，会自动连接！

## 🔑 正确的账户地址

| 角色 | MetaMask 账户地址 |
|------|------------------|
| Admin | `0xdd81CD832b7054e52e9c1e4b4c52b24391a7E035` |
| Manufacturer | `0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f` |
| Retailer | `0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e` |

## ⚠️ 如果还是失败

### 检查清单：

1. ✅ MetaMask 是否已解锁？
2. ✅ 是否选择了正确的账户？
3. ✅ MetaMask 是否连接到 Ganache 网络？
4. ✅ 账户地址是否匹配你的角色？

### 常见错误：

**错误 1**: "Wrong wallet!"
- **原因**: MetaMask 选择的账户不匹配你的角色
- **解决**: 在 MetaMask 中切换到正确的账户

**错误 2**: "Wrong network!"
- **原因**: MetaMask 没有连接到 Ganache
- **解决**:
  1. 打开 MetaMask
  2. 点击网络下拉菜单
  3. 选择 "Ganache Local" 或 "Localhost 7545"

**错误 3**: "MetaMask not installed"
- **解决**: 从 https://metamask.io 安装

## 📱 快速测试

运行这个命令测试 Ganache 连接：

```bash
curl http://127.0.0.1:7545
```

应该返回类似：
```json
{"jsonrpc":"2.0","id":67,"result":"0x..."}
```

## 🎯 预期成功消息

登录成功后你应该看到：

```
✅ Login successful!
Wallet connected: 0xdd81...E035
```

然后自动跳转到 Dashboard！

---

**需要帮助？** 请告诉我你看到的具体错误消息！
