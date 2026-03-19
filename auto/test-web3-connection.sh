#!/bin/bash

echo "=========================================="
echo "🧪 PharmaChain Web3 连接测试"
echo "=========================================="
echo ""

# 检查 Ganache
echo "📋 步骤 1: 检查 Ganache..."
if curl -s http://127.0.0.1:7545 > /dev/null; then
    echo "✅ Ganache 正在运行 (端口 7545)"
else
    echo "❌ Ganache 未运行！"
    echo ""
    echo "请先启动 Ganache:"
    echo "  - GUI: 打开 Ganache 应用 → 点击 'Quickstart'"
    echo "  - CLI: 运行 'ganache-cli --port 7545'"
    echo ""
    exit 1
fi

echo ""
echo "📋 步骤 2: 钱包地址验证"
echo "=========================================="
echo ""

# Admin
ADMIN_ADDRESS="0xdd81CD832b7054e52e9c52b24391a7E035"
echo "Admin 账户:"
echo "   地址: $ADMIN_ADDRESS"

# Manufacturer
MANUFACTURER_ADDRESS="0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f"
echo ""
echo "Manufacturer 账户:"
echo "   地址: $MANUFACTURER_ADDRESS"

# Retailer
RETAILER_ADDRESS="0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e"
echo ""
echo "Retailer 账户:"
echo "   地址: $RETAILER_ADDRESS"

echo ""
echo "📋 步骤 3: 合约信息"
echo "=========================================="
CONTRACT_ADDRESS="0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA"
CHAIN_ID=5777

echo "合约地址: $CONTRACT_ADDRESS"
echo "Chain ID: $CHAIN_ID"
echo "网络: Ganache Local"
echo "RPC: http://127.0.0.1:7545"

echo ""
echo "📋 步骤 4: 打开测试页面"
echo "=========================================="
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TEST_PAGE="$SCRIPT_DIR/frontend/test-web3-fixed.html"

# 检查测试页面是否存在
if [ ! -f "$TEST_PAGE" ]; then
    echo "❌ 测试页面不存在: $TEST_PAGE"
    exit 1
fi

echo "正在打开测试页面..."
echo "文件: $TEST_PAGE"
echo ""

# 在 macOS 上用默认浏览器打开
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$TEST_PAGE"
else
    # Linux 上用 xdg-open
    xdg-open "$TEST_PAGE" 2>/dev/null || echo "请手动打开: $TEST_PAGE"
fi

echo ""
echo "📋 步骤 5: 测试流程"
echo "=========================================="
echo ""
echo "1. 🔗 点击 '测试 Web3 连接' 按钮"
echo "   - 会请求 MetaMask 连接"
echo "   - 会检查网络配置"
echo "   - 会验证钱包地址"
echo ""
echo "2. ✅ 确保以下配置正确:"
echo "   - MetaMask 连接到 Ganache (Chain ID: $CHAIN_ID)"
echo "   - 选择了正确的账户"
echo ""
echo "3. 🎯 测试不同角色:"
echo ""
echo "   👑 Admin 测试:"
echo "      a. 在 MetaMask 选择 Admin 账户"
echo "      b. 点击 '测试 Web3 连接'"
echo "      c. 验证角色显示为 'Admin'"
echo ""
echo "   🏭 Manufacturer 测试:"
echo "      a. 在 MetaMask 切换到 Manufacturer 账户"
echo "      b. 刷新测试页面"
echo "      c. 点击 '测试 Web3 连接'"
echo "      d. 验证角色显示为 'Manufacturer'"
echo ""
echo "   🏪 Retailer 测试:"
echo "      a. 在 MetaMask 切换到 Retailer 账户"
echo "      b. 刷新测试页面"
echo "      c. 点击 '测试 Web3 连接'"
echo "      d. 验证角色显示为 'Retailer'"
echo ""

echo "📋 步骤 6: 登录系统测试"
echo "=========================================="
echo ""
echo "测试成功后，访问登录页面:"
echo "   URL: http://localhost:3000/login"
echo ""
echo "使用对应角色登录:"
echo "   Admin:       username: admin    password: admin123"
echo "   Manufacturer: username: manufacturer  password: mfg123"
echo "   Retailer:    username: retailer_one  password: retail123"
echo ""

echo "=========================================="
echo "✅ 测试清单"
echo "=========================================="
echo ""
echo "请确认以下项目:"
echo ""
echo "Web3 连接:"
echo "[ ] MetaMask 已安装"
echo "[ ] 点击连接按钮后请求 MetaMask"
echo "[ ] 账户地址显示正确"
echo "[ ] 余额显示正确 (~100 ETH)"
echo ""
echo "网络配置:"
echo "[ ] Chain ID 显示 5777"
echo "[ ] 网络名称显示 Ganache"
echo "[ ] 与合约部署环境匹配"
echo ""
echo "角色验证:"
echo "[ ] Admin 账户显示 'Admin' 角色"
echo "[ ] Manufacturer 账户显示 'Manufacturer' 角色"
echo "[ ] Retailer 账户显示 'Retailer' 角色"
echo ""

echo "🎯 预期成功结果:"
echo "=========================================="
echo ""
echo "✅ 网络连接成功"
echo "✅ 账户验证成功"
echo "✅ 合约连接成功"
echo "✅ 可以前往登录页面"
echo ""

echo "📱 快速链接:"
echo "=========================================="
echo "测试页面: file://$TEST_PAGE"
echo "登录页面: http://localhost:3000/login"
echo "合约 ABI: frontend/src/contracts/PharmaChain.json"
echo ""
