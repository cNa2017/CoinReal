# CoinReal Web Application

币圈大众点评 - 首个让用户通过评论与点赞即可赚取加密货币奖励的去中心化内容社区

## 📁 项目结构

```
frontend/
├── app/                    # Next.js App Router 页面
│   ├── create-project/     # 创建项目页面
│   ├── docs/              # 帮助文档页面
│   ├── leaderboard/       # 排行榜页面
│   ├── pools/             # 奖池页面
│   ├── projects/          # 项目列表和详情页面
│   │   └── [id]/          # 动态项目详情页
│   ├── project-admin/     # 项目管理页面
│   ├── user/              # 用户中心页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/             # 可复用组件
│   ├── ui/                # UI 组件库 (shadcn/ui)
│   ├── comment-section.tsx # 评论区组件
│   ├── navigation.tsx     # 导航组件
│   ├── network-status.tsx # 网络状态组件 ✨
│   ├── project-info.tsx   # 项目信息组件
│   ├── project-layout.tsx # 项目布局组件
│   ├── providers.tsx      # 应用级 Providers
│   ├── sponsor-dialog.tsx # 赞助对话框
│   ├── table.tsx          # 表格组件
│   └── wallet-status.tsx  # 钱包状态组件 ✨
├── hooks/                  # 自定义 React Hooks
│   ├── use-contract-api.ts # 合约API Hook ✨
│   ├── use-project.ts     # 项目相关操作
│   └── use-wallet.ts      # 钱包相关操作 ✨
├── lib/                   # 工具库和配置
│   ├── contract-api.ts    # 基础合约API实现 ✨
│   ├── wagmi-contract-api.ts # Wagmi合约API实现 ✨
│   ├── wagmi-provider.tsx # Wagmi Provider ✨
│   ├── wagmi.ts           # Wagmi 配置 ✨
│   ├── mock-data.ts       # 模拟数据
│   └── utils.ts           # 通用工具函数
├── config/                # 配置文件 ✨
│   └── networks.ts        # 网络配置
├── constants/             # 常量定义
│   └── chains.ts          # 区块链配置 ✨
├── types/                 # TypeScript 类型定义
│   └── index.ts           # 全局类型 (已增强)
├── utils/                 # 业务工具函数
│   ├── contract-helpers.ts # 合约数据转换工具 ✨
│   └── format.ts          # 格式化函数
├── public/                # 静态资源
│   ├── abi-json/          # 合约ABI文件 ✨
│   │   ├── CoinRealPlatform.json
│   │   ├── Project.json
│   │   ├── CRTToken.json
│   │   └── *.json
│   ├── deployments.json   # 合约部署信息 ✨
│   └── ...
└── package.json           # 项目依赖

✨ = 合约集成后新增或重大修改的文件
```

## 🚀 技术栈

### 前端框架
- **Next.js 15.2.4** - React 框架 (App Router)
- **React 19.0.0** - UI 库
- **TypeScript 5** - 类型支持
- **Tailwind CSS 4.0** - 样式框架

### Web3 技术栈 ✨
- **Wagmi 2.15.6** - React Hooks for Ethereum
- **Viem 2.x** - 低级 Ethereum 库
- **@tanstack/react-query 5.81.2** - 异步状态管理

