// Mock data type definitions - 兼容合约接口
export interface Project {
  projectAddress: string // 合约地址作为唯一标识
  name: string // 对应合约 name()
  symbol: string // 对应合约 symbol()
  description: string // 对应合约 description()
  category: string // 对应合约 category()
  poolValueUSD: number // 对应合约 currentPoolUSD (单位：美分)
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
  tokenBalances?: {
    name: string
    symbol: string
    amount: string
    value: string
    change24h: number
  }[]
}

// Mock project data - 使用合约兼容的数据结构
export const mockProjects: Project[] = [
  {
    projectAddress: "0xdec0b45cd042aabe94be7a484b300b0d09bbc72a", // Bitcoin项目合约地址
    name: "Bitcoin",
    symbol: "BTC",
    description: "The original cryptocurrency and digital gold standard. Bitcoin is a decentralized digital currency that enables peer-to-peer transactions without the need for intermediaries.",
    category: "Store of Value",
    poolValueUSD: 4523000, // $45,230 in cents
    nextDrawTime: Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60), // 5 days from now
    totalParticipants: 15420,
    totalComments: 8934,
    totalLikes: 23456,
    lastActivityTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    isActive: true,
    creator: "0x1234567890123456789012345678901234567890",
    website: "", // 前端保留为空
    whitepaper: "", // 前端保留为空
    colorIndex: 0, // 对应PROJECT_COLORS[0]
    status: "Active",
  },
  {
    projectAddress: "0x8d2d84edff317afa23323f13cf9edb8fd9cb4b62", // Ethereum项目合约地址
    name: "Ethereum",
    symbol: "ETH",
    description: "Smart contract platform powering DeFi and NFTs. Ethereum is a decentralized platform that runs smart contracts and enables developers to build decentralized applications.",
    category: "Smart Contracts",
    poolValueUSD: 3245000, // $32,450 in cents
    nextDrawTime: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 days from now
    totalParticipants: 12890,
    totalComments: 7234,
    totalLikes: 18923,
    lastActivityTime: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
    isActive: true,
    creator: "0x2345678901234567890123456789012345678901",
    website: "",
    whitepaper: "",
    colorIndex: 1,
    status: "Active",
  },
  {
    projectAddress: "0x7e643d5c8b6c8f9d784ae4249c45aa757166bdec", // Solana项目合约地址
    name: "Solana",
    symbol: "SOL",
    description: "High-performance blockchain for decentralized applications. Solana is designed to facilitate decentralized app (DApp) creation with fast transaction speeds and low costs.",
    category: "Layer 1",
    poolValueUSD: 1892000, // $18,920 in cents
    nextDrawTime: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
    totalParticipants: 8934,
    totalComments: 4567,
    totalLikes: 12678,
    lastActivityTime: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    isActive: true,
    creator: "0x3456789012345678901234567890123456789012",
    website: "",
    whitepaper: "",
    colorIndex: 2,
    status: "Active",
  },
  {
    projectAddress: "0x4567890123456789012345678901234567890123",
    name: "Cardano",
    symbol: "ADA",
    description: "Research-driven blockchain platform with peer-reviewed development approach. Focuses on sustainability, interoperability, and scalability.",
    category: "Layer 1",
    poolValueUSD: 1234000, // $12,340 in cents
    nextDrawTime: Math.floor(Date.now() / 1000) + (4 * 24 * 60 * 60), // 4 days from now
    totalParticipants: 6234,
    totalComments: 3421,
    totalLikes: 8765,
    lastActivityTime: Math.floor(Date.now() / 1000) - 10800, // 3 hours ago
    isActive: true,
    creator: "0x4567890123456789012345678901234567890123",
    website: "",
    whitepaper: "",
    colorIndex: 3,
    status: "Active",
  },
  {
    projectAddress: "0x5678901234567890123456789012345678901234",
    name: "Polkadot",
    symbol: "DOT",
    description: "Multi-chain protocol enabling blockchain interoperability. Allows different blockchains to transfer messages and value in a trust-free fashion.",
    category: "Interoperability",
    poolValueUSD: 987000, // $9,870 in cents
    nextDrawTime: Math.floor(Date.now() / 1000) + (6 * 24 * 60 * 60), // 6 days from now
    totalParticipants: 4567,
    totalComments: 2890,
    totalLikes: 6543,
    lastActivityTime: Math.floor(Date.now() / 1000) - 14400, // 4 hours ago
    isActive: true,
    creator: "0x5678901234567890123456789012345678901234",
    website: "",
    whitepaper: "",
    colorIndex: 4,
    status: "Active",
  },
  {
    projectAddress: "0x6789012345678901234567890123456789012345",
    name: "Chainlink",
    symbol: "LINK",
    description: "Decentralized oracle network connecting blockchains to real-world data. Enables smart contracts to securely interact with external data sources.",
    category: "Oracle",
    poolValueUSD: 845000, // $8,450 in cents
    nextDrawTime: Math.floor(Date.now() / 1000) + (8 * 24 * 60 * 60), // 8 days from now
    totalParticipants: 3890,
    totalComments: 2345,
    totalLikes: 5432,
    lastActivityTime: Math.floor(Date.now() / 1000) - 18000, // 5 hours ago
    isActive: true,
    creator: "0x6789012345678901234567890123456789012345",
    website: "",
    whitepaper: "",
    colorIndex: 5,
    status: "Active",
  },
  {
    projectAddress: "0x7890123456789012345678901234567890123456",
    name: "Avalanche",
    symbol: "AVAX",
    description: "Platform for decentralized applications and custom blockchain networks. Designed to be fast, low-cost, and environmentally friendly.",
    category: "Layer 1",
    poolValueUSD: 723000, // $7,230 in cents
    nextDrawTime: Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60), // 5 days from now
    totalParticipants: 3456,
    totalComments: 1987,
    totalLikes: 4321,
    lastActivityTime: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
    isActive: true,
    creator: "0x7890123456789012345678901234567890123456",
    website: "",
    whitepaper: "",
    colorIndex: 6,
    status: "Active",
  },
  {
    projectAddress: "0x8901234567890123456789012345678901234567",
    name: "Polygon",
    symbol: "MATIC",
    description: "Ethereum scaling solution providing faster and cheaper transactions. Offers Layer 2 scaling solutions for Ethereum.",
    category: "Layer 2",
    poolValueUSD: 589000, // $5,890 in cents
    nextDrawTime: Math.floor(Date.now() / 1000) + (9 * 24 * 60 * 60), // 9 days from now
    totalParticipants: 2890,
    totalComments: 1654,
    totalLikes: 3987,
    lastActivityTime: Math.floor(Date.now() / 1000) - 25200, // 7 hours ago
    isActive: true,
    creator: "0x8901234567890123456789012345678901234567",
    website: "",
    whitepaper: "",
    colorIndex: 7,
    status: "Active",
  }
]

