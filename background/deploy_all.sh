#!/bin/bash

# CoinReal 多步部署自动化脚本
# 使用方法: ./deploy_all.sh [network_name]
# 示例: ./deploy_all.sh sepolia

set -e  # 遇到错误时退出

# 获取网络参数，默认为 anvil
NETWORK=${1:-anvil}

echo "🚀 开始部署 CoinReal 平台到网络: $NETWORK"
echo "=================================================="

# 设置网络环境变量
export NETWORK=$NETWORK

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请创建 .env 文件并配置相应的环境变量"
    exit 1
fi

# 加载环境变量
set -a
source .env
set +a

# 验证必要的环境变量
RPC_VAR="${NETWORK}_url"
KEY_VAR="${NETWORK}_private_key"

if [ -z "${!RPC_VAR}" ]; then
    echo "❌ 错误: 环境变量 $RPC_VAR 未设置"
    exit 1
fi

if [ -z "${!KEY_VAR}" ]; then
    echo "❌ 错误: 环境变量 $KEY_VAR 未设置"
    exit 1
fi

# 获取实际的RPC URL和私钥值
RPC_URL="${!RPC_VAR}"
PRIVATE_KEY="${!KEY_VAR}"

echo "✅ 环境变量验证通过"
echo "🌐 网络: $NETWORK"
echo "🔗 RPC URL: $RPC_URL"
echo ""

# 步骤1: 部署核心合约
echo "📦 步骤1: 部署核心合约..."
echo "--------------------------------------------------"
if forge script script/multi_deploy/Step1_DeployCore.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast; then
    echo "✅ 步骤1 完成: 核心合约部署成功"
else
    echo "❌ 步骤1 失败: 核心合约部署失败"
    exit 1
fi
echo ""

# 步骤2: 部署测试代币
echo "🪙 步骤2: 部署测试代币..."
echo "--------------------------------------------------"
if forge script script/multi_deploy/Step2_DeployTokens.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast; then
    echo "✅ 步骤2 完成: 测试代币部署成功"
else
    echo "❌ 步骤2 失败: 测试代币部署失败"
    exit 1
fi
echo ""

# 步骤3: 创建示例项目
echo "🏗️ 步骤3: 创建示例项目..."
echo "--------------------------------------------------"
if forge script script/multi_deploy/Step3_CreateProjects.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast; then
    echo "✅ 步骤3 完成: 示例项目创建成功"
else
    echo "❌ 步骤3 失败: 示例项目创建失败"
    exit 1
fi
echo ""

# 步骤4: 创建示例Campaign
echo "🎯 步骤4: 创建示例Campaign..."
echo "--------------------------------------------------"
if forge script script/multi_deploy/Step4_CreateCampaigns.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast; then
    echo "✅ 步骤4 完成: 示例Campaign创建成功"
else
    echo "❌ 步骤4 失败: 示例Campaign创建失败"
    exit 1
fi
echo ""

# 步骤5: 初始化测试数据（根据网络决定是否跳过）
echo "🔧 步骤5: 初始化测试数据..."
echo "--------------------------------------------------"

# 生产环境跳过测试数据初始化
if [ "$NETWORK" != "anvil" ]; then
    echo "🏭 检测到生产环境，跳过测试数据初始化"
    export SKIP_DATA_INIT=true
else
    echo "🧪 测试环境，执行完整数据初始化"
    export SKIP_DATA_INIT=false
fi

if forge script script/multi_deploy/Step5_InitializeData.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast; then
    echo "✅ 步骤5 完成: 数据初始化成功"
else
    echo "❌ 步骤5 失败: 数据初始化失败"
    exit 1
fi
echo ""

# 部署完成总结
echo "🎉 部署完成!"
echo "=================================================="
echo "🌐 网络: $NETWORK"
echo "📁 配置文件: deployments-$NETWORK.json"
echo ""

# 检查配置文件是否存在并显示关键信息
CONFIG_FILE="deployments-$NETWORK.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "📋 部署摘要:"
    echo "--------------------------------------------------"
    
    # 提取关键地址（使用 jq 如果可用，否则使用简单的 grep）
    if command -v jq &> /dev/null; then
        echo "🏢 平台地址: $(jq -r '.platform' $CONFIG_FILE)"
        echo "🔮 价格预言机: $(jq -r '.priceOracle' $CONFIG_FILE)"
        echo "🏭 项目工厂: $(jq -r '.projectFactory' $CONFIG_FILE)"
        echo "🎯 Campaign工厂: $(jq -r '.campaignFactory' $CONFIG_FILE)"
        echo ""
        echo "🪙 代币地址:"
        echo "  - USDC: $(jq -r '.tokens.usdc' $CONFIG_FILE)"
        echo "  - WETH: $(jq -r '.tokens.weth' $CONFIG_FILE)"
        echo "  - DAI: $(jq -r '.tokens.dai' $CONFIG_FILE)"
        echo "  - USDT: $(jq -r '.tokens.usdt' $CONFIG_FILE)"
        echo "  - BNB: $(jq -r '.tokens.bnb' $CONFIG_FILE)"
    else
        echo "📄 详细信息请查看配置文件: $CONFIG_FILE"
    fi
    
    echo ""
    echo "🔗 下一步操作:"
    echo "  1. 验证合约部署: cast call <PLATFORM_ADDRESS> \"getPlatformStats()\" --rpc-url $RPC_URL"
    echo "  2. 前端配置: 将配置文件中的地址更新到前端项目"
    echo "  3. 测试交互: 使用示例用户地址进行功能测试"
else
    echo "⚠️  警告: 配置文件 $CONFIG_FILE 未找到"
fi

echo ""
echo "📚 更多信息请查看: script/DEPLOYMENT_GUIDE.md"
echo "🎯 CoinReal 平台已成功部署到 $NETWORK 网络!" 