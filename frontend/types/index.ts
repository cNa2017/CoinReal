// 用户相关类型
export interface User {
  address: string // 链上唯一标识（钱包地址）
  username?: string // 前端展示用，非链上数据
  avatar?: string // 前端展示用，非链上数据
  totalRewards: string // 对应合约 claimedRewards (格式化显示)
  commentTokens: number // CRT Token - 评论获得的部分 (已转换为整数)
  likeTokens: number // CRT Token - 点赞获得的部分 (已转换为整数)
  totalComments: number // 对应合约 UserStats.totalComments
  totalLikes: number // 对应合约 UserStats.totalLikes  
  totalCRT: number // 对应合约 UserStats.totalCRT (已转换为整数)
  joinDate: string // 前端展示用，非链上数据
  status: "Active" | "Verified" | "Elite" // Verified为平台认证（未实现），Elite从getEliteComments获取
  badge?: string // 前端展示用，非链上数据
  tokenBalances?: {
    name: string
    symbol: string
    amount: string
    value: string
    change24h: number
  }[]
}

// 项目相关类型
export interface Project {
  projectAddress: string // 合约地址作为唯一标识
  name: string // 对应合约 name()
  symbol: string // 对应合约 symbol()
  description: string // 对应合约 description()
  category: string // 对应合约 category()
  poolValueUSD: number // 对应合约 currentPoolUSD/poolValueUSD (已转换为美分)
  nextDrawTime: number // 对应合约 nextDrawTime (Unix时间戳)
  totalParticipants: number // 对应合约 getProjectStats().totalParticipants
  totalComments: number // 对应合约 totalComments()
  totalLikes: number // 对应合约 getProjectStats().totalLikes
  lastActivityTime: number // 对应合约 getProjectStats().lastActivityTime
  isActive: boolean // 对应合约 isActive()
  creator: string // 对应合约 creator()
  
  // 前端展示用字段（非链上数据）
  website?: string // 前端保留，默认为空
  whitepaper?: string // 前端保留，默认为空
  colorIndex?: number // 用于循环选择10个固定颜色中的一个
  status: "Active" | "New" | "Paused" | "Ended" // 基于 isActive 计算
}

// 评论相关类型
export interface Comment {
  id: number // 对应合约 Comment.id
  author: string // 对应合约 Comment.author (钱包地址)
  content: string // 对应合约 Comment.content
  likes: number // 对应合约 Comment.likes
  timestamp: number // 对应合约 Comment.timestamp (Unix时间戳)
  crtReward: number // 对应合约 Comment.crtReward (已转换为整数)
  isElite: boolean // 对应合约 Comment.isElite
  flag: number // 对应合约 Comment.flag 标签：0无标签，1积极，2消极，3中立
  
  // 前端展示用字段（非链上数据）
  avatar?: string // 前端生成默认头像
  verified?: boolean // 平台认证状态（暂未实现）
  dislikes?: number // 暂不实现
}

// 赞助相关类型（简化设计）
export interface Sponsorship {
  token: string // 对应合约 Sponsorship.token
  amount: string // 对应合约 Sponsorship.amount (wei格式)
  sponsor: string // 对应合约 Sponsorship.sponsor
  timestamp: number // 对应合约 Sponsorship.timestamp
}

// 用户统计类型（对应合约UserStats）
export interface UserStats {
  totalComments: number // 对应合约 UserStats.totalComments
  totalLikes: number // 对应合约 UserStats.totalLikes
  totalCRT: number // 对应合约 UserStats.totalCRT (原始wei值)
  claimedRewards: number // 对应合约 UserStats.claimedRewards (原始wei值)
}

// 用户CRT分组统计类型
export interface UserCRTBreakdown {
  commentTokens: number // 从评论获得的CRT (原始wei值)
  likeTokens: number // 从点赞获得的CRT (原始wei值)
}

// 项目统计类型
export interface ProjectStats {
  totalParticipants: number
  totalLikes: number
  lastActivityTime: number
  currentPoolUSD: number // 8位小数精度的USD值
}

// 用户活动类型
export interface UserActivity {
  id: string
  type: "comment" | "like" | "sponsor" | "reward" | "achievement"
  action: string
  target: string
  reward: string
  timestamp: string
  description: string
}

// 合约评论数据类型（对应合约Comment结构）
export interface ContractComment {
  id: number
  author: string
  content: string
  likes: number
  crtReward: number // 原始wei值
  isElite: boolean
  timestamp: number
  flag: number // 对应合约 Comment.flag 标签：0无标签，1积极，2消极，3中立
}

