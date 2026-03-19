#!/bin/bash

echo "=========================================="
echo "🔍 MetaMask 网络诊断"
echo "=========================================="
echo ""

# 检查 Ganache 是否运行
echo "📋 检查 Ganache..."
if curl -s http://127.0.0.1:7545 > /dev/null; then
    echo "✅ Ganache 正在运行 (端口 7545)"
else
    echo "❌ Ganache 未运行!"
    echo ""
    echo "请先启动 Ganache:"
    echo "  - GUI: 打开 Ganache 应用 → 点击 'Quickstart'"
    echo "  - CLI: 运行 'ganache-cli --port 7545'"
    exit 1
fi

echo ""
echo "📋 Ganache 网络信息:"
echo "   RPC URL:     http://127.0.0.1:7545"
echo "   Chain ID:    5777 (十进制) / 0x1691 (十六进制)"
echo "   Network Name: Ganache Local"
echo ""

echo "📋 问题诊断:"
echo "   你的 MetaMask 当前连接到: 以太坊主网 (Chain ID: 1)"
echo "   应该连接到:               Ganache (Chain ID: 5777)"
echo ""

echo "=========================================="
echo "🔧 解决方案:"
echo "=========================================="
echo ""
echo "方法 1: 使用自动诊断页面 (推荐)"
echo "--------------------------------------"
echo "1. 浏览器已自动打开诊断页面"
echo "2. 点击 'Switch to Ganache' 按钮"
echo "3. 在 MetaMask 中确认"
echo ""

echo "方法 2: 手动添加网络"
echo "--------------------------------------"
echo "1. 打开 MetaMask"
echo "2. 点击网络下拉菜单"
echo "3. 点击 'Add Network' → 'Add a Custom Network'"
echo "4. 输入:"
echo "   - Network Name: Ganache Local"
echo "   - RPC URL:      http://127.0.0.1:7545"
echo "   - Chain ID:     5777"
echo "   - Currency Symbol: ETH"
echo "5. 点击 'Save'"
echo ""

echo "方法 3: 快速添加脚本"
echo "--------------------------------------"
echo "打开诊断页面并点击 'Add Ganache Network' 按钮"
echo ""

echo "=========================================="
echo "✅ 完成后:"
echo "=========================================="
echo ""
echo "1. 在 MetaMask 中选择 'Ganache Local' 网络"
echo "2. 确保 Admin 账户已选中: 0xdd81...E035"
echo "3. 访问: http://localhost:3000/login"
echo "4. 输入用户名: admin"
echo "5. 输入密码: admin123"
echo "6. 点击 Login"
echo ""

echo "💰 正确的账户地址:"
echo "   Admin:       0xdd81CD832b7054e52e9c52b24391a7E035"
echo "   Manufacturer: 0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f"
echo "   Retailer:    0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e"
echo ""
