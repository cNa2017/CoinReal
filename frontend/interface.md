# CoinReal Web 项目接口文档

币圈大众点评 Web 应用的智能合约集成 API 接口规范说明

## 🔧 技术栈

- **数据管理**: TanStack Query (React Query)
- **Web3集成**: Wagmi + Viem ✨
- **智能合约**: Solidity 合约系统 ✨
- **类型定义**: TypeScript (严格模式)
- **状态管理**: React Hooks + 合约状态同步 ✨
- **数据转换**: 合约数据 ↔ 前端数据格式转换 ✨

## 📋 接口概览

本项目已与真实智能合约完全集成，所有接口调用真实的区块链数据。同时保留Mock API作为开发和测试使用。

### 🔄 双模式支持
- **合约模式**: 真实区块链交互 (`wagmi-contract-api.ts`)
- **Mock模式**: 模拟数据开发 (`mock-data.ts`)

### 🎯 统一接口设计
两种模式提供完全相同的API接口，支持无缝切换：

```typescript
// 合约API模式
import { api } from '@/lib/wagmi-contract-api'

// Mock API模式  
import { api } from '@/lib/mock-data'

// 使用方式完全相同
const projects = await api.getProjects()
```

## 🔗 Web3 身份认证

### 钱包连接状态 ✨

```typescript
interface WalletState {
  isConnected: boolean         // 钱包是否已连接
  isConnecting: boolean        // 是否连接中
  address?: string             // 钱包地址
  chainId: number             // 当前链ID
  isOnContractNetwork: boolean // 是否在合约网络
  canWrite: boolean           // 是否可执行写操作
  canRead: boolean            // 是否可执行读操作
}

// Hook 使用
const { isConnected, address, canWrite } = useContractApi()
```

### 网络架构管理 ✨

```typescript
// 合约网络配置 (开发者控制，固定配置)
const CONTRACT_NETWORK = anvil // 当前: 本地开发
// const CONTRACT_NETWORK = sepolia // 可部署到: 测试网

// 钱包支持的网络 (用户可切换)
const SUPPORTED_WALLET_NETWORKS = {
  anvil: { id: 31337, name: "Anvil 本地网络" },
  sepolia: { id: 11155111, name: "Sepolia 测试网" },
  mainnet: { id: 1, name: "以太坊主网" }
}

// 网络状态检测
const { 
  isOnContractNetwork,  // 钱包网络是否匹配合约网络
  switchNetwork,        // 切换钱包网络
  contractNetwork,      // 合约网络信息 (只读)
  walletNetwork         // 钱包网络信息
} = useContractApi()
```

## ⚡ 操作类型区分 ✨

### 合约相关操作 (固定合约网络)
- **读取操作**: `getProjects`, `getProjectComments`, `getUser` 等
  - 总是从配置的合约网络读取数据
  - 无需钱包网络匹配
  - 即使钱包未连接也可执行
  
- **写入操作**: `postComment`, `likeComment`, `createProject` 等  
  - 写入到配置的合约网络
  - **必须要求**: 钱包网络 = 合约网络
  - 需要用户钱包签名确认

### 钱包相关操作 (用户钱包网络)
- **余额查询**: ETH余额、Token余额、NFT持有量等
- **资产信息**: 用户在当前钱包网络的所有资产
- **网络切换**: 帮助用户切换钱包网络以匹配合约网络

## 🚀 项目相关接口

### 1. 获取项目列表 ✨

**接口名称**: `getProjects`  
**用途**: 从智能合约获取所有加密货币项目的列表信息  
**合约调用**: `CoinRealPlatform.getProjects(offset, limit)`

**请求参数**:
- `offset` (number, 可选): 分页偏移量，默认 0
- `limit` (number, 可选): 每页数量，默认 50

**返回数据类型**: `Promise<Project[]>`

**合约数据转换** ✨:
```typescript
// 合约返回的原始数据
interface ContractProjectData {
  projectAddress: string    // 合约地址
  name: string             // 项目名称
  symbol: string           // 代币符号
  poolValueUSD: bigint     // 8位小数精度的USD值
  totalComments: bigint    // 评论总数
  isActive: boolean        // 是否活跃
  // ... 其他字段
}

// 转换为前端数据格式
const frontendProject = convertContractProjectToFrontend(contractData)
```

