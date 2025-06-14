# CoinReal - 币圈大众点评

> 首个让用户通过评论与点赞即可赚取加密货币奖励的去中心化内容社区

![CoinReal Logo](https://img.shields.io/badge/CoinReal-v1.0.0-blue.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ethereum](https://img.shields.io/badge/Ethereum-Compatible-627EEA)](https://ethereum.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v15-black)](https://nextjs.org/)
[![Foundry](https://img.shields.io/badge/Foundry-Framework-red)](https://book.getfoundry.sh/)

## 🎯 项目概述

### 产品定位
CoinReal 是一个创新的去中心化内容社区平台，通过区块链技术实现"评论即收益、点赞即赚币"的商业模式。用户可以在各大加密项目的讨论栏目中发表评论、点赞支持优质内容，并获得相应的代币奖励。

### 核心价值主张

#### 💬 评论即得收益
- 持有相应项目代币即可发布评论，自动获得 5 枚"评论Token"
- 评论被点赞后额外增发代币，优质内容获得更高回报
- 支持 AI 智能标签系统，提升内容发现和检索效率

#### 👍 点赞也能赚币
- 钱包资产 ≥ $100 USD 即可参与点赞并获得"点赞Token"
- 点赞者参与奖池分配，激励发现优质内容
- 采用时间加权机制，早期参与者享受额外收益

#### 🎁 动态奖池分配
- **基础奖励** (60%): 按Token数量平均分配
- **精英奖励** (25%): 专门奖励高质量精选评论
- **点赞奖励** (15%): 奖励积极参与点赞的用户

#### 🛡️ 链上防刷机制
- 基于 Chainlink 预言机的持币验证
- 资产门槛防止机器人刷票
- 内容哈希防重复，时间限制防滥用

## 🏗️ 技术架构

### 系统架构图

```mermaid
graph TB
    subgraph "前端层 (Web DApp)"
        A[Next.js 15 + TypeScript]
        B[shadcn/ui 组件库]
        C[Tailwind CSS]
        D[钱包连接 (WalletConnect)]
    end
    
    subgraph "区块链层 (Smart Contracts)"
        E[项目管理合约]
        F[评论系统合约]
        G[点赞系统合约]
        H[奖池管理合约]
        I[Token管理合约]
        J[预言机合约]
    end
    
    subgraph "外部服务"
        K[Chainlink Oracle]
        L[IPFS 存储]
        M[多链网络支持]
    end
    
    A --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    F --> L
    E --> M
```

### 技术栈

#### 前端 (Web DApp)
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React 19 内置状态
- **钱包集成**: WalletConnect, MetaMask
- **Web3**: ethers.js / wagmi

#### 后端 (Smart Contracts)
- **开发框架**: Foundry (Forge, Cast, Anvil)
- **编程语言**: Solidity ^0.8.19
- **安全库**: OpenZeppelin
- **预言机**: Chainlink Price Feeds
- **多链支持**: Ethereum, Polygon, BSC, Arbitrum
- **存储**: IPFS (去中心化存储)

#### 基础设施
- **测试网络**: Anvil (本地), Goerli, Mumbai
- **部署工具**: Forge Scripts
- **监控**: Tenderly, Etherscan
- **安全**: 多重签名钱包 (Gnosis Safe)

## 📁 项目结构

```
CoinReal/
├── web/                    # 前端 DApp
│   ├── app/               # Next.js App Router 页面
│   │   ├── page.tsx       # 首页 Landing Page
│   │   ├── projects/      # 项目相关页面
│   │   ├── user/          # 用户个人中心
│   │   └── leaderboard/   # 排行榜页面
│   ├── components/        # React 组件
│   │   ├── ui/           # 基础 UI 组件
│   │   ├── comment-section.tsx
│   │   ├── wallet-connection.tsx
│   │   └── project-layout.tsx
│   └── lib/              # 工具函数和配置
│
├── background/            # 后端智能合约
│   ├── src/              # Solidity 合约源码
│   │   ├── ProjectManager.sol
│   │   ├── CommentSystem.sol
│   │   ├── LikeSystem.sol
│   │   ├── RewardPool.sol
│   │   ├── TokenManager.sol
│   │   ├── PriceOracle.sol
│   │   └── AccessControl.sol
│   ├── test/             # 合约测试
│   ├── script/           # 部署脚本
│   └── lib/              # 外部依赖
│
└── docs/                 # 项目文档
    ├── API.md            # API 接口文档
    ├── DEPLOYMENT.md     # 部署指南
    └── SECURITY.md       # 安全说明
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Foundry
- Git

### 本地开发

#### 1. 克隆项目
```bash
git clone https://github.com/your-org/coinreal.git
cd coinreal
```

#### 2. 启动后端 (智能合约)
```bash
cd background

# 安装依赖
forge install

# 启动本地测试网
anvil

# 部署合约到本地网络
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast
```

#### 3. 启动前端
```bash
cd web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 开始使用 CoinReal！

## 🔗 核心功能

### 1. 项目管理
- **项目注册**: 项目方可注册自己的加密项目栏目
- **信息管理**: 更新项目描述、官网、白皮书等信息
- **状态控制**: 管理项目的活跃状态和生命周期

### 2. 评论系统
- **智能评论**: 基于持币验证的评论发布机制
- **内容审核**: AI 辅助的内容质量评估和标签系统
- **奖励发放**: 自动发放评论Token和点赞奖励

### 3. 点赞机制
- **资产验证**: 基于 Chainlink 的实时资产价值验证
- **防刷保护**: 时间限制和资产门槛防止恶意刷票
- **奖励分配**: 公平透明的点赞奖励分配机制

### 4. 奖池系统
- **动态奖池**: 项目方设置，社区参与的奖励池
- **智能分配**: 基于贡献度和时间加权的奖励算法
- **实时结算**: 自动化的奖励计算和分发

### 5. 代币经济
- **双Token模型**: 评论Token + 点赞Token
- **通胀控制**: 科学的Token发放和回收机制
- **价值锚定**: 与项目贡献度直接关联的Token价值

## 🛡️ 安全特性

### 智能合约安全
- **代码审计**: 专业安全公司审计
- **多重签名**: 关键操作需要多重签名
- **升级机制**: 支持安全的合约升级
- **紧急暂停**: 遇到问题可紧急暂停系统

### 防刷机制
- **持币验证**: 基于区块链的真实持币验证
- **资产门槛**: 防止低成本批量账户攻击
- **内容哈希**: 确保内容唯一性和完整性
- **时间限制**: 防止高频操作和刷票行为

### 隐私保护
- **匿名评论**: 支持匿名发表观点
- **数据加密**: 敏感信息端到端加密
- **去中心化**: 数据存储在 IPFS 和区块链上

## 🌟 创新亮点

### 1. 首创评论挖矿模式
- 传统社区只能"消费"内容，CoinReal 让用户"生产"并获得收益
- 彻底改变内容创作者的激励模式

### 2. AI + 区块链融合
- AI 自动内容标签和质量评估
- 区块链确保奖励分配透明公正

### 3. 多链生态支持
- 支持主流公链和 Layer 2 解决方案
- 跨链资产验证和奖励分发

### 4. 社区治理机制
- 基于贡献度的治理代币分配
- 社区自主决定平台发展方向

## 📊 商业模式

### 收入来源
1. **平台服务费**: 奖池创建和管理服务费 (2-5%)
2. **广告收入**: 项目方推广和置顶服务
3. **NFT 销售**: 社区贡献者专属 NFT
4. **治理代币**: 平台治理代币的价值捕获

### 成本结构
1. **开发成本**: 智能合约开发和安全审计
2. **运营成本**: 服务器、域名、监控服务
3. **Gas 费用**: 部分交易的 Gas 费补贴
4. **营销推广**: 社区建设和用户获取

## 🗺️ 发展路线图

### Q1 2024: MVP 上线
- [x] 核心智能合约开发完成
- [x] 前端 DApp 基础功能实现
- [ ] 测试网部署和社区测试
- [ ] 安全审计和漏洞修复

### Q2 2024: 主网启动
- [ ] 主网合约部署 (Ethereum, Polygon)
- [ ] 首批项目方入驻
- [ ] 用户增长和社区建设
- [ ] 功能优化和用户体验提升

### Q3 2024: 生态扩展
- [ ] 支持更多公链 (BSC, Arbitrum)
- [ ] AI 内容分析功能上线
- [ ] 移动端 App 发布
- [ ] 合作伙伴生态建设

### Q4 2024: 治理升级
- [ ] 治理代币发行
- [ ] DAO 治理机制启动
- [ ] 跨链桥和多资产支持
- [ ] 国际化和多语言支持

## 👥 团队介绍

### 核心团队
- **技术负责人**: 10+ 年区块链开发经验
- **产品经理**: 前大厂产品专家，深耕社区产品
- **智能合约工程师**: 专业 Solidity 开发，多个 DeFi 项目经验
- **前端工程师**: React/Next.js 专家，Web3 集成经验丰富

### 顾问团队
- **行业专家**: 知名加密项目创始人
- **技术顾问**: 以太坊生态核心开发者
- **投资顾问**: 头部 VC 合伙人

## 🤝 贡献指南

我们欢迎社区贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

### 参与方式
- 🐛 **Bug 报告**: 在 Issues 中报告发现的问题
- 💡 **功能建议**: 提出新功能和改进建议
- 🔧 **代码贡献**: 提交 Pull Request 改进代码
- 📖 **文档完善**: 帮助完善项目文档
- 🌍 **国际化**: 帮助翻译成多语言版本

## 📄 许可证

本项目采用 MIT 许可证。查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **官网**: https://coinreal.xyz
- **邮箱**: team@coinreal.xyz
- **Discord**: https://discord.gg/coinreal
- **Twitter**: https://twitter.com/coinreal_xyz
- **Telegram**: https://t.me/coinreal_community

## 🔗 相关链接

- [产品白皮书](https://docs.coinreal.xyz/whitepaper)
- [技术文档](https://docs.coinreal.xyz/technical)
- [API 文档](https://docs.coinreal.xyz/api)
- [安全报告](https://docs.coinreal.xyz/security)
- [社区治理](https://gov.coinreal.xyz)

---

**免责声明**: CoinReal 是一个实验性项目，智能合约和代币经济模型仍在不断完善中。请在参与前仔细阅读相关风险提示，并根据自身情况谨慎决策。

**Built with ❤️ by CoinReal Team** 