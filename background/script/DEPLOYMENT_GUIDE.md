# CoinReal 多步部署指南

## 📋 概述

本指南介绍如何使用多步部署系统在不同网络上部署 CoinReal 平台。多步部署系统将原本的一次性部署拆分为5个独立步骤，解决了 Gas 限制、合约大小限制和交易费用等问题。

## 🎯 支持的网络

- **anvil** - 本地测试网络
- **sepolia** - Ethereum 测试网
- **avalanche_fuji** - Avalanche Fuji 测试网

## 🔧 环境准备

### 1. 环境变量配置

在 `background/.env` 文件中配置以下环境变量：

```bash
# Anvil 本地网络
ANVIL_URL=http://localhost:8545
ANVIL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Sepolia 测试网
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# Avalanche Fuji 测试网
AVALANCHE_FUJI_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_FUJI_PRIVATE_KEY=YOUR_PRIVATE_KEY

# 可选配置
NETWORK=anvil                    # 默认网络
SKIP_DATA_INIT=false            # 是否跳过测试数据初始化
```

### 2. 工具安装

确保已安装 Foundry：

```bash
# 安装 Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 验证安装
forge --version
```

## 🚀 部署步骤

### 步骤1: 部署核心合约

部署平台的核心智能合约：

```bash
# 设置网络环境变量
export NETWORK=anvil  # 或 sepolia, avalanche_fuji

# 从 .env 文件获取配置
source .env
RPC_URL=${anvil_url}  # 或 ${sepolia_url}, ${avalanche_fuji_url}
PRIVATE_KEY=${anvil_private_key}  # 或 ${sepolia_private_key}, ${avalanche_fuji_private_key}

# 部署核心合约
forge script script/multi_deploy/Step1_DeployCore.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast

# 验证部署
ls deployments-$NETWORK.json
```

**部署内容：**
- MockPriceOracle（价格预言机）
- CoinRealPlatform（平台主合约）
- Project 实现合约
- ProjectFactory（项目工厂）
- Campaign 实现合约
- CampaignFactory（Campaign工厂）

### 步骤2: 部署测试代币

部署测试用的 ERC20 代币并设置价格：

```bash
forge script script/multi_deploy/Step2_DeployTokens.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

**部署内容：**
- USDC (10M 供应量, $1.00)
- WETH (100K 供应量, $2500.00)
- DAI (10M 供应量, $1.00)
- USDT (10M 供应量, $1.00)
- BNB (1M 供应量, $300.00)

### 步骤3: 创建示例项目

创建9个示例项目：

```bash
forge script script/multi_deploy/Step3_CreateProjects.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

**创建项目：**
- Bitcoin (BTC) - Layer1
- Ethereum (ETH) - Layer1
- Solana (SOL) - Layer1
- Polygon (MATIC) - Layer2
- Arbitrum (ARB) - Layer2
- Uniswap (UNI) - DeFi
- Aave (AAVE) - DeFi
- OpenSea (OS) - NFT
- Axie Infinity (AXS) - GameFi

### 步骤4: 创建示例Campaign

为项目创建Campaign奖励池：

```bash
forge script script/multi_deploy/Step4_CreateCampaigns.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

**创建Campaign：**
- 9个 USDC Campaign（每个1000 USDC，30天）
- 2个 WETH Campaign（每个1 WETH，60天）

### 步骤5: 初始化测试数据（可选）

为测试用户分配代币并模拟用户交互：

```bash
# 测试环境（包含测试数据）
forge script script/multi_deploy/Step5_InitializeData.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast

# 生产环境（跳过测试数据）
export SKIP_DATA_INIT=true
forge script script/multi_deploy/Step5_InitializeData.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

**初始化内容：**
- 为4个示例用户分配测试代币
- 模拟用户评论和点赞交互
- 更新配置文件

## 📁 配置文件

每个网络的部署信息保存在 `deployments-{network}.json` 文件中：

```json
{
  "network": "anvil",
  "timestamp": "1750771331",
  "platform": "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  "priceOracle": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  "projectFactory": "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
  "campaignFactory": "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707",
  "tokens": {
    "usdc": "0x8a791620dd6260079bf849dc5567adc3f2fdc318",
    "weth": "0x610178da211fef7d417bc0e6fed39f05609ad788"
  },
  "projects": {
    "btc": {
      "name": "Bitcoin",
      "symbol": "BTC",
      "address": "0xd8058efe0198ae9dd7d563e1b4938dcbc86a1f81"
    }
  },
  "sampleUsers": {
    "alice": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    "bob": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
  }
}
```

## 🔍 验证部署

### 检查合约状态

```bash
# 检查平台统计
forge script script/multi_deploy/utils/VerifyDeployment.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY"

# 或手动验证
cast call $PLATFORM_ADDRESS "getPlatformStats()" --rpc-url "$RPC_URL"
```

