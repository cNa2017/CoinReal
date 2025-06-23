# CoinReal Web Application

币圈大众点评 - 首个通过创新Campaign奖励机制实现"评论即收益、点赞即赚币"的去中心化内容社区

## 🎯 核心特性

### 💰 Campaign奖励机制
- **Project-Campaign分离**：项目专注评论点赞系统，Campaign管理奖励分配
- **独立CRT代币**：每个Campaign发行独立的CRT代币（"项目名-Campaign编号"）
- **评论奖励**：发表评论在所有活跃Campaign中获得5个CRT
- **点赞奖励**：点赞者和被点赞者各获得1个CRT
- **奖池分配**：60%评论奖励 + 25%点赞奖励 + 15%精英奖励
- **Soulbound特性**：CRT代币不可转移，代表真实贡献度

### 🚀 Campaign系统优势
- **灵活奖励**：任何人可创建Campaign，自定义奖励代币和金额
- **多Campaign并行**：一个项目可有多个活跃Campaign，用户同时获得奖励
- **时间控制**：Campaign有明确的开始和结束时间
- **智能延期**：无参与者时自动延长7天，避免资源浪费
- **最小代理模式**：节省95%+部署成本

## 📁 项目结构

```
frontend/
├── app/                    # Next.js App Router 页面
│   ├── create-project/     # 创建项目页面
│   ├── docs/              # 帮助文档页面
│   ├── leaderboard/       # 排行榜页面
│   ├── pools/             # Campaign奖池页面 ✨
│   ├── projects/          # 项目列表和详情页面
│   │   └── [id]/          # 动态项目详情页
│   ├── project-admin/     # 项目管理页面
│   ├── user/              # 用户中心页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/             # 可复用组件
│   ├── ui/                # UI 组件库 (shadcn/ui)
│   ├── campaign-list.tsx  # Campaign列表组件 ✨
│   ├── comment-section.tsx # 评论区组件
│   ├── navigation.tsx     # 导航组件
│   ├── network-status.tsx # 网络状态组件 ✨
│   ├── project-info.tsx   # 项目信息组件
│   ├── project-layout.tsx # 项目布局组件
│   ├── providers.tsx      # 应用级 Providers
│   ├── sponsor-dialog.tsx # Campaign创建对话框 ✨
│   ├── table.tsx          # 表格组件
│   ├── wagmi-sync-provider.tsx # Wagmi同步Provider ✨
│   └── wallet-status.tsx  # 钱包状态组件 ✨
├── hooks/                  # 自定义 React Hooks
│   ├── use-contract-api.ts # 合约API Hook ✨
│   ├── use-project.ts     # 项目相关操作
│   ├── use-wagmi-sync.ts  # Wagmi同步Hook ✨
│   └── use-wallet.ts      # 钱包相关操作 ✨
├── lib/                   # 工具库和配置
│   ├── contract-api.ts    # 基础合约API实现 ✨
│   ├── wagmi-contract-api.ts # Wagmi合约API实现 ✨
│   ├── wagmi-provider.tsx # Wagmi Provider ✨
│   ├── wagmi.ts           # Wagmi 配置 ✨
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
│   │   ├── Campaign.json ✨
│   │   ├── CampaignFactory.json ✨
│   │   ├── ProjectFactory.json ✨
│   │   ├── MockPriceOracle.json
│   │   └── MockERC20.json
│   ├── deployments.json   # 合约部署信息 ✨
│   └── ...
└── package.json           # 项目依赖

✨ = Campaign系统集成后新增或重大修改的文件
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

### Campaign系统架构 ✨
项目集成了完整的Campaign奖励系统：

- **CoinRealPlatform** - 平台主合约，管理项目和Campaign
- **Project** - 项目合约（评论和点赞系统）
- **ProjectFactory** - 项目工厂合约（最小代理模式）
- **Campaign** - Campaign合约（独立CRT代币 + 奖励分配）
- **CampaignFactory** - Campaign工厂合约（最小代理模式）
- **MockPriceOracle** - 价格预言机合约
- **MockERC20** - 测试代币合约

### Campaign工作流程 ✨
```
1. 项目创建 → Project合约部署 → 开始接收评论和点赞
2. Campaign创建 → Campaign合约部署 → 开始铸造CRT奖励
3. 用户参与 → 评论/点赞 → 在所有活跃Campaign中获得CRT
4. Campaign结束 → 奖励分配 → 用户领取真实代币奖励
```

### 奖励机制 ✨
- **评论奖励**：5 CRT（在所有活跃Campaign中）
- **点赞奖励**：点赞者和被点赞者各获得1 CRT
- **奖池分配**：
  - 60% 按CRT占比分配给所有参与者
  - 25% 按点赞CRT占比分配给点赞活跃用户
  - 15% 精英奖励（平分给获得CRT最多的评论者）

### 技术优势 ✨
- **最小代理模式**：节省95%+部署成本
- **Soulbound CRT**：代币不可转移，代表真实贡献
- **多Campaign并行**：用户可同时在多个Campaign中获得奖励
- **自动延期机制**：避免无效Campaign浪费资源

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

### Campaign系统集成 ✨
- **Campaign列表**：展示项目的所有活跃Campaign
- **CRT余额显示**：用户在各Campaign中的CRT代币余额
- **奖励领取**：Campaign结束后的奖励领取功能
- **Campaign创建**：任何人可为项目创建新Campaign

### 数据转换层 ✨
- **CRT精度转换**：18位小数 → 整数显示
- **奖池价值计算**：通过价格预言机计算USD价值
- **时间处理**：Unix时间戳 → 剩余时间显示
- **地址格式化**：完整地址 → 缩短显示

## 🎯 部署指南

### 本地开发环境
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 合约网络配置
```typescript
// config/networks.ts
export const CONTRACT_NETWORK = anvil // 当前：本地开发网络
// export const CONTRACT_NETWORK = sepolia // 可切换到：测试网
```

### 环境变量
```env
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_NETWORK=anvil
```

## 🔄 数据流架构

### 读取操作流程
```
用户请求 → useContractApi Hook → Wagmi readContract → 合约调用 → 数据转换 → 前端显示
```

### 写入操作流程
```
用户操作 → 权限检查 → Wagmi writeContract → 钱包确认 → 交易发送 → 状态更新 → UI刷新
```

### Campaign状态同步
```
Campaign事件 → Wagmi事件监听 → React Query缓存更新 → 组件状态刷新
```

## 🌐 网络架构与维护

### 双配置系统架构 ✨
项目采用双Wagmi配置架构，实现职责分离：

```typescript
// lib/wagmi.ts
export const contractConfig = createConfig({
  chains: [CONTRACT_NETWORK],           // 固定单一网络
  connectors: [injected()],
  transports: { [CONTRACT_NETWORK.id]: http() }
})

