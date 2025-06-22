// 用户相关类型
export interface User {
  address: string // 链上唯一标识（钱包地址）
  username?: string // 前端展示用，非链上数据
  avatar?: string // 前端展示用，非链上数据
  totalRewards: string // 对应合约 claimedRewards
  commentTokens: number // CRT Token - 评论获得的部分
  likeTokens: number // CRT Token - 点赞获得的部分
  totalComments: number // 对应合约 UserStats.totalComments
  totalLikes: number // 对应合约 UserStats.totalLikes  
  totalCRT: number // 对应合约 UserStats.totalCRT (commentTokens + likeTokens)
  joinDate: string // 前端展示用，非链上数据
  status: "Active" | "Verified" | "Elite" // Verified为平台认证（未实现），Elite从getEliteComments获取
  badge?: string // 前端展示用，非链上数据
}

// 项目相关类型
export interface Project {
  projectAddress: string // 合约地址作为唯一标识
  name: string // 对应合约 name()
  symbol: string // 对应合约 symbol()
  description: string // 对应合约 description()
  category: string // 对应合约 category()
  poolValueUSD: number // 对应合约 currentPoolUSD (单位：美分，需除以100)
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
  crtReward: number // 对应合约 Comment.crtReward (CRT Token奖励)
  isElite: boolean // 对应合约 Comment.isElite
  
  // 前端展示用字段（非链上数据）
  avatar?: string // 前端生成默认头像
  verified?: boolean // 平台认证状态（暂未实现）
  dislikes?: number // 保留mock数据，暂不实现
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
  totalCRT: number // 对应合约 UserStats.totalCRT
  claimedRewards: number // 对应合约 UserStats.claimedRewards
}

// 项目统计类型
export interface ProjectStats {
  totalParticipants: number
  totalLikes: number
  lastActivityTime: number
  currentPoolUSD: number
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