**返回数据结构**:
```typescript
interface Project {
  projectAddress: string      // 合约地址作为唯一标识 ✨
  name: string               // 项目名称
  symbol: string             // 代币符号
  description: string        // 项目描述
  category: string           // 项目分类
  poolValueUSD: number       // 奖池金额 (美分) ✨
  nextDrawTime: number       // 下次开奖时间戳 ✨
  totalParticipants: number  // 总参与人数
  totalComments: number      // 评论数量
  totalLikes: number         // 点赞总数
  isActive: boolean          // 是否活跃 ✨
  status: "Active" | "New" | "Paused" | "Ended" // 项目状态
  colorIndex?: number        // UI颜色索引 (0-9)
}
```

**React Hook 调用**:
```typescript
const { data: projects, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: () => api.getProjects()
})
```

---

### 2. 获取单个项目详情 ✨

**接口名称**: `getProject`  
**用途**: 根据项目合约地址获取特定项目的详细信息  
**合约调用**: 批量调用多个合约方法获取完整数据

**请求参数**:
- `projectAddress` (string): 项目合约地址 (0x格式)

**返回数据类型**: `Promise<Project | null>`

**合约交互细节** ✨:
```typescript
// 1. 验证合约地址格式
if (!projectAddress.startsWith('0x')) return null

// 2. 批量调用合约方法
const [basicInfo, stats, poolInfo] = await Promise.all([
  readContract(config, { address, abi, functionName: 'getBasicInfo' }),
  readContract(config, { address, abi, functionName: 'getProjectStats' }),
  readContract(config, { address, abi, functionName: 'getPoolInfo' })
])

// 3. 数据合并和转换
return convertContractProjectToFrontend({ ...basicInfo, ...stats, ...poolInfo })
```

---

## 💬 评论相关接口

### 3. 获取项目评论列表 ✨

**接口名称**: `getProjectComments`  
**用途**: 从项目合约获取指定项目的所有评论  
**合约调用**: `Project.getComments(offset, limit)`

**请求参数**:
- `projectAddress` (string): 项目合约地址
- `offset` (number, 可选): 分页偏移量，默认 0
- `limit` (number, 可选): 每页数量，默认 20

**返回数据类型**: `Promise<Comment[]>`

**合约数据结构** ✨:
```typescript
interface ContractComment {
  id: bigint                // 评论ID
  author: string           // 评论者地址
  content: string          // 评论内容
  likes: bigint           // 点赞数
  crtReward: bigint       // CRT奖励 (18位小数)
  isElite: boolean        // 是否精英评论
  timestamp: bigint       // 发布时间戳
}
```

**返回数据结构**:
```typescript
interface Comment {
  id: number              // 评论唯一标识
  author: string          // 评论者钱包地址 ✨
  avatar: string          // 评论者头像URL (自动生成)
  content: string         // 评论内容
  likes: number           // 点赞数
  timestamp: number       // 发布时间戳
  crtReward: number       // 获得的CRT Token数量 (已转换为整数) ✨
  isElite: boolean        // 是否精英评论 ✨
  verified?: boolean      // 是否认证用户 (前端字段)
  dislikes?: number       // 踩数 (保留字段)
}
```

**数据精度转换** ✨:
```typescript
// CRT奖励从18位小数转换为整数显示
const convertCRTReward = (reward: bigint): number => {
  return parseInt(formatUnits(reward, 18))
}
```

---

### 4. 发表评论 ✨

**接口名称**: `postComment`  
**用途**: 在指定项目下发表新评论 (区块链写操作)  
**合约调用**: `Project.postComment(content)`

**请求参数**:
- `projectAddress` (string): 项目合约地址
- `content` (string): 评论内容

**返回数据类型**: `Promise<Comment>`

**业务规则** ✨:
- ✅ 用户必须连接钱包且在正确网络
- ✅ 评论者必须持有对应项目的代币 (合约验证)
- ✅ 评论长度限制: 10-500字符
- ✅ 每条评论自动获得 CRT Token 奖励
- ✅ 需要用户在钱包中确认交易

