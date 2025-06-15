// Mock data type definitions
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
  tvl?: string
  change24h?: number
  rank?: number
}

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

export interface User {
  id: string
  name: string
  avatar: string
  walletAddress: string
  totalRewards: string
  commentTokens: number
  likeTokens: number
  totalComments: number
  totalLikes: number
  joinDate: string
  status: "Active" | "Verified" | "Elite"
  badge?: string
  tokenBalances?: {
    name: string
    symbol: string
    amount: string
    value: string
    change24h: number
  }[]
}

// Mock project data
export const mockProjects: Project[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    description: "The original cryptocurrency and digital gold standard. Bitcoin is a decentralized digital currency that enables peer-to-peer transactions without the need for intermediaries.",
    color: "from-orange-500 to-yellow-500",
    pool: "$45,230",
    timeLeft: "5 days",
    participants: 15420,
    comments: 8934,
    likes: 23456,
    website: "https://bitcoin.org",
    whitepaper: "https://bitcoin.org/bitcoin.pdf",
    status: "Active",
    category: "Store of Value",
    tvl: "$847.2B",
    change24h: 2.34,
    rank: 1,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    description: "Smart contract platform powering DeFi and NFTs. Ethereum is a decentralized platform that runs smart contracts and enables developers to build decentralized applications.",
    color: "from-blue-500 to-purple-500",
    pool: "$32,450",
    timeLeft: "3 days",
    participants: 12890,
    comments: 7234,
    likes: 18923,
    website: "https://ethereum.org",
    whitepaper: "https://ethereum.org/en/whitepaper/",
    status: "Active",
    category: "Smart Contracts",
    tvl: "$423.8B",
    change24h: -1.23,
    rank: 2,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    description: "High-performance blockchain for decentralized applications. Solana is designed to facilitate decentralized app (DApp) creation with fast transaction speeds and low costs.",
    color: "from-purple-500 to-pink-500",
    pool: "$18,920",
    timeLeft: "7 days",
    participants: 8934,
    comments: 4567,
    likes: 12678,
    website: "https://solana.com",
    whitepaper: "https://solana.com/solana-whitepaper.pdf",
    status: "Active",
    category: "Layer 1",
    tvl: "$89.4B",
    change24h: 5.67,
    rank: 3,
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    description: "Research-driven blockchain platform with peer-reviewed development approach. Focuses on sustainability, interoperability, and scalability.",
    color: "from-blue-600 to-cyan-500",
    pool: "$12,340",
    timeLeft: "4 days",
    participants: 6234,
    comments: 3421,
    likes: 8765,
    website: "https://cardano.org",
    whitepaper: "https://cardano.org/whitepaper",
    status: "Active",
    category: "Layer 1",
    tvl: "$45.2B",
    change24h: 1.89,
    rank: 4,
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    description: "Multi-chain protocol enabling blockchain interoperability. Allows different blockchains to transfer messages and value in a trust-free fashion.",
    color: "from-pink-500 to-rose-500",
    pool: "$9,870",
    timeLeft: "6 days",
    participants: 4567,
    comments: 2890,
    likes: 6543,
    website: "https://polkadot.network",
    whitepaper: "https://polkadot.network/whitepaper-v1",
    status: "Active",
    category: "Interoperability",
    tvl: "$32.1B",
    change24h: -0.45,
    rank: 5,
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    description: "Decentralized oracle network connecting blockchains to real-world data. Enables smart contracts to securely interact with external data sources.",
    color: "from-blue-500 to-indigo-500",
    pool: "$8,450",
    timeLeft: "8 days",
    participants: 3890,
    comments: 2345,
    likes: 5432,
    website: "https://chain.link",
    whitepaper: "https://link.smartcontract.com/whitepaper",
    status: "Active",
    category: "Oracle",
    tvl: "$28.9B",
    change24h: 3.21,
    rank: 6,
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    description: "Platform for decentralized applications and custom blockchain networks. Designed to be fast, low-cost, and environmentally friendly.",
    color: "from-red-500 to-pink-500",
    pool: "$7,230",
    timeLeft: "5 days",
    participants: 3456,
    comments: 1987,
    likes: 4321,
    website: "https://avax.network",
    whitepaper: "https://avalanche.network/whitepapers",
    status: "Active",
    category: "Layer 1",
    tvl: "$24.7B",
    change24h: 2.78,
    rank: 7,
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    description: "Ethereum scaling solution providing faster and cheaper transactions. Offers Layer 2 scaling solutions for Ethereum.",
    color: "from-purple-600 to-indigo-500",
    pool: "$5,890",
    timeLeft: "9 days",
    participants: 2890,
    comments: 1654,
    likes: 3210,
    website: "https://polygon.technology",
    whitepaper: "https://polygon.technology/lightpaper-polygon.pdf",
    status: "Active",
    category: "Layer 2",
    tvl: "$19.3B",
    change24h: 0.95,
    rank: 8,
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    description: "Meme-based cryptocurrency that has become a community-driven digital asset. Originally created as a joke, now has a large and loyal community.",
    color: "from-yellow-400 to-orange-400",
    pool: "$4,560",
    timeLeft: "12 days",
    participants: 2134,
    comments: 1432,
    likes: 2987,
    website: "https://dogecoin.com",
    whitepaper: "https://dogecoin.com/whitepaper",
    status: "Active",
    category: "Community",
    tvl: "$15.7B",
    change24h: 4.23,
    rank: 9,
  },
  {
    id: "cosmos",
    name: "Cosmos",
    symbol: "ATOM",
    description: "Internet of blockchains enabling independent blockchains to communicate with each other. Provides tools for scalable and interoperable blockchain ecosystem.",
    color: "from-purple-600 to-blue-500",
    pool: "$3,890",
    timeLeft: "6 days",
    participants: 1876,
    comments: 1245,
    likes: 2156,
    website: "https://cosmos.network",
    whitepaper: "https://cosmos.network/whitepaper",
    status: "New",
    category: "Interoperability",
    tvl: "$12.4B",
    change24h: 1.67,
    rank: 10,
  },
]

