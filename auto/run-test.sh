#!/bin/bash

# PharmaChain 自动化测试启动脚本

echo "🚀 PharmaChain 自动化测试"
echo "=========================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在 auto 目录下运行此脚本"
    echo "   使用: cd auto && ./run-test.sh"
    exit 1
fi

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "   请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "📥 安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

echo "✅ 依赖就绪"
echo ""

# 检查后端服务器是否运行
echo "🔍 检查后端服务器..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ 后端服务器运行中"
else
    echo "❌ 后端服务器未运行"
    echo ""
    echo "请先启动后端服务器:"
    echo "  cd .. && ./start.sh"
    echo ""
    exit 1
fi

echo ""
echo "▶️  开始运行测试..."
echo "=========================="
echo ""

# 运行测试
node test-complete-workflow.js

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================="
    echo "✅ 所有测试通过!"
    echo "=========================="
else
    echo ""
    echo "=========================="
    echo "❌ 部分测试失败"
    echo "=========================="
    exit 1
fi
