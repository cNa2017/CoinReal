# CoinReal 多步部署系统

## 📋 概述

为解决公链部署时的 Gas 限制、合约大小限制等问题，将原本的单步部署拆分为5个独立步骤，支持多网络自动化部署。

## 🚀 快速开始

### 1. 环境配置

```bash
# 在 .env 文件中配置环境变量
ANVIL_URL=http://localhost:8545
ANVIL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_KEY
SEPOLIA_PRIVATE_KEY=YOUR_PRIVATE_KEY
```

### 2. 一键部署

```bash
# 本地测试网络
./deploy_all.sh anvil

# Sepolia 测试网
./deploy_all.sh sepolia

# Avalanche Fuji 测试网
./deploy_all.sh avalanche_fuji
```

### 3. 验证部署

```bash
export NETWORK=anvil
source .env
RPC_URL=${anvil_url}
PRIVATE_KEY=${anvil_private_key}
forge script script/multi_deploy/utils/VerifyDeployment.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY"
```

## 📁 文件结构

```
script/multi_deploy/
├── README.md                    # 本文件
├── Step1_DeployCore.s.sol      # 步骤1: 部署核心合约
├── Step2_DeployTokens.s.sol    # 步骤2: 部署测试代币
├── Step3_CreateProjects.s.sol  # 步骤3: 创建示例项目
├── Step4_CreateCampaigns.s.sol # 步骤4: 创建Campaign
├── Step5_InitializeData.s.sol  # 步骤5: 初始化测试数据
├── config/
│   └── projects-data.json      # 项目数据配置
└── utils/
    ├── BaseMultiDeploy.sol     # 基础部署合约
    └── VerifyDeployment.s.sol  # 部署验证脚本
```

## 🔧 部署步骤

| 步骤 | 脚本 | 功能 | Gas 估算 |
|------|------|------|----------|
| 1 | Step1_DeployCore | 部署6个核心合约 | ~8M |
| 2 | Step2_DeployTokens | 部署5个测试代币 | ~2M |
| 3 | Step3_CreateProjects | 创建9个示例项目 | ~1.5M |
| 4 | Step4_CreateCampaigns | 创建11个Campaign | ~2.5M |
| 5 | Step5_InitializeData | 初始化测试数据（可选） | ~1M |

## 🌐 支持网络

- **anvil**: 本地测试网络
- **sepolia**: Ethereum 测试网
- **avalanche_fuji**: Avalanche Fuji 测试网

## 📄 配置文件

每个网络的部署信息保存在 `deployments-{network}.json`：

```json
{
  "network": "anvil",
  "timestamp": "1750771331",
  "platform": "0x...",
  "tokens": { "usdc": "0x...", "weth": "0x..." },
  "projects": { "btc": { "address": "0x..." } }
}
```

## 🛠️ 手动部署

如需单独执行某个步骤：

```bash
export NETWORK=sepolia
source .env
RPC_URL=${sepolia_url}
PRIVATE_KEY=${sepolia_private_key}

# 步骤1: 部署核心合约
forge script script/multi_deploy/Step1_DeployCore.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast

# 步骤2: 部署代币
forge script script/multi_deploy/Step2_DeployTokens.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast

# 其他步骤...
```

## 🔍 故障排除

### 常见问题

1. **环境变量未设置**: 检查 `.env` 文件
2. **Gas 不足**: 确保账户有足够 ETH
3. **合约已部署**: 删除配置文件重新部署
4. **网络连接失败**: 检查 RPC URL

### 重新部署

```bash
# 删除配置文件
rm deployments-$NETWORK.json

# 或删除特定部分（手动编辑JSON）
```

## 📚 详细文档

- [完整部署指南](../DEPLOYMENT_GUIDE.md)
- [原始部署脚本](../Deploy.s.sol)
- [接口文档](../../INTERFACE_DOCUMENTATION.md)

## 🎯 特性

- ✅ 支持多网络部署
- ✅ 自动化配置管理
- ✅ Gas 成本优化
- ✅ 错误处理和验证
- ✅ 生产环境适配
- ✅ 一键部署脚本