# CoinReal Background - 智能合约后端

## 📋 概述

CoinReal 后端是基于 Solidity 构建的去中心化内容社区平台智能合约系统。通过区块链技术和创新的Campaign奖励机制，实现"评论即收益、点赞即赚币"的商业模式。

## 🏗️ 项目结构

```
background/
├── src/                          # 智能合约源码
│   ├── CoinRealPlatform.sol     # 平台主合约
│   ├── Project.sol               # 项目合约（评论和点赞系统）
│   ├── ProjectFactory.sol        # 项目工厂合约
│   ├── Campaign.sol              # Campaign合约（奖励系统）
│   ├── CampaignFactory.sol       # Campaign工厂合约
│   ├── interfaces/              # 接口定义
│   │   ├── ICoinRealPlatform.sol
│   │   ├── IProject.sol
│   │   ├── IProjectFactory.sol
│   │   ├── ICampaign.sol
│   │   ├── ICampaignFactory.sol
│   │   └── IPriceOracle.sol
│   └── mocks/                   # 测试模拟合约
├── test/                        # 合约测试文件
├── script/                      # 部署脚本
├── INTERFACE_DOCUMENTATION.md   # 📚 详细接口文档
└── README.md                    # 项目说明
```

## 🚀 核心特性

### 💰 Campaign奖励机制
- **Project-Campaign分离**：项目专注评论点赞，Campaign管理奖励分配
- **独立CRT代币**：每个Campaign发行独立的CRT代币（"项目名-Campaign编号"）
- **评论奖励**：发表评论获得 5 CRT
- **点赞奖励**：点赞获得 1 CRT，被点赞者获得 1 CRT
- **奖池分配**：60% 评论奖励 + 25% 点赞奖励 + 15% 精英奖励
- **Soulbound特性**：CRT代币不可转移，代表真实贡献度

### 🎯 Campaign系统优势
- **灵活奖励**：任何人可创建Campaign，自定义奖励代币和金额
- **多Campaign并行**：一个项目可有多个活跃Campaign，用户同时获得奖励
- **时间控制**：Campaign有明确的开始和结束时间
- **智能延期**：无参与者时自动延长7天，避免资源浪费
- **平台管理**：奖励分配和时间延长由平台统一管理

### ⚡ 技术优势
- **最小代理模式**：节省 95% 项目和Campaign创建成本
- **批量操作**：优化 Gas 消耗和用户体验
- **模块化设计**：职责分离，便于升级维护
- **多代币支持**：价格预言机支持任意 ERC20 代币

## 📚 详细文档