### 测试合约交互

```bash
# 获取项目列表
cast call $PLATFORM_ADDRESS "getProjects(uint256,uint256)" 0 10 --rpc-url "$RPC_URL"

# 检查代币余额
cast call $USDC_ADDRESS "balanceOf(address)" $ALICE_ADDRESS --rpc-url "$RPC_URL"
```

## 🚨 故障排除

### 常见问题

#### 1. 环境变量未设置
```
Error: Missing environment variable: SEPOLIA_URL
```
**解决方案：** 检查 `.env` 文件中的环境变量配置

#### 2. 私钥格式错误
```
Error: Invalid private key format
```
**解决方案：** 确保私钥以 `0x` 开头且为64位十六进制字符

#### 3. RPC 连接失败
```
Error: Failed to connect to RPC
```
**解决方案：** 检查网络连接和 RPC URL 是否正确

#### 4. Gas 不足
```
Error: Transaction failed due to insufficient gas
```
**解决方案：** 确保部署账户有足够的 ETH 支付 Gas 费用

#### 5. 合约已部署
```
Core contracts already deployed!
```
**解决方案：** 删除对应的配置文件或修改配置重新部署

### 重新部署

如需重新部署某个步骤：

```bash
# 删除配置文件
rm deployments-$NETWORK.json

# 或删除特定部分（手动编辑JSON文件）
# 删除 "tokens" 部分重新部署代币
# 删除 "projects" 部分重新创建项目
```

## 📊 Gas 成本估算

| 步骤 | 操作数量 | 预估 Gas | Sepolia 成本* |
|------|----------|----------|---------------|
| Step1 | 6个合约 + 配置 | ~8,000,000 | ~$20-40 |
| Step2 | 5个代币 + 价格设置 | ~2,000,000 | ~$5-10 |
| Step3 | 9个项目创建 | ~1,500,000 | ~$4-8 |
| Step4 | 11个Campaign创建 | ~2,500,000 | ~$6-12 |
| Step5 | 用户资金 + 交互 | ~1,000,000 | ~$3-6 |
| **总计** | - | **~15,000,000** | **~$38-76** |

*基于 20 Gwei Gas 价格和 ETH = $2000 估算

## 🔧 高级配置

### 自定义网络

添加新网络支持：

1. 在 `BaseMultiDeploy.sol` 中添加网络配置：
```solidity
rpcUrlKeys["your_network"] = "YOUR_NETWORK_URL";
privateKeyKeys["your_network"] = "YOUR_NETWORK_PRIVATE_KEY";
```

2. 添加链ID配置：
```solidity
} else if (keccak256(bytes(networkName)) == keccak256(bytes("your_network"))) {
    currentNetwork.chainId = YOUR_CHAIN_ID;
    currentNetwork.isTestnet = true; // 或 false
}
```

### 批量部署脚本

创建自动化部署脚本：

```bash
#!/bin/bash
# deploy_all.sh

NETWORK=${1:-anvil}
echo "Deploying to network: $NETWORK"

export NETWORK=$NETWORK

# 执行所有步骤
forge script script/multi_deploy/Step1_DeployCore.s.sol --network $NETWORK --broadcast
forge script script/multi_deploy/Step2_DeployTokens.s.sol --network $NETWORK --broadcast
forge script script/multi_deploy/Step3_CreateProjects.s.sol --network $NETWORK --broadcast
forge script script/multi_deploy/Step4_CreateCampaigns.s.sol --network $NETWORK --broadcast

# 生产环境跳过测试数据
if [ "$NETWORK" != "anvil" ]; then
    export SKIP_DATA_INIT=true
fi
forge script script/multi_deploy/Step5_InitializeData.s.sol --network $NETWORK --broadcast

echo "Deployment completed! Check deployments-$NETWORK.json"
```

使用方法：
```bash
chmod +x deploy_all.sh
./deploy_all.sh sepolia
```

## 📚 相关文档

- [原始部署脚本](../Deploy.s.sol) - 单步部署参考
- [接口文档](../../INTERFACE_DOCUMENTATION.md) - 详细的合约接口说明
- [测试指南](../../test/README.md) - 合约测试说明

## 🤝 支持

如果遇到问题：

1. 检查环境变量配置
2. 验证网络连接
3. 查看 Gas 费用是否充足
4. 检查合约地址是否正确
5. 查看 Foundry 日志输出

---

**⚠️ 注意事项：**
- 测试网部署前确保有足够的测试代币
- 生产环境部署时建议设置 `SKIP_DATA_INIT=true`
- 保存好配置文件，包含所有合约地址
- 私钥安全：不要在生产环境中使用示例私钥 