# CoinReal Web 项目接口文档

币圈大众点评 Web 应用的 Campaign 奖励系统 API 接口规范说明

## 🔧 技术栈

- **数据管理**: TanStack Query (React Query)
- **Web3集成**: Wagmi + Viem ✨
- **智能合约**: Campaign奖励系统 (Solidity) ✨
- **类型定义**: TypeScript (严格模式)
- **状态管理**: React Hooks + Campaign状态同步 ✨
- **数据转换**: Campaign数据 ↔ 前端数据格式转换 ✨

## 📋 接口概览

本项目已与真实Campaign智能合约完全集成，实现了创新的"评论即收益、点赞即赚币"奖励机制。

### 🎯 Campaign系统核心概念

#### Campaign奖励机制 ✨
```typescript
const CampaignSystem = {
  // 📍 Project-Campaign分离架构
  architecture: {
    project: "专注评论点赞系统，管理内容交互",
    campaign: "管理奖励分配，发行独立CRT代币",
    separation: "职责分离，便于扩展和维护"
  },
  
  // 🎁 独立CRT代币
  crtTokens: {
    naming: "项目名-Campaign编号 (如: Bitcoin-Campaign1)",
    symbol: "CRT (固定)",
    feature: "Soulbound - 不可转移，代表真实贡献",
    precision: "18位小数，前端显示为整数"
  },
  
  // 💰 奖励机制
  rewards: {
    comment: "5 CRT (在所有活跃Campaign中获得)",
    like: "点赞者和被点赞者各获得1 CRT",
    distribution: {
      comment: "60% - 按CRT占比分配给所有参与者",
      like: "25% - 按点赞CRT占比分配",
      elite: "15% - 平分给获得CRT最多的评论者"
    }
  },
  
  // ⏰ Campaign生命周期
  lifecycle: {
    creation: "任何人可创建，自定义奖励代币和金额",
    active: "用户评论点赞，实时铸造CRT奖励",
    ended: "Campaign结束，分配真实代币奖励",
    extension: "无参与者时自动延长7天"
  }
}
```

### 🔄 双模式支持
- **合约模式**: 真实Campaign系统交互 (`wagmi-contract-api.ts`)
- **Mock模式**: 模拟数据开发 (`mock-data.ts`)

### 🎯 统一接口设计
两种模式提供完全相同的API接口，支持无缝切换：

```typescript
// 合约API模式
import { api } from '@/lib/wagmi-contract-api'

// Mock API模式  
import { api } from '@/lib/mock-data'

// 使用方式完全相同
const campaigns = await api.getProjectCampaigns(projectAddress)
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
- **读取操作**: `getProjects`, `getProjectCampaigns`, `getCampaignDetails` 等
  - 总是从配置的合约网络读取数据
  - 无需钱包网络匹配
  - 即使钱包未连接也可执行
  
- **写入操作**: `postComment`, `likeComment`, `createCampaign` 等  
  - 写入到配置的合约网络
  - **必须要求**: 钱包网络 = 合约网络
  - 需要用户钱包签名确认

### 钱包相关操作 (用户钱包网络)
- **余额查询**: ETH余额、Token余额、CRT余额等
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
  totalParticipants: bigint // 参与人数
  totalComments: bigint    // 评论总数
  totalLikes: bigint       // 点赞总数
  lastActivityTime: bigint // 最后活动时间
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
  totalParticipants: number  // 总参与人数
  totalComments: number      // 评论数量
  totalLikes: number         // 点赞总数
  lastActivityTime: number   // 最后活动时间戳 ✨
  isActive: boolean          // 是否活跃 ✨
  creator: string            // 创建者地址 ✨
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
**用途**: 获取指定项目的详细信息  
**合约调用**: `Project.getProjectStats()` + 基本信息查询

**请求参数**:
- `projectAddress` (string): 项目合约地址

**返回数据类型**: `Promise<Project | null>`

**React Hook 调用**:
```typescript
const { data: project, isLoading } = useQuery({
  queryKey: ['project', projectAddress],
  queryFn: () => api.getProject(projectAddress),
  enabled: !!projectAddress
})
```

## 🎯 Campaign相关接口 ✨

### 3. 获取项目Campaign列表

**接口名称**: `getProjectCampaigns`  
**用途**: 获取指定项目的所有Campaign列表  
**合约调用**: `Project.getCampaigns()` + Campaign详情批量查询

**请求参数**:
- `projectAddress` (string): 项目合约地址

**返回数据结构**:
```typescript
interface Campaign {
  address: string            // Campaign合约地址
  projectAddress: string     // 关联的项目地址
  sponsor: string           // 赞助者地址
  sponsorName: string       // 赞助者名称
  startTime: number         // 开始时间戳
  endTime: number           // 结束时间戳
  isActive: boolean         // 是否活跃
  rewardsDistributed: boolean // 奖励是否已分配
  rewardToken: string       // 奖励代币地址
  totalRewardPool: number   // 总奖池金额（wei格式）
  totalComments: number     // 活动期间评论数
  totalLikes: number        // 活动期间点赞数
  totalParticipants: number // 参与者数量
  