### 🔗 快速导航
- **[完整接口文档](./INTERFACE_DOCUMENTATION.md)** - 详细的接口说明和使用指南
- **[测试文档](./test/README.md)** - 测试用例和测试指南
- **[部署指南](#部署指南)** - 合约部署和配置说明

### 🎯 核心接口概览

| 合约 | 职责 | 核心功能 |
|------|------|----------|
| **ICoinRealPlatform** | 平台管理 | 项目创建、Campaign管理、统计数据 |
| **IProject** | 项目管理 | 评论系统、点赞机制、Campaign关联 |
| **IProjectFactory** | 项目工厂 | 最小代理创建、地址预测 |
| **ICampaign** | 奖励管理 | CRT铸造、奖池分配、奖励领取 |
| **ICampaignFactory** | Campaign工厂 | Campaign创建、代币管理 |
| **IPriceOracle** | 价格服务 | USD价值计算、多代币支持 |

> 📖 详细的接口说明、参数定义、业务逻辑请查看 **[INTERFACE_DOCUMENTATION.md](./INTERFACE_DOCUMENTATION.md)**

## 🛠️ 快速开始

### 环境要求
- [Foundry](https://getfoundry.sh/) - Solidity 开发工具链
- Node.js 18+ - 用于脚本执行
- Git - 版本控制

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd background

# 安装 Foundry 依赖
forge install

# 验证安装
forge --version
```

### 编译合约
```bash
# 编译所有合约
forge build

# 查看合约大小
forge build --sizes
```

### 运行测试
```bash
# 运行所有测试
forge test

# 运行Campaign系统测试
forge test --match-contract CampaignSystemTest

# 详细输出
forge test -vvv

# 生成覆盖率报告
forge coverage
```

## 🚀 部署指南

### 本地部署
```bash
# 启动本地节点（新终端）
anvil

# 部署到本地网络
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast

# 查看部署结果
cat deployments.json
```

### 测试网部署
```bash
# 设置环境变量
export PRIVATE_KEY="your_private_key"
export RPC_URL="https://sepolia.infura.io/v3/your_key"

# 部署到 Sepolia
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

### 部署验证
部署成功后会生成 `deployments.json` 文件，包含所有合约地址：

```json
{
  "platform": "0x...",
  "priceOracle": "0x...",
  "projectFactory": "0x...",
  "campaignFactory": "0x...",
  "tokens": {
    "usdc": "0x...",
    "weth": "0x...",
    "dai": "0x..."
  },
  "projects": {
    "bitcoin": "0x...",
    "ethereum": "0x...",
    "solana": "0x..."
  },
  "campaigns": {
    "btc_campaign_1": "0x...",
    "btc_campaign_2": "0x...",
    "eth_campaign_1": "0x..."
  }
}
```

### 合约ABI生成
在 `background/abi-json` 文件夹下生成ABI文件：
```bash
forge inspect src/CoinRealPlatform.sol:CoinRealPlatform abi --json > abi-json/CoinRealPlatform.json
forge inspect src/Project.sol:Project abi --json > abi-json/Project.json
forge inspect src/ProjectFactory.sol:ProjectFactory abi --json > abi-json/ProjectFactory.json
forge inspect src/Campaign.sol:Campaign abi --json > abi-json/Campaign.json
forge inspect src/CampaignFactory.sol:CampaignFactory abi --json > abi-json/CampaignFactory.json
forge inspect src/mocks/MockPriceOracle.sol:MockPriceOracle abi --json > abi-json/MockPriceOracle.json
forge inspect src/mocks/MockERC20.sol:MockERC20 abi --json > abi-json/MockERC20.json
```

## 📊 Gas 成本优化

### 合约创建成本对比
| 方案 | Gas 消耗 | 成本节省 |
|------|----------|----------|
| 标准项目部署 | ~2,000,000 | - |
| Clone项目部署 | ~50,000 | **95%** |
| 标准Campaign部署 | ~1,500,000 | - |
| Clone Campaign部署 | ~40,000 | **97%** |

### 关键操作成本
| 操作 | 预估 Gas | 优化措施 |
|------|-----------|----------|
| 发表评论 | ~120,000 | 多Campaign并行铸造CRT |
| 点赞评论 | ~80,000 | 简单状态更新 |
| 创建Campaign | ~150,000 | 最小代理+代币转移 |
| 领取奖励 | ~50,000/token | 批量操作 |

## 🔒 安全机制

### 智能合约安全
- ✅ **重入攻击防护** - ReentrancyGuard
- ✅ **权限控制** - 关键函数权限验证
- ✅ **溢出检查** - Solidity 0.8+ 内置
- ✅ **安全转账** - SafeERC20 库

### 业务逻辑安全
- ✅ **防重复点赞** - mapping 记录
- ✅ **最低赞助限制** - 预言机价值验证
- ✅ **CRT 锁定** - Soulbound Token
- ✅ **Campaign权限** - 平台统一管理
- ✅ **时间控制** - 严格的活动时间验证

## 📈 项目状态

### 开发进度
- ✅ 核心合约开发完成
- ✅ Campaign系统重构完成
- ✅ 接口文档完整
- ✅ 测试覆盖充分
- ✅ 部署脚本就绪
- ⏳ 精英奖励算法开发中
- ⏳ 安全审计进行中
- ⏳ 主网部署准备中

### 技术栈
- **Solidity** ^0.8.19 - 智能合约语言
- **Foundry** - 开发和测试框架
- **OpenZeppelin** - 安全合约库
- **Chainlink** - 价格预言机（可选）

## 🎯 Campaign系统工作流程

### 1. 项目创建流程
1. **平台创建项目** → Project合约部署
2. **设置项目信息** → 名称、描述、分类等
3. **项目激活** → 开始接收评论和点赞

### 2. Campaign创建流程
1. **任何人创建Campaign** → 选择项目、设置奖励
2. **代币转移** → 奖励代币转入Campaign合约
3. **Campaign激活** → 开始铸造CRT奖励
4. **自动关联** → Campaign添加到Project的活跃列表

### 3. 用户参与流程
1. **发表评论** → 在所有活跃Campaign中获得5 CRT
2. **点赞互动** → 点赞者和被点赞者各获得1 CRT
3. **多Campaign累积** → 同时在多个Campaign中获得奖励
4. **等待分配** → Campaign结束时分配奖池奖励

### 4. 奖励分配流程
1. **Campaign结束** → 到达结束时间
2. **平台分配** → 按60%-25%-15%规则分配奖池
3. **用户领取** → 调用claimRewards领取奖励
4. **空Campaign延期** → 无参与者时自动延长7天

## 🤝 贡献指南

### 开发流程
1. Fork 项目并创建功能分支
2. 编写代码并添加相应测试
3. 运行完整测试套件确保通过
4. 提交 Pull Request 并描述变更

### 代码规范
- 遵循 Solidity 风格指南
- 添加详细的 NatSpec 注释
- 确保测试覆盖率 > 90%
- 通过安全检查工具验证

**🎯 下一步：查看 [详细接口文档](./INTERFACE_DOCUMENTATION.md) 了解完整的 Campaign 系统设计和使用方法！**