// Mock comment data - 兼容合约接口
export const mockComments: Comment[] = [
  {
    id: 1,
    author: "0x742d35Cc6634C0532925a3b8D391E00b0BaE93A1", // 钱包地址作为author
    content: "Bitcoin remains digital gold! Long-term holding is never wrong. Recent price fluctuations are just normal corrections, fundamentals remain strong. The institutional adoption rate continues to rise, which is a very positive signal.",
    likes: 234,
    timestamp: Math.floor(Date.now() / 1000) - 7200, // 2小时前
    crtReward: 15, // CRT Token奖励
    isElite: true, // 精英评论
    
    // 前端展示用字段
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto-master",
    verified: true, // 平台认证状态
    dislikes: 12, // 保留mock数据
  },
  {
    id: 2,
    author: "0x8Ba1f109551bD432803012645Hac136c12456789",
    content: "Ethereum 2.0 upgrade truly changed the game. Energy consumption reduced by 99% and transaction speeds significantly improved. This is huge good news for the entire DeFi ecosystem.",
    likes: 189,
    timestamp: Math.floor(Date.now() / 1000) - 14400, // 4小时前
    crtReward: 22,
    isElite: true,
    
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blockchain-analyst",
    verified: true,
    dislikes: 8,
  },
  {
    id: 3,
    author: "0x456789012345678901234567890123456789012",
    content: "Solana's processing speed is indeed impressive, but network stability still needs improvement. Though there are occasional downtime issues, the ecosystem development is very rapid, especially in NFT and GameFi sectors.",
    likes: 145,
    timestamp: Math.floor(Date.now() / 1000) - 21600, // 6小时前
    crtReward: 8,
    isElite: false,
    
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=defi-lover",
    verified: false,
    dislikes: 23,
  },
  {
    id: 4,
    author: "0x567890123456789012345678901234567890123",
    content: "Cardano's academic approach and peer review is indeed interesting. While development progress is relatively slow, every update is well thought out. The launch of smart contract functionality marks an important milestone.",
    likes: 167,
    timestamp: Math.floor(Date.now() / 1000) - 28800, // 8小时前
    crtReward: 12,
    isElite: false,
    
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=researcher",
    verified: true,
    dislikes: 15,
  },
  {
    id: 5,
    author: "0x678901234567890123456789012345678901234",
    content: "Polkadot's parachain concept is very innovative! The ability for different blockchains to communicate seamlessly is truly the future trend. Cross-chain technology will be the next explosive point, worth close attention.",
    likes: 198,
    timestamp: Math.floor(Date.now() / 1000) - 43200, // 12小时前
    crtReward: 18,
    isElite: true,
    
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chain-connector",
    verified: false,
    dislikes: 9,
  },
  {
    id: 6,
    author: "0x789012345678901234567890123456789012345",
    content: "Chainlink's leadership position in the oracle field is indisputable. Providing reliable external data sources for smart contracts is the infrastructure for DeFi development. Partners span across various industries with broad prospects.",
    likes: 176,
    timestamp: Math.floor(Date.now() / 1000) - 86400, // 1天前
    crtReward: 25,
    isElite: true,
    
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=oracle-expert",
    verified: true,
    dislikes: 7,
  },
  {
    id: 7,
    author: "0x890123456789012345678901234567890123456",
    content: "Avalanche's subnet feature allows enterprises to create their own blockchains, which is a forward-thinking concept. Fast transaction speeds, low fees, and rapidly developing ecosystem. Worth long-term attention!",
    likes: 134,
    timestamp: Math.floor(Date.now() / 1000) - 86400, // 1天前
    crtReward: 14,
    isElite: false,
    
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=avalanche-fan",
    verified: false,
    dislikes: 11,
  },
  {
    id: 8,
    author: "0x901234567890123456789012345678901234567",
    content: "Polygon as an Ethereum scaling solution indeed solves many problems. Gas fees significantly reduced, transaction speeds notably improved. Many DeFi projects are migrating to Polygon.",
    likes: 156,
    timestamp: Math.floor(Date.now() / 1000) - 172800, // 2天前
    crtReward: 16,
    isElite: false,
    
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=polygon-warrior",
    verified: true,
    dislikes: 18,
  },
]