export const userConfig = createConfig({
  chains: [mainnet, sepolia, anvil],    // 支持多网络
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [anvil.id]: http()
  }
})
```

### 配置使用场景
| 操作类型 | 使用配置 | 说明 |
|----------|----------|------|
| **合约读写操作** | `contractConfig` | 固定使用`CONTRACT_NETWORK`，确保合约交互稳定 |
| **钱包连接** | `userConfig` | 支持多网络，跟随用户钱包网络 |
| **余额查询** | `userConfig` | 获取用户在各网络的代币余额 |
| **网络切换** | `userConfig` | 用户可以在支持的网络间切换 |

### 网络配置维护

#### 1. 修改合约部署网络
```typescript
// config/networks.ts
export const CONTRACT_NETWORK = sepolia // 从 anvil 切换到 sepolia
```
**影响范围：**
- 所有合约读写操作自动切换到新网络
- 需要更新部署配置文件和重新部署合约

#### 2. 添加新的支持网络
```typescript
// constants/chains.ts - 添加新网络到支持列表
export const SUPPORTED_CHAINS: SupportedChain[] = [
  // ... 现有网络
  {
    id: newChain.id,
    name: "新网络名称",
    symbol: "TOKEN",
    color: "bg-green-500",
    chain: newChain,
  },
]

