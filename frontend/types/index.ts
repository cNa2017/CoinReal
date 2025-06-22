// 用户相关类型
export interface User {
  id: string
  address: string
  username?: string
  avatar?: string
  totalRewards: string
  commentTokens: number
  likeTokens: number
  totalComments: number
  totalLikes: number
  joinDate: string
  status: "Active" | "Verified" | "Elite"
  badge?: string
}

// 项目相关类型
export interface Project {
  id: string
  name: string
  symbol: string
  description: string
  color: string
  pool: string
  timeLeft: string
  participants: number
  comments: number
  likes: number
  website: string
  whitepaper: string
  status: "Active" | "New" | "Paused" | "Ended"
  category: string
  contractAddress?: string
}

// 评论相关类型
export interface Comment {
  id: number
  author: string
  avatar: string
  content: string
  likes: number
  dislikes: number
  timestamp: string
  verified: boolean
  tokens: number
  projectId: string
}

// 链相关类型
export interface SupportedChain {
  id: number
  name: string
  symbol: string
  color: string
  rpcUrl?: string
  blockExplorer?: string
}

// API 响应类型
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// 奖池相关类型
export interface Pool {
  id: string
  name: string
  symbol: string
  totalPool: string
  currentRound: number
  nextDrawDate: Date
  participants: number
  comments: number
  status: "Active" | "Drawing" | "Completed"
  distribution: {
    commentRewards: number
    likeRewards: number
    eliteRewards: number
  }
}

// 钱包连接状态
export interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  address?: string
  chainId?: number
  balance?: string
} 