**合约交互流程** ✨:
```typescript
async postComment(projectAddress: string, content: string): Promise<Comment> {
  // 1. 验证用户状态
  if (!this.address) throw new Error('请先连接钱包')
  if (!isOnContractNetwork) throw new Error('请切换到正确网络')
  
  // 2. 验证内容
  if (content.length < 10 || content.length > 500) {
    throw new Error('评论长度必须在10-500字符之间')
  }
  
  // 3. 调用合约
  const hash = await writeContract(config, {
    address: projectAddress as Address,
    abi: ProjectABI,
    functionName: 'postComment',
    args: [content]
  })
  
  // 4. 等待交易确认
  const receipt = await waitForTransactionReceipt(config, { hash })
  
  // 5. 解析返回的评论数据
  const commentId = receipt.logs[0].args.commentId
  return await this.getComment(projectAddress, commentId)
}
```

**React Hook 调用**:
```typescript
const postCommentMutation = useMutation({
  mutationFn: ({ projectAddress, content }) => 
    api.postComment(projectAddress, content),
  onSuccess: () => {
    queryClient.invalidateQueries(['project-comments', projectAddress])
  }
})
```

---

### 5. 点赞评论 ✨

**接口名称**: `likeComment`  
**用途**: 对指定评论进行点赞 (区块链写操作)  
**合约调用**: `Project.likeComment(commentId)`

**请求参数**:
- `projectAddress` (string): 项目合约地址
- `commentId` (number): 评论ID

**返回数据类型**: `Promise<void>`

**业务规则** ✨:
- ✅ 点赞者钱包资产需≥$100 USDC等值 (合约验证)
- ✅ 每次点赞获得点赞Token
- ✅ 被点赞的评论增加点赞数和CRT奖励
- ✅ 同一用户不能重复点赞同一评论

**合约交互** ✨:
```typescript
async likeComment(projectAddress: string, commentId: number): Promise<void> {
  const hash = await writeContract(config, {
    address: projectAddress as Address,
    abi: ProjectABI,
    functionName: 'likeComment',
    args: [BigInt(commentId)]
  })
  
  await waitForTransactionReceipt(config, { hash })
}
```

---

## 👤 用户相关接口

### 6. 获取用户信息 ✨

**接口名称**: `getUser`  
**用途**: 获取指定钱包地址的用户信息 (支持当前用户或其他用户)  
**合约调用**: 多个合约方法的组合调用

**请求参数**:
- `userAddress` (string, 可选): 用户钱包地址，不传则获取当前连接用户

**返回数据类型**: `Promise<User>`

**合约数据来源** ✨:
```typescript
// 1. 用户统计数据
const userStats = await readContract(config, {
  address: platformAddress,
  abi: PlatformABI,
  functionName: 'getUserStats',
  args: [userAddress]
})

// 2. CRT分组统计
const crtBreakdown = await readContract(config, {
  address: platformAddress,
  abi: PlatformABI,
  functionName: 'getUserCRTBreakdown',
  args: [userAddress]
})

// 3. 精英评论状态
const isElite = await checkEliteStatus(userAddress)
```

**返回数据结构**:
```typescript
interface User {
  address: string           // 链上唯一标识（钱包地址） ✨
  username?: string         // 前端展示用，非链上数据
  avatar?: string          // 前端生成的头像
  totalRewards: string     // 累计获得奖励 (格式化显示) ✨
  commentTokens: number    // 评论获得的CRT Token ✨
  likeTokens: number      // 点赞获得的CRT Token ✨
  totalComments: number   // 累计评论数 ✨
  totalLikes: number      // 累计获得点赞数 ✨
  totalCRT: number        // 总CRT余额 (已转换为整数) ✨
  joinDate: string        // 前端显示用
  status: "Active" | "Verified" | "Elite" // Elite从合约获取 ✨
  badge?: string          // 前端展示用
}
```