// lib/wagmi.ts - 更新userConfig
export const userConfig = createConfig({
  chains: [mainnet, sepolia, anvil, newChain], // 添加新链
  transports: {
    // ... 现有传输配置
    [newChain.id]: http(), // 添加新链的RPC配置
  },
})
```

### 新接口开发指南

#### 接口类型判断决策树
```
新接口需求
├── 是否需要合约交互？
│   ├── 是 → 合约读写操作都使用 contractConfig
│   └── 否 → 使用 userConfig 获取用户信息
```

#### 接口开发模板
```typescript
// 合约交互接口（读写操作都使用contractConfig）
async function newContractMethod(params: any) {
  await ensureInitialized()
  
  // 读操作
  const result = await readContract(contractConfig, {
    address: deploymentsInfo.platform,
    abi: CoinRealPlatformABI,
    functionName: 'yourFunction',
    args: [params]
  })
  
  // 写操作（使用重试机制）
  const hash = await writeContractWithRetry({
    address: deploymentsInfo.platform,
    abi: CoinRealPlatformABI,
    functionName: 'yourFunction',
    args: [params]
  })
  
  return result
}

// 用户信息接口（使用userConfig）
function useUserBalance() {
  const { address } = useAccount() // 自动使用userConfig
  const chainId = useChainId()     // 获取用户当前网络
  
  const { data: balance } = useBalance({
    address,
    chainId
  })
  
  return balance
}
```

### 状态同步机制 ✨
项目实现了完整的状态同步机制，解决了页面刷新后的连接器错误：

#### 核心组件
- **`useWagmiSync`** - 连接状态同步Hook，确保连接完全就绪
- **`WagmiSyncProvider`** - 应用级同步Provider
- **`writeContractWithRetry`** - 带重试机制的写合约函数

#### 解决的问题
- 页面刷新后连接器状态不一致
- `getChainId is not a function`错误
- React SSR水合问题
- 双配置架构同步问题

### 环境部署配置

#### 本地开发环境
```bash
# 启动本地区块链
anvil

# 部署合约
cd ../background && forge script script/Deploy.s.sol --broadcast

# 启动前端
pnpm dev
```

#### 测试网部署
```typescript
// 1. 修改网络配置
export const CONTRACT_NETWORK = sepolia

// 2. 更新环境变量
NEXT_PUBLIC_CONTRACT_NETWORK=sepolia

// 3. 重新部署合约到测试网
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

### 常见问题排查

#### 钱包连接问题
- **页面刷新后报错**：已通过状态同步机制解决
- **网络切换失败**：检查是否在`SUPPORTED_CHAINS`列表中
- **合约调用失败**：确认用户在正确的合约网络

#### 开发调试步骤
1. 检查浏览器控制台日志
2. 验证合约部署状态和地址
3. 确认网络配置是否正确
4. 检查钱包连接状态和网络

## 📊 监控和分析

### 合约事件监听
- `ProjectCreated` - 项目创建事件
- `CampaignCreated` - Campaign创建事件
- `CommentPosted` - 评论发布事件
- `CommentLiked` - 评论点赞事件
- `CRTMinted` - CRT代币铸造事件
- `RewardsDistributed` - 奖励分配事件

### 性能优化
- React Query缓存策略
- 合约调用批量处理
- 组件懒加载
- 图片优化

## 🚀 未来规划

### 待实现功能
- **精英评论系统**：自动识别高质量评论
- **平台认证机制**：验证用户身份
- **踩评论功能**：负面反馈机制
- **多语言支持**：国际化扩展
- **移动端适配**：响应式优化

### 技术升级
- **Layer 2集成**：降低Gas费用
- **IPFS存储**：去中心化内容存储
- **GraphQL API**：更高效的数据查询
- **PWA支持**：离线功能

---

**更新日期**：2024年1月  
**维护者**：CoinReal 开发团队