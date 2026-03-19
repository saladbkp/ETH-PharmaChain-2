# 🔐 PharmaChain 硬编码钱包地址完整清单

## 📋 当前硬编码的钱包地址

### 角色 → 地址映射

| 角色 | 钱包地址 | Ganache 索引 |
|------|----------|-------------|
| **Admin** | `0x00F8DB8eFf135b324564aE33295513F5Dc7091cD` | 0 |
| **Manufacturer** | `0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96` | 1 |
| **Retailer** | `0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd` | 2 |

---

## 📂 包含硬编码地址的文件

### 🔴 **关键文件** (代码逻辑 - 必须更新)

#### 1. `frontend/src/pages/Home.js`
**用途**: 首页 MetaMask 连接测试按钮

**位置**: 第 20 行
```javascript
const ADMIN_ADDRESS = "0x00F8DB8eFf135b324564aE33295513F5Dc7091cD";
```

**使用方式**:
- 第 27 行: 验证连接的账户是否匹配 Admin 地址
- 第 43 行: 错误消息中显示期望的 Admin 地址

**需要更新**: ✅ 是
**更新方法**: 替换 `ADMIN_ADDRESS` 的值

---

#### 2. `frontend/src/contexts/Web3Context.js`
**用途**: 全局 Web3 上下文和钱包地址配置

**位置**: 第 15-19 行
```javascript
export const WALLET_ADDRESSES = {
  admin: '0x00F8DB8eFf135b324564aE33295513F5Dc7091cD',
  manufacturer: '0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96',
  retailer: '0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd'
};
```

**使用方式**:
- 第 158 行: `verifyWalletForRole()` 函数验证钱包地址
- Dashboard 中所有需要验证角色的地方

**需要更新**: ✅ 是
**更新方法**: 替换 `WALLET_ADDRESSES` 对象中的三个地址

---

### 🟡 **文档文件** (参考文档 - 建议更新)

#### 3. `WALLET-ADDRESSES.md`
**用途**: 钱包地址配置参考文档

**包含内容**: 完整的地址映射、登录凭证、使用说明

**需要更新**: ✅ 是
**更新方法**: 文档中所有三处地址

---

#### 4. `UPDATE-SUMMARY.md`
**用途**: 系统更新总结文档

**包含内容**: 更新日志、配置说明

**需要更新**: ✅ 是
**更新方法**: 搜索并替换所有地址

---

#### 5. `SETUP-GUIDE.md`
**用途**: Ganache 环境设置指南

**包含内容**: 设置步骤、地址配置

**需要更新**: ✅ 是
**更新方法**: 搜索并替换所有地址

---

#### 6. `WALLET-CONFIG-SUMMARY.md`
**用途**: 钱包配置确认文档

**包含内容**: 配置状态、验证结果、测试步骤

**需要更新**: ✅ 是
**更新方法**: 搜索并替换所有地址

---

#### 7. `DEPLOYMENT-SUCCESS.md`
**用途**: 部署成功总结文档

**包含内容**: 部署信息、地址配置

**需要更新**: ✅ 是
**更新方法**: 搜索并替换所有地址

---

#### 8. `TEST-CASES.md`
**用途**: 正式测试用例文档

**包含内容**: 测试数据、预期结果

**需要更新**: ✅ 是
**更新方法**: 搜索并替换所有地址

---

## 🔍 按地址分类的文件列表

### Admin 地址 (0x00F8DB8eFf135b324564aE33295513F5Dc7091cD)

| 文件 | 类型 | 优先级 | 行号/位置 |
|------|------|--------|----------|
| `frontend/src/pages/Home.js` | 代码 | 🔴 高 | 第 20 行 |
| `frontend/src/contexts/Web3Context.js` | 代码 | 🔴 高 | 第 16 行 |
| `WALLET-ADDRESSES.md` | 文档 | 🟡 中 | 多处 |
| `UPDATE-SUMMARY.md` | 文档 | 🟡 中 | 多处 |
| `SETUP-GUIDE.md` | 文档 | 🟡 中 | 多处 |
| `WALLET-CONFIG-SUMMARY.md` | 文档 | 🟡 中 | 多处 |
| `DEPLOYMENT-SUCCESS.md` | 文档 | 🟡 中 | 多处 |
| `TEST-CASES.md` | 文档 | 🟡 中 | 多处 |

**总计**: 8 个文件

---

### Manufacturer 地址 (0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96)

| 文件 | 类型 | 优先级 | 行号/位置 |
|------|------|--------|----------|
| `frontend/src/contexts/Web3Context.js` | 代码 | 🔴 高 | 第 17 行 |
| `WALLET-ADDRESSES.md` | 文档 | 🟡 中 | 多处 |
| `UPDATE-SUMMARY.md` | 文档 | 🟡 中 | 多处 |
| `SETUP-GUIDE.md` | 文档 | 🟡 中 | 多处 |
| `WALLET-CONFIG-SUMMARY.md` | 文档 | 🟡 中 | 多处 |
| `TEST-CASES.md` | 文档 | 🟡 中 | 多处 |

**总计**: 6 个文件

---

### Retailer 地址 (0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd)