// Mock user data - 兼容合约接口
export const mockUser: User = {
  address: "0x742d35Cc6634C0532925a3b8D391E00b0BaE93A1", // 钱包地址作为唯一标识
  username: "CryptoInvestor", // 前端展示用
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto-investor", // 前端展示用
  totalRewards: "$1,247.65", // 对应合约 claimedRewards
  commentTokens: 485, // CRT Token - 评论获得的部分
  likeTokens: 312, // CRT Token - 点赞获得的部分
  totalCRT: 797, // commentTokens + likeTokens = 485 + 312
  totalComments: 127, // 对应合约 UserStats.totalComments
  totalLikes: 2341, // 对应合约 UserStats.totalLikes
  joinDate: "August 15, 2023", // 前端展示用
  status: "Verified", // 平台认证状态
  badge: "Active Contributor", // 前端展示用
  tokenBalances: [
    {
      name: "Bitcoin",
      symbol: "BTC",
      amount: "0.0234",
      value: "$1,023.45",
      change24h: 2.34,
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      amount: "0.876",
      value: "$1,987.23",
      change24h: -1.23,
    },
    {
      name: "Solana",
      symbol: "SOL",
      amount: "12.45",
      value: "$456.78",
      change24h: 5.67,
    },
    {
      name: "Cardano",
      symbol: "ADA",
      amount: "234.56",
      value: "$123.45",
      change24h: 1.89,
    },
    {
      name: "CoinReal Token",
      symbol: "CRT",
      amount: "1,247.89",
      value: "$312.45",
      change24h: 8.92,
    },
  ],
}