### UI 组件库
- **@radix-ui/*** - 无障碍组件原语
- **shadcn/ui** - 组件系统
- **lucide-react** - 图标库
- **class-variance-authority** - 样式变体管理

### 开发工具
- **ESLint 9** - 代码检查
- **pnpm** - 包管理器

## 🔗 智能合约集成

### 合约架构
项目集成了完整的智能合约系统：

- **CoinRealPlatform** - 平台主合约
- **Project** - 项目合约（每个项目一个实例）
- **CRTToken** - 平台代币合约
- **ProjectFactory** - 项目工厂合约
- **MockPriceOracle** - 价格预言机合约

### 网络架构 ✨
- **合约网络** - 固定配置，所有合约交互的目标网络 (当前: Anvil 本地网络)
- **钱包网络** - 用户钱包连接的网络，影响余额查询和写操作权限
- **网络匹配** - 写入合约操作需要钱包网络与合约网络一致

### 数据流转
```
智能合约 → Wagmi读取 → 数据转换层 → 前端组件显示
用户操作 → 前端组件 → Wagmi写入 → 智能合约
```

## 📦 依赖管理

项目使用 pnpm 进行依赖管理，主要依赖包括：

### 核心依赖
```json
{
  "next": "15.2.4",
  "react": "^19.0.0",
  "typescript": "^5",
  "wagmi": "^2.15.6",
  "viem": "2.x",
  "@tanstack/react-query": "^5.81.2"
}
```

### UI 组件依赖
```json
{
  "@radix-ui/react-*": "^1.x",
  "lucide-react": "^0.513.0",
  "tailwindcss": "^4",
  "class-variance-authority": "^0.7.1"
}
```

## 🛠️ 开发规范

### 文件命名
- 组件文件：`kebab-case.tsx` (如 `wallet-status.tsx`)
- Hook 文件：`use-*.ts` (如 `use-contract-api.ts`)
- 配置文件：`kebab-case.ts` (如 `networks.ts`)
- 类型文件：`index.ts`

### 代码组织
- **合约集成层** (`lib/wagmi-contract-api.ts`)
- **状态管理层** (`hooks/use-*.ts`)
- **组件表现层** (`components/*.tsx`)
- **类型定义层** (`types/index.ts`)
- **配置管理层** (`config/*.ts`)

### 组件设计原则
- TypeScript 严格模式
- 合约状态与 UI 状态分离
- 错误边界和加载状态处理
- 响应式设计优先

## 🌐 网络配置

### 网络配置 ✨
```typescript
// 合约网络配置 (config/networks.ts) - 开发者控制
export const CONTRACT_NETWORK = anvil // 当前: 本地开发
// export const CONTRACT_NETWORK = sepolia // 可切换到: 测试网

// 钱包支持的网络 - 用户可选择连接
const SUPPORTED_WALLET_CHAINS = [
  { id: 31337, name: "Anvil 本地网络", symbol: "ETH" },
  { id: 11155111, name: "Sepolia 测试网", symbol: "ETH" },  
  { id: 1, name: "以太坊主网", symbol: "ETH" },
  { id: 137, name: "Polygon", symbol: "MATIC" },
  { id: 56, name: "BSC", symbol: "BNB" },
  { id: 42161, name: "Arbitrum", symbol: "ARB" }
]
```

### 网络管理 ✨
- **合约网络**: 通过配置文件固定设置，开发者控制
- **钱包网络**: 用户可切换，影响个人资产信息和写操作权限  
- **网络检测**: 自动检测钱包网络是否匹配合约网络
- **切换提示**: 引导用户切换钱包网络以启用写操作

## 📖 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+
- Git

### 安装和启动

```bash
# 克隆项目
git clone <repo-url>
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 合约环境设置 ✨

1. **启动本地区块链**
```bash
# 在项目根目录
cd background
anvil
```

2. **部署合约**
```bash
# 后端导出abi
forge inspect src/CoinRealPlatform.sol:CoinRealPlatform abi --json > abi-json/CoinRealPlatform.json
forge inspect src/Project.sol:Project abi --json > abi-json/Project.json
forge inspect src/ProjectFactory.sol:ProjectFactory abi --json > abi-json/ProjectFactory.json
forge inspect src/CRTToken.sol:CRTToken abi --json > abi-json/CRTToken.json
forge inspect src/mocks/MockPriceOracle.sol:MockPriceOracle abi --json > abi-json/MockPriceOracle.json
forge inspect src/mocks/MockERC20.sol:MockERC20 abi --json > abi-json/MockERC20.json

# anvil部署
forge script script/Deploy.s.sol --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --rpc-url http://localhost:8545 --broadcast

# 复制部署abi和部署地址
cp background/abi-json/*.json frontend/public/abi-json/
cp background/deployments.json frontend/public/deployments.json

```


### 开发命令
```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
```

## 🔧 配置说明

### Wagmi 配置 ✨
```typescript
// lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { anvil, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const contractConfig = createConfig({
  chains: [anvil, sepolia],
  connectors: [injected()],
  transports: {
    [anvil.id]: http(),
    [sepolia.id]: http()
  }
})
```

### 网络匹配检测 ✨
```typescript
// 检测钱包网络是否匹配合约网络
const { isOnContractNetwork, switchNetwork } = useContractApi()

if (!isOnContractNetwork) {
  // 提示用户切换钱包网络以匹配合约网络，启用写操作
}
```

## 🎯 核心功能

### 🔐 钱包连接 ✨
- **支持的钱包**: MetaMask, WalletConnect, Coinbase Wallet
- **网络管理**: 钱包网络切换，影响个人资产和写操作权限
- **状态管理**: 连接状态、余额查询、地址管理

### 📊 智能合约交互 ✨
- **读取操作**: 项目列表、评论数据、用户统计 (总是从合约网络读取)
- **写入操作**: 发表评论、点赞、创建项目、赞助 (需要钱包网络匹配合约网络)
- **实时同步**: 合约状态与前端UI自动同步

### 💬 评论系统
- **链上存储**: 所有评论数据存储在区块链
- **CRT奖励**: 评论和点赞自动获得代币奖励
- **Elite评论**: 高质量评论获得额外奖励

### 🏆 奖池管理
- **实时池值**: 显示各项目奖池USD价值
- **分配逻辑**: 智能合约自动分配奖励
- **透明机制**: 所有奖励分配链上可查

### 👤 用户系统
- **Web3身份**: 基于钱包地址的用户身份
- **资产统计**: CRT代币余额和奖励历史
- **活动记录**: 评论、点赞、赞助历史

## 🔍 API 架构

### 合约API层 ✨
```typescript
// 两种实现方式
import { api } from '@/lib/wagmi-contract-api'    // Wagmi实现
import { api } from '@/lib/contract-api'          // 基础实现

// 统一接口
const projects = await api.getProjects()
const comment = await api.postComment(projectId, content)
```

### 数据转换层 ✨
```typescript
// 合约数据 → 前端数据
const frontendProject = convertContractProjectToFrontend(contractData)

// 精度处理
const poolValue = Math.floor(contractData.poolValueUSD / 1000000) // 8位小数→美分
const crtAmount = parseInt(formatUnits(contractData.crtReward, 18)) // 18位小数→整数
```

## 📱 响应式设计

- **移动优先**: 从小屏幕开始设计
- **断点系统**: sm, md, lg, xl, 2xl
- **组件适配**: 所有组件支持多设备
- **交互优化**: 触摸友好的操作界面

## 🔍 项目特色

### 技术创新 ✨
- **真实合约集成**: 与区块链智能合约完全集成
- **类型安全**: 完整的 TypeScript 支持
- **数据一致性**: 合约数据与前端UI实时同步
- **错误处理**: 完善的合约调用错误处理机制
- **性能优化**: React Query 缓存 + 批量合约调用

### 用户体验
- **一键连接**: 简化的钱包连接流程
- **网络检测**: 自动检测和提示网络切换
- **实时反馈**: 交易状态实时更新
- **离线支持**: 读取操作支持离线缓存

### 开发体验
- **双模式支持**: Mock数据 + 真实合约无缝切换
- **类型完整**: 合约到前端的完整类型定义
- **配置灵活**: 支持多网络和多环境配置
- **调试友好**: 详细的日志和错误信息

## 🛡️ 安全考量

### 前端安全
- **输入验证**: 所有用户输入严格验证
- **XSS防护**: 内容渲染安全处理
- **CSRF保护**: 基于区块链签名的身份验证

### 合约安全
- **权限控制**: 基于持币门槛的操作权限
- **防刷机制**: 合约层面的防刷逻辑
- **资产安全**: 用户资产完全自主控制

## 📚 学习资源

### 官方文档
- [Next.js App Router](https://nextjs.org/docs/app)
- [Wagmi React Hooks](https://wagmi.sh/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)

### 项目文档
- [合约接口文档](./interface.md)
- [合约集成指南](./CONTRACT_INTEGRATION.md)
- [术语映射文档](./TERMINOLOGY_MAPPING.md)

## 🚀 未来规划

### 技术升级
- [ ] 多链扩展 (Polygon, BSC, Arbitrum)
- [ ] Layer 2 解决方案集成
- [ ] 链上治理系统
- [ ] NFT 奖励系统

### 功能扩展
- [ ] 移动端 PWA 应用
- [ ] 社交功能增强
- [ ] AI 驱动的内容推荐
- [ ] 跨链资产桥接

### 性能优化
- [ ] GraphQL 集成
- [ ] 服务端渲染优化
- [ ] 图片和资源优化
- [ ] 缓存策略优化

---

## 📞 联系我们

- **GitHub**: [项目仓库](https://github.com/your-org/coinreal)
- **Discord**: [社区频道](https://discord.gg/coinreal)
- **Email**: contact@coinreal.io

---

