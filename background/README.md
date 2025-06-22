# CoinReal Background - 智能合约后端

## 📋 概述

CoinReal 后端是基于 Solidity 构建的去中心化内容社区平台智能合约系统。通过区块链技术实现"评论即收益、点赞即赚币"的创新商业模式。

## 🏗️ 项目结构

```
background/
├── src/                          # 智能合约源码
│   ├── CoinRealPlatform.sol     # 平台主合约
│   ├── Project.sol               # 项目合约
│   ├── ProjectFactory.sol        # 项目工厂合约
│   ├── CRTToken.sol             # CRT代币合约
│   ├── interfaces/              # 接口定义
│   │   ├── ICoinRealPlatform.sol
│   │   ├── IProject.sol
│   │   ├── IProjectFactory.sol
│   │   └── IPriceOracle.sol
│   └── mocks/                   # 测试模拟合约
├── test/                        # 合约测试文件
├── script/                      # 部署脚本
├── INTERFACE_DOCUMENTATION.md   # 📚 详细接口文档
└── README.md                    # 项目说明
```

## 🚀 核心特性

### 💰 代币经济模型
- **CRT代币**：Soulbound Token，不可转让，代表用户贡献度
- **评论奖励**：发表评论获得 5 CRT
- **点赞奖励**：点赞获得 1 CRT，被点赞者获得 1 CRT
- **奖池分配**：60% 评论奖励 + 25% 点赞奖励 + 15% 精英奖励

### ⚡ 技术优势
- **最小代理模式**：节省 95% 项目创建成本
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
| **ICoinRealPlatform** | 平台管理 | 项目创建、统计数据、排行榜 |
| **IProject** | 项目管理 | 评论系统、点赞机制、奖池分配 |
| **IProjectFactory** | 工厂模式 | 最小代理创建、地址预测 |
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

# 运行特定测试
forge test --match-contract DeployTest

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
  "crtToken": "0x...",
  "priceOracle": "0x...",
  "projectFactory": "0x...",
  "tokens": {
    "usdc": "0x...",
    "weth": "0x...",
    "dai": "0x..."
  },
  "projects": {
    "bitcoin": "0x...",
    "ethereum": "0x...",
    "solana": "0x..."
  }
}
```

## 📊 Gas 成本优化

### 项目创建成本对比
| 方案 | Gas 消耗 | 成本节省 |
|------|----------|----------|
| 标准部署 | ~2,000,000 | - |
| Clone 模式 | ~50,000 | **95%** |

### 关键操作成本
| 操作 | 预估 Gas | 优化措施 |
|------|-----------|----------|
| 发表评论 | ~80,000 | 事件存储内容 |
| 点赞评论 | ~50,000 | 简单状态更新 |
| 赞助项目 | ~100,000 | ERC20转账+记录 |
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
- ✅ **开奖条件** - 参与度验证

## 🧪 测试覆盖

### 测试类型
- **单元测试** - 各合约功能测试
- **集成测试** - 合约间交互测试
- **端到端测试** - 完整业务流程测试
- **Gas 优化测试** - 成本效益验证

### 运行测试套件
```bash
# 运行推荐的简化测试
forge test --match-contract DeployScriptTest -v

# 运行高级交互测试
forge test --match-contract AdvancedInteractionTest -vvv

# 运行完整工作流测试
forge test --match-test test_CompleteWorkflow -vvv
```

## 📈 项目状态

### 开发进度
- ✅ 核心合约开发完成
- ✅ 接口文档完整
- ✅ 测试覆盖充分
- ✅ 部署脚本就绪
- ⏳ 安全审计进行中
- ⏳ 主网部署准备中

### 技术栈
- **Solidity** ^0.8.19 - 智能合约语言
- **Foundry** - 开发和测试框架
- **OpenZeppelin** - 安全合约库
- **Chainlink** - 价格预言机（可选）

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

## 📞 技术支持

如果您在使用过程中遇到问题，请：

1. 查看 **[详细接口文档](./INTERFACE_DOCUMENTATION.md)**
2. 查看 **[测试文档](./test/README.md)**
3. 提交 GitHub Issue
4. 联系开发团队

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../LICENSE) 文件。

---

**🎯 下一步：查看 [详细接口文档](./INTERFACE_DOCUMENTATION.md) 了解完整的 API 设计和使用方法！**