// Mock user activity data
export const mockUserActivities = [
  {
    id: 1,
    type: "comment",
    action: "Posted Comment",
    target: "Bitcoin",
    reward: "+15 CRT",
    timestamp: "2 hours ago",
    description: "Posted in-depth analysis comment in Bitcoin project",
  },
  {
    id: 2,
    type: "like",
    action: "Received Likes",
    target: "Ethereum Analysis",
    reward: "+3 CRT",
    timestamp: "4 hours ago",
    description: "Your comment received 5 likes",
  },
  {
    id: 3,
    type: "reward",
    action: "Daily Reward",
    target: "Login Bonus",
    reward: "+10 CRT",
    timestamp: "1 day ago",
    description: "Completed daily login task",
  },
  {
    id: 4,
    type: "comment",
    action: "Posted Comment",
    target: "Solana",
    reward: "+12 CRT",
    timestamp: "2 days ago",
    description: "Shared technical insights in Solana project",
  },
  {
    id: 5,
    type: "achievement",
    action: "Achievement Unlocked",
    target: "Comment Master",
    reward: "+50 CRT",
    timestamp: "3 days ago",
    description: "Posted over 100 comments",
  },
  {
    id: 6,
    type: "like",
    action: "Liked Comment",
    target: "Chainlink Discussion",
    reward: "+2 CRT",
    timestamp: "3 days ago",
    description: "Liked quality content",
  },
  {
    id: 7,
    type: "comment",
    action: "Posted Comment",
    target: "Polygon",
    reward: "+8 CRT",
    timestamp: "4 days ago",
    description: "Participated in Polygon technical discussion",
  },
  {
    id: 8,
    type: "reward",
    action: "Weekly Reward",
    target: "Active User",
    reward: "+100 CRT",
    timestamp: "5 days ago",
    description: "Top 10% activity this week",
  },
]

// Mock API class
export const mockApi = {
  // Get all projects
  async getProjects(): Promise<Project[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockProjects
  },

  // Get single project
  async getProject(projectAddress: string): Promise<Project | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockProjects.find(p => p.projectAddress === projectAddress) || null
  },

  // Get project comments
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProjectComments(_projectAddress: string): Promise<Comment[]> {
    await new Promise(resolve => setTimeout(resolve, 800))
    // 根据项目地址过滤评论（简化实现，实际应从合约获取）
    return mockComments
  },

  // Post comment
  async postComment(projectAddress: string, content: string): Promise<Comment> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const newComment: Comment = {
      id: Date.now(),
      author: "0x742d35Cc6634C0532925a3b8D391E00b0BaE93A1", // 当前用户钱包地址
      content,
      likes: 0,
      timestamp: Math.floor(Date.now() / 1000), // Unix时间戳
      crtReward: Math.floor(Math.random() * 20) + 5, // CRT奖励
      isElite: false, // 新评论默认不是精英
      
      // 前端展示用字段
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current-user",
      verified: false,
      dislikes: 0,
    }
    
    mockComments.push(newComment)
    return newComment
  },

  // Like comment
  async likeComment(commentId: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const comment = mockComments.find(c => c.id === commentId)
    if (comment) {
      comment.likes += 1
    }
  },

  // Get user info
  async getUser(): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return mockUser
  },

  // Get user activity history
  async getUserActivity(): Promise<typeof mockUserActivities> {
    await new Promise(resolve => setTimeout(resolve, 700))
    return mockUserActivities
  },

  // Get leaderboard
  async getLeaderboard(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockProjects.sort((a, b) => b.totalParticipants - a.totalParticipants)
  },
} 