| 文件 | 类型 | 优先级 | 行号/位置 |
|------|------|--------|----------|
| `frontend/src/contexts/Web3Context.js` | 代码 | 🔴 高 | 第 18 行 |
| `WALLET-ADDRESSES.md` | 文档 | 🟡 中 | 多处 |
| `UPDATE-SUMMARY.md` | 文档 | 🟡 中 | 多处 |
| `SETUP-GUIDE.md` | 文档 | 🟡 中 | 多处 |
| `WALLET-CONFIG-SUMMARY.md` | 文档 | 🟡 中 | 多处 |
| `TEST-CASES.md` | 文档 | 🟡 中 | 多处 |

**总计**: 6 个文件

---

## 📝 更新脚本需要的文件清单

### 方式 1: 使用现有的自动脚本

已创建的脚本会自动检测和更新所有文件：

```bash
# Bash 版本
./setup-ganache.sh

# Node.js 版本
./setup-ganache.js
```

**脚本会自动**:
1. 从 Ganache 提取新的三个钱包地址
2. 检测当前地址
3. 更新所有代码文件
4. 更新所有文档文件
5. 创建备份文件

---

### 方式 2: 手动更新

如果需要手动更新，必须修改以下 **2 个关键代码文件**：

#### 必须更新 1: `frontend/src/pages/Home.js`
```javascript
// 第 20 行
const ADMIN_ADDRESS = "新的_Admin_地址";
```

#### 必须更新 2: `frontend/src/contexts/Web3Context.js`
```javascript
// 第 15-19 行
export const WALLET_ADDRESSES = {
  admin: '新的_Admin_地址',
  manufacturer: '新的_Manufacturer_地址',
  retailer: '新的_Retailer_地址'
};
```

#### 可选更新: 文档文件 (6 个)
- `WALLET-ADDRESSES.md`
- `UPDATE-SUMMARY.md`
- `SETUP-GUIDE.md`
- `WALLET-CONFIG-SUMMARY.md`
- `DEPLOYMENT-SUCCESS.md`
- `TEST-CASES.md`

---

## 🔧 快速查找和替换命令

### 在所有文件中查找地址

```bash
# 查找 Admin 地址
grep -r "0x00F8DB8eFf135b324564aE33295513F5Dc7091cD" --include="*.js" --include="*.md" .

# 查找 Manufacturer 地址
grep -r "0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96" --include="*.js" --include="*.md" .

# 查找 Retailer 地址
grep -r "0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd" --include="*.js" --include="*.md" .
```

### 批量替换 (macOS)

```bash
# 替换 Admin 地址
find . -type f \( -name "*.js" -o -name "*.md" \) -not -path "*/node_modules/*" -exec sed -i '' 's/0x00F8DB8eFf135b324564aE33295513F5Dc7091cD/新的地址/g' {} +

# 替换 Manufacturer 地址
find . -type f \( -name "*.js" -o -name "*.md" \) -not -path "*/node_modules/*" -exec sed -i '' 's/0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96/新的地址/g' {} +

# 替换 Retailer 地址
find . -type f \( -name "*.js" -o -name "*.md" \) -not -path "*/node_modules/*" -exec sed -i '' 's/0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd/新的地址/g' {} +
```

### 批量替换 (Linux)

```bash
# 替换 Admin 地址
find . -type f \( -name "*.js" -o -name "*.md" \) -not -path "*/node_modules/*" -exec sed -i 's/0x00F8DB8eFf135b324564aE33295513F5Dc7091cD/新的地址/g' {} +

# 替换 Manufacturer 地址
find . -type f \( -name "*.js" -o -name "*.md" \) -not -path "*/node_modules/*" -exec sed -i 's/0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96/新的地址/g' {} +

# 替换 Retailer 地址
find . -type f \( -name "*.js" -o -name "*.md" \) -not -path "*/node_modules/*" -exec sed -i 's/0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd/新的地址/g' {} +
```

---

## ✅ 验证清单

更新地址后，确认以下内容：

- [ ] `Home.js` 中的 `ADMIN_ADDRESS` 已更新
- [ ] `Web3Context.js` 中的 `WALLET_ADDRESSES` 已更新
- [ ] 首页连接测试显示 "✅ YES"
- [ ] Dashboard 自动连接钱包成功
- [ ] 所有三个角色都能正常登录和连接钱包
- [ ] 文档中的地址已更新 (可选)

---

## 📊 统计信息

- **代码文件**: 2 个 (必须更新)
- **文档文件**: 6 个 (建议更新)
- **总文件数**: 8 个
- **总地址数**: 3 个 (Admin, Manufacturer, Retailer)
- **自动脚本**: 2 个 (setup-ganache.sh, setup-ganache.js)

---

## 🎯 推荐更新流程

### 使用自动脚本 (推荐):

```bash
# 1. 启动新的 Ganache
# 2. 运行自动脚本
./setup-ganache.js

# 3. 脚本会自动:
#    - 从 Ganache 提取地址
#    - 更新所有 8 个文件
#    - 创建备份
#    - 生成配置文件

# 4. 在 MetaMask 中导入新地址
# 5. 测试连接
```

### 手动更新:

```bash
# 1. 从 Ganache 复制三个新地址
# 2. 更新 Home.js (第 20 行)
# 3. 更新 Web3Context.js (第 15-19 行)
# 4. (可选) 更新文档文件
# 5. 测试连接
```

---

**清单完成！下次更换 Ganache 环境时，参考此清单或直接运行自动脚本。** ✅