**精度转换** ✨:
```typescript
// 18位小数CRT转换为整数显示
const convertCRTAmount = (amount: bigint): number => {
  return parseInt(formatUnits(amount, 18))
}

// 奖励金额格式化
const formatRewards = (amount: bigint): string => {
  const dollars = Number(formatUnits(amount, 18))
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(dollars)
}
```

---

### 7. 获取用户活动记录 ✨

**接口名称**: `getUserActivity`  
**用途**: 获取用户的链上活动历史记录  
**合约调用**: `CoinRealPlatform.getUserPlatformActivity(user, offset, limit)`

**请求参数**:
- `userAddress` (string, 可选): 用户地址，默认当前用户
- `offset` (number, 可选): 分页偏移量，默认 0
- `limit` (number, 可选): 每页数量，默认 20

**返回数据类型**: `Promise<UserActivity[]>`

**合约活动结构** ✨:
```typescript
interface ContractUserActivity {
  activityType: number     // 0:评论, 1:点赞, 2:赞助, 3:奖励
  projectAddress: string   // 项目合约地址
  timestamp: number       // 活动时间戳
  details: string         // 活动详情
  reward: bigint          // 获得奖励 (wei)
}
```

**返回数据结构**:
```typescript
interface UserActivity {
  id: string                              // 活动记录ID
  type: "comment" | "like" | "sponsor" | "reward" | "achievement" // 活动类型 ✨
  action: string                          // 活动描述
  target: string                          // 活动目标 (项目名称等)
  reward: string                          // 获得奖励 (如: "+15 CRT") ✨
  timestamp: string                       // 活动时间
  description: string                     // 详细描述
}
```

**活动类型映射** ✨:
```typescript
const getActivityType = (contractType: number): string => {
  const types = ['comment', 'like', 'sponsor', 'reward']
  return types[contractType] || 'unknown'
}
```

---

## 🏆 排行榜接口

### 8. 获取排行榜 ✨

**接口名称**: `getLeaderboard`  
**用途**: 获取项目参与度排行榜  
**合约调用**: `CoinRealPlatform.getProjectsRanking(sortBy, offset, limit)`

**请求参数**:
- `sortBy` (number, 可选): 排序方式，默认 2 (按奖池价值)
  - 0: 按参与人数
  - 1: 按评论数量  
  - 2: 按奖池价值
  - 3: 按最后活动时间
- `offset` (number, 可选): 分页偏移量，默认 0
- `limit` (number, 可选): 每页数量，默认 10

**返回数据类型**: `Promise<Project[]>`

**排序规则** ✨:
```typescript
enum ProjectSortBy {
  PARTICIPANTS = 0,    // 按参与人数降序
  COMMENTS = 1,        // 按评论数量降序
  POOL_VALUE = 2,      // 按奖池价值降序
  LAST_ACTIVITY = 3    // 按最后活动时间降序
}
```

---

## 🏗️ 项目管理接口

### 9. 创建项目 ✨

**接口名称**: `createProject`  
**用途**: 项目方创建新的项目合约  
**合约调用**: `ProjectFactory.createProject(...params)`

**请求参数**:
```typescript
interface CreateProjectParams {
  name: string           // 项目名称
  symbol: string         // 代币符号
  description: string    // 项目描述
  category: string       // 项目分类
  website: string        // 官方网站
  whitepaper: string     // 白皮书链接
  logoUrl: string        // Logo URL
  drawPeriodDays: number // 开奖周期(天)
}
```

**返回数据类型**: `Promise<string>` (新创建的项目合约地址)

**合约交互** ✨:
```typescript
async createProject(params: CreateProjectParams): Promise<string> {
  const hash = await writeContract(config, {
    address: projectFactoryAddress,
    abi: ProjectFactoryABI,
    functionName: 'createProject',
    args: [
      params.name,
      params.symbol,
      params.description,
      params.category,
      params.drawPeriodDays
    ]
  })
  
  const receipt = await waitForTransactionReceipt(config, { hash })
  
  // 从事件日志中提取新项目地址
  const projectCreatedEvent = receipt.logs.find(log => 
    log.topics[0] === keccak256(toBytes('ProjectCreated(address,address,string)'))
  )
  
  return projectCreatedEvent.args.projectAddress
}
```