// Mock comment data
export const mockComments: Comment[] = [
  {
    id: 1,
    author: "CryptoMaster",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto-master",
    content: "Bitcoin remains digital gold! Long-term holding is never wrong. Recent price fluctuations are just normal corrections, fundamentals remain strong. The institutional adoption rate continues to rise, which is a very positive signal.",
    likes: 234,
    dislikes: 12,
    timestamp: "2 hours ago",
    verified: true,
    tokens: 15,
    projectId: "bitcoin",
  },
  {
    id: 2,
    author: "BlockchainAnalyst",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blockchain-analyst",
    content: "Ethereum 2.0 upgrade truly changed the game. Energy consumption reduced by 99% and transaction speeds significantly improved. This is huge good news for the entire DeFi ecosystem.",
    likes: 189,
    dislikes: 8,
    timestamp: "4 hours ago",
    verified: true,
    tokens: 22,
    projectId: "ethereum",
  },
  {
    id: 3,
    author: "DeFiEnthusiast",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=defi-lover",
    content: "Solana's processing speed is indeed impressive, but network stability still needs improvement. Though there are occasional downtime issues, the ecosystem development is very rapid, especially in NFT and GameFi sectors.",
    likes: 145,
    dislikes: 23,
    timestamp: "6 hours ago",
    verified: false,
    tokens: 8,
    projectId: "solana",
  },
  {
    id: 4,
    author: "AcademicResearcher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=researcher",
    content: "Cardano's academic approach and peer review is indeed interesting. While development progress is relatively slow, every update is well thought out. The launch of smart contract functionality marks an important milestone.",
    likes: 167,
    dislikes: 15,
    timestamp: "8 hours ago",
    verified: true,
    tokens: 12,
    projectId: "cardano",
  },
  {
    id: 5,
    author: "ChainConnector",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chain-connector",
    content: "Polkadot's parachain concept is very innovative! The ability for different blockchains to communicate seamlessly is truly the future trend. Cross-chain technology will be the next explosive point, worth close attention.",
    likes: 198,
    dislikes: 9,
    timestamp: "12 hours ago",
    verified: false,
    tokens: 18,
    projectId: "polkadot",
  },
  {
    id: 6,
    author: "OracleExpert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=oracle-expert",
    content: "Chainlink's leadership position in the oracle field is indisputable. Providing reliable external data sources for smart contracts is the infrastructure for DeFi development. Partners span across various industries with broad prospects.",
    likes: 176,
    dislikes: 7,
    timestamp: "1 day ago",
    verified: true,
    tokens: 25,
    projectId: "chainlink",
  },
  {
    id: 7,
    author: "AvalancheFan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=avalanche-fan",
    content: "Avalanche's subnet feature allows enterprises to create their own blockchains, which is a forward-thinking concept. Fast transaction speeds, low fees, and rapidly developing ecosystem. Worth long-term attention!",
    likes: 134,
    dislikes: 11,
    timestamp: "1 day ago",
    verified: false,
    tokens: 14,
    projectId: "avalanche",
  },
  {
    id: 8,
    author: "PolygonWarrior",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=polygon-warrior",
    content: "Polygon as an Ethereum scaling solution indeed solves many problems. Gas fees significantly reduced, transaction speeds notably improved. Many DeFi projects are migrating to Polygon.",
    likes: 156,
    dislikes: 18,
    timestamp: "2 days ago",
    verified: true,
    tokens: 16,
    projectId: "polygon",
  },
  {
    id: 9,
    author: "DogeBeliever",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doge-believer",
    content: "Dogecoin's community power is truly not to be underestimated! While it may not be the most technically advanced, the community's cohesion and popularity are incomparable to other coins. To the moon! 🚀",
    likes: 87,
    dislikes: 34,
    timestamp: "3 days ago",
    verified: false,
    tokens: 6,
    projectId: "dogecoin",
  },
  {
    id: 10,
    author: "CosmosExplorer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmos-explorer",
    content: "Cosmos's interoperability vision is grand. Communication between different blockchains will open up new possibilities. The development of IBC protocol shows us the prototype of a real blockchain internet.",
    likes: 123,
    dislikes: 13,
    timestamp: "3 days ago",
    verified: true,
    tokens: 19,
    projectId: "cosmos",
  },
]

// Mock user data
export const mockUser: User = {
  id: "user-1",
  name: "CryptoInvestor",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto-investor",
  walletAddress: "0x742d35Cc6634C0532925a3b8D391E00b0BaE93A1",
  totalRewards: "$1,247.65",
  commentTokens: 485,
  likeTokens: 312,
  totalComments: 127,
  totalLikes: 2341,
  joinDate: "August 15, 2023",
  status: "Verified",
  badge: "Active Contributor",
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
  async getProject(id: string): Promise<Project | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockProjects.find(p => p.id === id) || null
  },

  // Get project comments
  async getProjectComments(projectId: string): Promise<Comment[]> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockComments.filter(c => c.projectId === projectId)
  },

  // Post comment
  async postComment(projectId: string, content: string): Promise<Comment> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const newComment: Comment = {
      id: Date.now(),
      author: "Current User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current-user",
      content,
      likes: 0,
      dislikes: 0,
      timestamp: "just now",
      verified: false,
      tokens: Math.floor(Math.random() * 20) + 5,
      projectId,
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
    return mockProjects.sort((a, b) => b.participants - a.participants)
  },
} 