  // ERC20代币信息
  name: string              // CRT代币名称，如"Bitcoin-Campaign1"
  symbol: string            // CRT代币符号，固定为"CRT"
  totalSupply: number       // 总CRT发行量
  
  // 前端展示字段
  remainingTime?: number    // 剩余时间（秒）
  poolValueUSD?: number     // 奖池USD价值
  tokenIcon?: string        // 奖励代币图标
}
```

**React Hook 调用**:
```typescript
const { data: campaigns, isLoading } = useQuery({
  queryKey: ['campaigns', projectAddress],
  queryFn: () => api.getProjectCampaigns(projectAddress),
  enabled: !!projectAddress
})
```

---

### 4. 创建新Campaign

**接口名称**: `createCampaign`  
**用途**: 为指定项目创建新的Campaign  
**合约调用**: `CampaignFactory.createCampaign()`

**请求参数**:
```typescript
interface CreateCampaignParams {
  projectAddress: string    // 目标项目地址
  sponsorName: string       // 赞助者名称
  duration: number          // 持续时间（天数）
  rewardToken: string       // 奖励代币地址
  rewardAmount: string      // 奖励代币数量（wei格式字符串）
}
```

**业务流程**:
1. 用户授权CampaignFactory转移代币
2. 调用createCampaign创建Campaign合约
3. 代币自动转移到Campaign合约
4. Campaign自动添加到项目的活跃列表

**React Hook 调用**:
```typescript
const createCampaignMutation = useMutation({
  mutationFn: (params: CreateCampaignParams) => api.createCampaign(params),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    toast.success('Campaign创建成功！')
  }
})
```

---

### 5. 获取用户Campaign CRT详情

**接口名称**: `getUserCampaignCRTDetails`  
**用途**: 获取用户在项目所有Campaign中的CRT代币详情  
**合约调用**: `Project.getUserCampaignCRTDetails()`

**请求参数**:
- `projectAddress` (string): 项目合约地址
- `userAddress` (string, 可选): 用户地址，默认当前连接地址

**返回数据结构**:
```typescript
interface UserCampaignCRT {
  campaignAddress: string   // Campaign地址
  commentCRT: number        // 评论获得的CRT
  likeCRT: number          // 点赞获得的CRT
  totalCRT: number         // 总CRT
  pendingReward: number    // 待领取奖励（wei格式）
  crtBalance: number       // CRT代币余额
}
```

**React Hook 调用**:
```typescript
const { data: userCRTDetails, isLoading } = useQuery({
  queryKey: ['userCRTDetails', projectAddress, userAddress],
  queryFn: () => api.getUserCampaignCRTDetails(projectAddress, userAddress),
  enabled: !!projectAddress && !!userAddress
})
```

---

### 6. 领取Campaign奖励

**接口名称**: `claimCampaignReward`  
**用途**: 领取指定Campaign的奖励  
**合约调用**: `Campaign.claimRewards()`

**请求参数**:
- `campaignAddress` (string): Campaign合约地址

**前置条件**:
- Campaign必须已结束且奖励已分配
- 用户必须有待领取奖励

**React Hook 调用**:
```typescript
const claimRewardMutation = useMutation({
  mutationFn: (campaignAddress: string) => api.claimCampaignReward(campaignAddress),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['userCRTDetails'] })
    toast.success('奖励领取成功！')
  }
})
```

## 💬 评论相关接口

### 7. 获取项目评论列表

**接口名称**: `getProjectComments`  
**用途**: 获取指定项目的评论列表  
**合约调用**: `Project.getComments(offset, limit)`

**请求参数**:
- `projectAddress` (string): 项目合约地址
- `offset` (number, 可选): 分页偏移量，默认 0
- `limit` (number, 可选): 每页数量，默认 20

**返回数据结构**:
```typescript
interface Comment {
  id: number              // 评论ID
  author: string          // 作者地址
  content: string         // 评论内容
  likes: number           // 点赞数
  timestamp: number       // 发布时间戳
  crtReward: number       // CRT奖励（已转换为整数）
  isElite: boolean        // 是否为精英评论
  