---

### 10. 赞助项目 ✨

**接口名称**: `sponsorProject`  
**用途**: 向项目奖池添加资金  
**合约调用**: `Project.sponsor(tokenAddress, amount)`

**请求参数**:
- `projectAddress` (string): 项目合约地址
- `tokenAddress` (string): 代币合约地址 (USDC等)
- `amount` (string): 赞助金额 (wei格式)

**返回数据类型**: `Promise<void>`

**合约交互流程** ✨:
```typescript
async sponsorProject(projectAddress: string, tokenAddress: string, amount: string): Promise<void> {
  // 1. 授权代币转账
  const approveHash = await writeContract(config, {
    address: tokenAddress as Address,
    abi: ERC20ABI,
    functionName: 'approve',
    args: [projectAddress, BigInt(amount)]
  })
  
  await waitForTransactionReceipt(config, { hash: approveHash })
  
  // 2. 执行赞助
  const sponsorHash = await writeContract(config, {
    address: projectAddress as Address,
    abi: ProjectABI,
    functionName: 'sponsor',
    args: [tokenAddress, BigInt(amount)]
  })
  
  await waitForTransactionReceipt(config, { hash: sponsorHash })
}
```

---

## 🔄 数据流转和缓存

### React Query 配置 ✨

项目使用 TanStack Query 进行数据管理，集成智能合约状态：

**查询键 (Query Keys)**:
```typescript
const QUERY_KEYS = {
  projects: ['projects'],
  project: (address: string) => ['project', address],
  projectComments: (address: string) => ['project-comments', address],
  user: (address?: string) => ['user', address || 'current'],
  userActivity: (address?: string) => ['user-activity', address || 'current'],
  leaderboard: (sortBy: number) => ['leaderboard', sortBy]
} as const
```

**缓存策略** ✨:
- **读操作**: 自动缓存，5分钟过期
- **写操作**: 成功后自动刷新相关缓存
- **网络切换**: 清空所有缓存，重新加载
- **钱包切换**: 清空用户相关缓存

**自动刷新机制** ✨:
```typescript
// 发表评论后刷新评论列表
const postCommentMutation = useMutation({
  mutationFn: api.postComment,
  onSuccess: (newComment, { projectAddress }) => {
    // 乐观更新
    queryClient.setQueryData(
      ['project-comments', projectAddress],
      (old: Comment[]) => [newComment, ...old]
    )
    
    // 刷新项目统计
    queryClient.invalidateQueries(['project', projectAddress])
  }
})
```

**网络状态同步** ✨:
```typescript
// 监听网络变化
const { chainId } = useAccount()

useEffect(() => {
  if (chainId && !isContractNetwork(chainId)) {
    // 切换到只读模式，清空写操作缓存
    queryClient.clear()
  }
}, [chainId])
```

---

## 🛡️ 错误处理

### 通用错误响应格式 ✨

```typescript
interface ContractError {
  code: string                    // 错误代码
  message: string                 // 错误消息
  data?: any                     // 额外数据
  hash?: string                  // 交易哈希 (如果是交易错误)
}

interface ApiResponse<T> {
  data: T                        // 响应数据
  success: boolean               // 请求是否成功
  error?: ContractError          // 错误信息
}
```

### 常见错误类型 ✨

1. **连接错误**:
   - `WALLET_NOT_CONNECTED`: 钱包未连接
   - `WRONG_NETWORK`: 网络不匹配
   - `RPC_ERROR`: RPC调用失败

2. **权限错误**:
   - `INSUFFICIENT_BALANCE`: 余额不足
   - `TOKEN_REQUIREMENT_NOT_MET`: 持币门槛不满足
   - `DAILY_LIMIT_EXCEEDED`: 超过每日限制

3. **业务错误**:
   - `COMMENT_TOO_SHORT`: 评论内容过短
   - `COMMENT_TOO_LONG`: 评论内容过长
   - `DUPLICATE_LIKE`: 重复点赞
   - `PROJECT_NOT_ACTIVE`: 项目不活跃