// 合约用户统计数据类型
export interface ContractUserStats {
  totalComments: number
  totalLikes: number
  totalCRT: number // 原始wei值
  claimedRewards: number // 原始wei值
}

// 链相关类型
export interface SupportedChain {
  id: number
  name: string
  symbol: string
  rpcUrl?: string
  blockExplorer?: string
}

// API 响应类型
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// 钱包连接状态
export interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  address?: string
  chainId?: number
  balance?: string
}

// 分页查询参数
export interface PaginationParams {
  offset: number
  limit: number
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

// 合约错误类型
export interface ContractError {
  code: string
  message: string
  data?: any
}

// 交易状态类型
export interface TransactionStatus {
  hash?: string
  status: 'pending' | 'success' | 'failed'
  confirmations?: number
}

// 颜色配置（替代原来的Project.color）
export const PROJECT_COLORS = [
  "from-orange-500 to-yellow-500",    // Bitcoin风格
  "from-blue-500 to-purple-500",      // Ethereum风格
  "from-purple-500 to-pink-500",      // Solana风格
  "from-blue-600 to-cyan-500",        // Cardano风格
  "from-pink-500 to-rose-500",        // Polkadot风格
  "from-blue-500 to-indigo-500",      // Chainlink风格
  "from-red-500 to-pink-500",         // Avalanche风格
  "from-purple-600 to-indigo-500",    // Polygon风格
  "from-green-500 to-teal-500",       // 通用绿色
  "from-gray-500 to-slate-500"        // 通用灰色
]

// 数据精度常量
export const PRECISION_CONSTANTS = {
  CRT_DECIMALS: 18,           // CRT Token精度
  USD_DECIMALS: 8,            // USD价值精度（Chainlink标准）
  ETH_DECIMALS: 18,           // ETH精度
  USDC_DECIMALS: 6,           // USDC精度
  CENTS_FACTOR: 100,          // 美分转换因子
} as const

// 活动类型枚举
export enum ActivityType {
  COMMENT = 0,
  LIKE = 1,
  SPONSOR = 2,
  REWARD = 3
}

// 排序类型枚举
export enum ProjectSortBy {
  PARTICIPANTS = 0,
  COMMENTS = 1,
  POOL_VALUE = 2,
  LAST_ACTIVITY = 3
}

export enum UserSortBy {
  TOTAL_CRT = 0,
  COMMENTS = 1,
  LIKES = 2,
  REWARDS = 3
}

// Campaign相关类型（新增）
export interface Campaign {
  address: string // Campaign合约地址
  projectAddress: string // 关联的项目地址
  sponsor: string // 赞助者地址
  sponsorName: string // 赞助者名称
  startTime: number // 开始时间戳
  endTime: number // 结束时间戳
  isActive: boolean // 是否活跃
  rewardsDistributed: boolean // 奖励是否已分配
  rewardToken: string // 奖励代币地址
  totalRewardPool: number // 总奖池金额（wei格式）
  totalComments: number // 活动期间评论数
  totalLikes: number // 活动期间点赞数
  totalParticipants: number // 参与者数量
  
  // ERC20代币信息
  name: string // CRT代币名称，如"Bitcoin-Campaign1"
  symbol: string // CRT代币符号，固定为"CRT"
  totalSupply: number // 总CRT发行量
  
  // 奖励代币信息（新增）
  rewardTokenName?: string // 奖励代币名称，如"USD Coin"
  rewardTokenSymbol?: string // 奖励代币符号，如"USDC"
  rewardTokenDecimals?: number // 奖励代币精度，如6
  
  // 前端展示字段
  remainingTime?: number // 剩余时间（秒）
  poolValueUSD?: number // 奖池USD价值
  tokenIcon?: string // 奖励代币图标
}

// 用户在Campaign中的CRT详情
export interface UserCampaignCRT {
  campaignAddress: string // Campaign地址
  commentCRT: number // 评论获得的CRT
  likeCRT: number // 点赞获得的CRT
  totalCRT: number // 总CRT
  pendingReward: number // 待领取奖励（wei格式）
  crtBalance: number // CRT代币余额
  // 奖励代币信息（新增）
  tokenSymbol?: string // 奖励代币符号，如"USDC"
  tokenDecimals?: number // 奖励代币精度，如6
}

// Campaign统计信息
export interface CampaignStats {
  totalParticipants: number
  totalComments: number
  totalLikes: number
  totalCRT: number
  remainingTime: number
}

// Campaign创建参数
export interface CreateCampaignParams {
  projectAddress: string
  sponsorName: string
  duration: number // 分钟数
  rewardToken: string
  rewardAmount: string // 用户输入的数量（如"100"）
  rewardTokenDecimals: number // 代币小数位数
}