  // 前端展示字段
  avatar?: string         // 头像URL
  verified?: boolean      // 是否认证
  dislikes?: number       // 踩数（暂不实现）
}
```

**React Hook 调用**:
```typescript
const { data: comments, isLoading } = useQuery({
  queryKey: ['comments', projectAddress],
  queryFn: () => api.getProjectComments(projectAddress),
  enabled: !!projectAddress
})
```

---

### 8. 发表评论

**接口名称**: `postComment`  
**用途**: 在指定项目发表评论  
**合约调用**: `Project.postComment(content)`

**请求参数**:
- `projectAddress` (string): 项目合约地址
- `content` (string): 评论内容 (1-1000字符)

**奖励机制** ✨:
- 自动在项目的所有活跃Campaign中获得5个CRT
- 评论ID自增，保证时间顺序
- 更新用户统计数据

**React Hook 调用**:
```typescript
const postCommentMutation = useMutation({
  mutationFn: ({ projectAddress, content }: { projectAddress: string, content: string }) => 
    api.postComment(projectAddress, content),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['comments'] })
    queryClient.invalidateQueries({ queryKey: ['userCRTDetails'] })
    toast.success('评论发表成功！获得5个CRT奖励')
  }
})
```

---

### 9. 点赞评论

**接口名称**: `likeComment`  
**用途**: 点赞指定评论  
**合约调用**: `Project.likeComment(commentId)`

**请求参数**:
- `projectAddress` (string): 项目合约地址
- `commentId` (number): 评论ID

**奖励机制** ✨:
- 点赞者在所有活跃Campaign中获得1个CRT
- 被点赞者在所有活跃Campaign中获得1个CRT
- 每个用户只能对同一评论点赞一次

**React Hook 调用**:
```typescript
const likeCommentMutation = useMutation({
  mutationFn: ({ projectAddress, commentId }: { projectAddress: string, commentId: number }) => 
    api.likeComment(projectAddress, commentId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['comments'] })
    queryClient.invalidateQueries({ queryKey: ['userCRTDetails'] })
    toast.success('点赞成功！你和作者各获得1个CRT')
  }
})
```

## 👤 用户相关接口

### 10. 获取用户信息

**接口名称**: `getUser`  
**用途**: 获取用户的统计信息和资产详情  
**合约调用**: 聚合多个合约的用户数据

**请求参数**:
- `userAddress` (string, 可选): 用户地址，默认当前连接地址

**返回数据结构**:
```typescript
interface User {
  address: string           // 钱包地址
  username?: string         // 显示名称（地址缩写）
  avatar?: string           // 头像URL
  totalRewards: string      // 已领取奖励总额
  commentTokens: number     // 评论获得的CRT总数
  likeTokens: number        // 点赞获得的CRT总数
  totalComments: number     // 总评论数
  totalLikes: number        // 总点赞数
  totalCRT: number          // 总CRT数量
  joinDate: string          // 加入日期
  status: "Active" | "Verified" | "Elite" // 用户状态
  badge?: string            // 用户徽章
}
```

**React Hook 调用**:
```typescript
const { data: user, isLoading } = useQuery({
  queryKey: ['user', userAddress],
  queryFn: () => api.getUser(userAddress),
  enabled: !!userAddress
})
```

---

### 11. 获取用户活动记录

**接口名称**: `getUserActivity`  
**用途**: 获取用户的活动历史记录  
**合约调用**: 聚合用户在各项目的活动数据

**请求参数**:
- `userAddress` (string, 可选): 用户地址
- `offset` (number, 可选): 分页偏移量
- `limit` (number, 可选): 每页数量

**返回数据结构**:
```typescript
interface UserActivity {
  id: string                // 活动ID
  type: "comment" | "like" | "sponsor" | "reward" | "achievement" // 活动类型
  action: string            // 活动描述
  target: string            // 目标对象
  reward: string            // 获得奖励
  timestamp: string         // 时间戳
  description: string       // 详细描述
}
```

## 🔧 数据转换工具

### CRT精度转换 ✨
```typescript
// 18位小数 → 整数显示
const convertCRTReward = (reward: bigint): number => {
  return parseInt(formatUnits(reward, 18))
}