4. **交易错误**:
   - `TRANSACTION_REJECTED`: 用户拒绝交易
   - `TRANSACTION_FAILED`: 交易执行失败
   - `GAS_LIMIT_EXCEEDED`: Gas 限制超出

### 错误处理示例 ✨

```typescript
const handleContractCall = async () => {
  try {
    const result = await api.postComment(projectAddress, content)
    // 成功处理
  } catch (error: any) {
    if (error.code === 'WALLET_NOT_CONNECTED') {
      toast.error('请先连接钱包')
    } else if (error.code === 'WRONG_NETWORK') {
      toast.error('请切换到正确的网络')
      switchNetwork?.(CONTRACT_NETWORK.id)
    } else if (error.code === 'TRANSACTION_REJECTED') {
      toast.error('交易被取消')
    } else {
      toast.error(error.message || '操作失败')
    }
  }
}
```

---

## 🔗 Web3 集成详情

### 钱包连接管理 ✨

```typescript
interface WalletConnection {
  // 连接状态
  isConnected: boolean
  isConnecting: boolean
  isReconnecting: boolean
  
  // 用户信息
  address?: string
  chainId: number
  
  // 网络信息
  isOnContractNetwork: boolean
  contractChainId: number
  contractNetwork: string
  
  // 操作权限
  canRead: boolean          // 始终为 true
  canWrite: boolean         // 需要连接且在正确网络
  
  // 操作方法
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
}
```

### 合约配置 ✨

```typescript
// 合约地址配置
const CONTRACT_ADDRESSES = {
  platform: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  crtToken: "0xcafac3dd18ac6c6e92c921884f9e4176737c052c",
  priceOracle: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  projectFactory: "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"
} as const

// ABI加载配置
const ABI_FILES = {
  platform: '/abi-json/CoinRealPlatform.json',
  project: '/abi-json/Project.json',
  crtToken: '/abi-json/CRTToken.json',
  erc20: '/abi-json/MockERC20.json'
} as const
```

### 数据精度处理 ✨

```typescript
// 精度常量定义
export const PRECISION_CONSTANTS = {
  CRT_DECIMALS: 18,           // CRT Token精度
  USD_DECIMALS: 8,            // USD价值精度（Chainlink标准）
  ETH_DECIMALS: 18,           // ETH精度
  USDC_DECIMALS: 6,           // USDC精度
  CENTS_FACTOR: 100,          // 美分转换因子
} as const

// 转换函数
export const formatters = {
  // 8位小数USD → 美元显示
  formatPoolValue: (poolValueUSD: bigint): string => {
    const dollars = Number(formatUnits(poolValueUSD, 8))
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars)
  },
  
  // 18位小数CRT → 整数显示
  formatCRTAmount: (amount: bigint): number => {
    return parseInt(formatUnits(amount, 18))
  },
  
  // 时间戳 → 相对时间
  formatRelativeTime: (timestamp: number): string => {
    return new Intl.RelativeTimeFormat('zh-CN').format(
      Math.ceil((timestamp * 1000 - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    )
  }
}
```

---

## 📝 使用示例

### 完整的项目详情页实现 ✨