// 整数 → 18位小数
const convertToCRTWei = (amount: number): bigint => {
  return parseUnits(amount.toString(), 18)
}
```

### 时间处理 ✨
```typescript
// Unix时间戳 → 剩余时间
const calculateRemainingTime = (endTime: number): number => {
  return Math.max(0, endTime - Math.floor(Date.now() / 1000))
}

// 剩余时间 → 友好显示
const formatRemainingTime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时`
  return `${Math.floor(seconds / 60)}分钟`
}
```

### 奖池价值计算 ✨
```typescript
// 通过价格预言机计算USD价值
const calculatePoolValueUSD = async (token: string, amount: bigint): Promise<number> => {
  const usdValue = await priceOracle.getUSDValue(token, amount)
  return Number(usdValue) / 1e8 // 8位小数 → 美元
}
```

## 🚨 错误处理

### 合约错误类型 ✨
```typescript
interface ContractError {
  code: string              // 错误代码
  message: string           // 错误信息
  data?: any               // 额外数据
}

// 常见错误处理
const handleContractError = (error: any) => {
  if (error.code === 'USER_REJECTED_REQUEST') {
    toast.error('用户取消了交易')
  } else if (error.message.includes('insufficient funds')) {
    toast.error('余额不足')
  } else if (error.message.includes('Campaign not active')) {
    toast.error('Campaign未激活')
  } else {
    toast.error('交易失败，请重试')
  }
}
```

### 网络错误处理 ✨
```typescript
const { isOnContractNetwork, switchNetwork } = useContractApi()

if (!isOnContractNetwork) {
  return (
    <div className="text-center p-4">
      <p>请切换到正确的网络</p>
      <button onClick={() => switchNetwork()}>
        切换网络
      </button>
    </div>
  )
}
```

## 🎨 React Hook 集成

### 完整组件示例 ✨
```typescript
function ProjectCampaigns({ projectAddress }: { projectAddress: string }) {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns', projectAddress],
    queryFn: () => api.getProjectCampaigns(projectAddress)
  })
  
  const { data: userCRTDetails } = useQuery({
    queryKey: ['userCRTDetails', projectAddress],
    queryFn: () => api.getUserCampaignCRTDetails(projectAddress)
  })
  
  const createCampaignMutation = useMutation({
    mutationFn: api.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })
  
  if (isLoading) return <div>加载中...</div>
  
  return (
    <div>
      <h2>活跃Campaign</h2>
      {campaigns?.map(campaign => (
        <CampaignCard 
          key={campaign.address} 
          campaign={campaign}
          userCRT={userCRTDetails?.find(c => c.campaignAddress === campaign.address)}
        />
      ))}
      <CreateCampaignButton onSubmit={createCampaignMutation.mutate} />
    </div>
  )
}
```

---

**更新日期**: 2024年1月  
**维护者**: CoinReal 开发团队