```typescript
function ProjectDetailPage({ projectAddress }: { projectAddress: string }) {
  const api = useContractApi()
  
  // 获取项目信息
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectAddress],
    queryFn: () => api.contractApi.getProject(projectAddress),
    enabled: !!projectAddress
  })
  
  // 获取评论列表
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['project-comments', projectAddress],
    queryFn: () => api.contractApi.getProjectComments(projectAddress),
    enabled: !!projectAddress
  })
  
  // 发表评论
  const postCommentMutation = useMutation({
    mutationFn: ({ content }: { content: string }) => 
      api.contractApi.postComment(projectAddress, content),
    onSuccess: (newComment) => {
      queryClient.setQueryData(
        ['project-comments', projectAddress],
        (old: Comment[] = []) => [newComment, ...old]
      )
      toast.success('评论发表成功！')
    },
    onError: (error) => {
      toast.error(error.message || '发表评论失败')
    }
  })
  
  // 点赞评论
  const likeCommentMutation = useMutation({
    mutationFn: ({ commentId }: { commentId: number }) =>
      api.contractApi.likeComment(projectAddress, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project-comments', projectAddress])
      toast.success('点赞成功！')
    }
  })
  
  const handleSubmitComment = (content: string) => {
    if (!api.canWrite) {
      toast.error('请连接钱包并切换到正确网络')
      return
    }
    postCommentMutation.mutate({ content })
  }
  
  const handleLikeComment = (commentId: number) => {
    if (!api.canWrite) {
      toast.error('请连接钱包并切换到正确网络')
      return
    }
    likeCommentMutation.mutate({ commentId })
  }
  
  if (projectLoading) return <LoadingSpinner />
  if (projectError) return <ErrorMessage error={projectError} />
  if (!project) return <NotFoundMessage />
  
  return (
    <div className="project-detail">
      <ProjectInfo project={project} />
      <CommentSection 
        comments={comments || []}
        loading={commentsLoading}
        onSubmitComment={handleSubmitComment}
        onLikeComment={handleLikeComment}
        canInteract={api.canWrite}
      />
      
      {/* 网络状态提示 */}
      {!api.isOnContractNetwork && (
        <NetworkWarning 
          currentNetwork={api.userChainId}
          requiredNetwork={api.contractChainId}
          onSwitchNetwork={() => switchNetwork(api.contractChainId)}
        />
      )}
    </div>
  )
}
```

### 钱包连接组件 ✨

```typescript
function WalletConnectButton() {
  const { 
    isConnected, 
    isConnecting, 
    address, 
    connectWallet, 
    disconnectWallet,
    formatAddress 
  } = useWallet()
  
  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
            {formatAddress(address)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(address!)}>
            复制地址
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnectWallet}>
            断开连接
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return (
    <Button 
      onClick={connectWallet} 
      disabled={isConnecting}
      className="bg-gradient-to-r from-cyan-500 to-purple-500"
    >
      {isConnecting ? '连接中...' : '连接钱包'}
    </Button>
  )
}
```

---

## 🔮 未来扩展

### 计划中的接口 ✨

1. **多链支持接口**: 
   - 跨链资产查询
   - 跨链奖励分发
   - Layer 2 集成

2. **高级功能接口**:
   - NFT 奖励系统
   - 治理投票功能
   - 质押挖矿接口

3. **性能优化**:
   - GraphQL 端点集成
   - 批量操作优化
   - 链下数据缓存

4. **社交功能**:
   - 用户关注系统
   - 消息通知接口
   - 社区治理接口

### 实时功能 ✨

- **WebSocket 集成**: 实时评论和点赞更新
- **事件监听**: 监听合约事件自动更新UI
- **奖池变化通知**: 实时奖池金额变化
- **开奖结果推送**: 自动推送分红结果

### 移动端适配

- **PWA 支持**: 渐进式Web应用
- **移动钱包集成**: WalletConnect 深度集成
- **触摸优化**: 移动端交互优化

---

## 📚 相关文档

- [项目技术架构](./README.md)
- [合约集成指南](./CONTRACT_INTEGRATION.md)
- [术语映射文档](./TERMINOLOGY_MAPPING.md)
- [部署说明](../background/INTERFACE_DOCUMENTATION.md)

---

## 🚀 迁移指南

### 从Mock API迁移到合约API

```typescript
// 旧方式 - Mock API
import { mockApi } from '@/lib/mock-data'
const projects = await mockApi.getProjects()

// 新方式 - 合约API  
import { api } from '@/lib/wagmi-contract-api'
const projects = await api.getProjects()

// 使用统一Hook
const api = useContractApi()
const projects = await api.contractApi.getProjects()
```

### 错误处理升级

```typescript
// 原来的简单错误处理
try {
  const result = await api.postComment(projectId, content)
} catch (error) {
  console.error(error)
}

// 现在的完整错误处理
try {
  const result = await api.postComment(projectId, content)
} catch (error: any) {
  handleContractError(error)
}
```

---

*最后更新时间: 2024年12月 - v2.0 智能合约集成版本*
