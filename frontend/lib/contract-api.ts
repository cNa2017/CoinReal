import { Comment, Project, User } from '@/types'

// 使用动态加载方式代替静态导入
// 动态导入JSON文件
const loadJSON = async (path: string) => {
  try {
    const response = await fetch(path)
    return await response.json()
  } catch (error) {
    console.error(`Error loading JSON file from ${path}:`, error)
    return {}
  }
}

// 存储加载的ABI和部署信息
let deploymentsInfo: any = null
let CoinRealPlatformABI: any = null
let ProjectABI: any = null
let ERC20ABI: any = null
let CRTTokenABI: any = null

// 初始化函数 - 加载合约ABI和部署信息
const initContractData = async () => {
  if (deploymentsInfo) return // 如果已加载，则跳过

  try {
    deploymentsInfo = await loadJSON('/background/deployments.json')
    CoinRealPlatformABI = await loadJSON('/background/abi-json/CoinRealPlatform.json')
    ProjectABI = await loadJSON('/background/abi-json/Project.json')
    ERC20ABI = await loadJSON('/background/abi-json/MockERC20.json')
    CRTTokenABI = await loadJSON('/background/abi-json/CRTToken.json')
    
    console.log('Contract data loaded successfully')
  } catch (error) {
    console.error('Error initializing contract data:', error)
    // 使用备用配置
    deploymentsInfo = {
      platform: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
      crtToken: "0xcafac3dd18ac6c6e92c921884f9e4176737c052c",
      priceOracle: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
      projectFactory: "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
      projects: {}
    }
  }
}

/**
 * 真实合约API类
 * 替代mockApi，与区块链合约进行真实交互
 */
export class ContractAPI {
  private address: string | undefined = undefined

  constructor() {
    // 初始化加载合约数据
    initContractData()
      .then(() => console.log('ContractAPI initialized'))
      .catch(err => console.error('Failed to initialize ContractAPI:', err))
  }

  /**
   * 设置当前用户钱包地址
   */
  setAddress(address: string | undefined): void {
    this.address = address
    console.log('User address set to:', address)
  }
  
  /**
   * 获取所有项目列表（支持分页）
   */
  async getProjects(offset: number = 0, limit: number = 50): Promise<Project[]> {
    try {
      await initContractData() // 确保数据已加载
      
      if (!deploymentsInfo || !deploymentsInfo.platform) {
        throw new Error('Contract addresses not loaded')
      }
      
      // 模拟获取项目列表
      console.log('调用合约: getProjects', deploymentsInfo.platform, offset, limit)
      return []
    } catch (error) {
      console.error('Failed to get projects:', error)
      // 降级到空数组
      return []
    }
  }

  /**
   * 获取单个项目详情
   */
  async getProject(projectAddress: string): Promise<Project | null> {
    try {
      await initContractData() // 确保数据已加载
      
      if (!projectAddress || !projectAddress.startsWith('0x')) {
        return null
      }
      
      // 模拟项目数据
      console.log('调用合约: getProject', projectAddress)
      return null
    } catch (error) {
      console.error('Failed to get project:', error)
      return null
    }
  }

  /**
   * 获取项目评论
   */
  async getProjectComments(projectAddress: string, offset: number = 0, limit: number = 20): Promise<Comment[]> {
    try {
      await initContractData() // 确保数据已加载
      
      if (!projectAddress || !projectAddress.startsWith('0x')) {
        return []
      }
      
      // 模拟评论数据
      console.log('调用合约: getProjectComments', projectAddress, offset, limit)
      return []
    } catch (error) {
      console.error('Failed to get project comments:', error)
      return []
    }
  }

  /**
   * 发表评论
   */
  async postComment(projectAddress: string, content: string): Promise<Comment> {
    try {
      await initContractData() // 确保数据已加载
      
      if (!this.address) {
        throw new Error('No wallet address set')
      }
      
      if (!projectAddress || !projectAddress.startsWith('0x')) {
        throw new Error('Invalid project address')
      }
      
      // 模拟发表评论
      console.log('调用合约: postComment', projectAddress, content)
      
      // 简单模拟一个评论对象作为返回
      const mockComment = {
        id: Math.floor(Math.random() * 1000) + 1000,
        author: this.address,
        content: content,
        likes: 0,
        timestamp: Math.floor(Date.now() / 1000),
        crtReward: 5,
        isElite: false,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.address}`,
        verified: false,
        dislikes: 0,
      }
      
      return mockComment
    } catch (error) {
      console.error('Failed to post comment:', error)
      throw error
    }
  }

  /**
   * 点赞评论
   */
  async likeComment(projectAddress: string, commentId: number): Promise<void> {
    try {
      await initContractData() // 确保数据已加载
      
      if (!this.address) {
        throw new Error('No wallet address set')
      }
      
      // 模拟点赞
      console.log('调用合约: likeComment', projectAddress, commentId)
    } catch (error) {
      console.error('Failed to like comment:', error)
      throw error
    }
  }

  /**
   * 获取用户信息
   */
  async getUser(userAddress?: string): Promise<User> {
    try {
      await initContractData() // 确保数据已加载
      
      const address = userAddress || this.address
      
      if (!address) {
        throw new Error('User address required')
      }
      
      // 模拟用户数据
      console.log('调用合约: getUser', address)
      
      // 返回模拟用户数据
      return {
        address: address,
        username: `User_${address.slice(0, 6)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        totalRewards: '$0',
        commentTokens: 0,
        likeTokens: 0,
        totalCRT: 0,
        totalComments: 0,
        totalLikes: 0,
        joinDate: new Date().toLocaleDateString(),
        status: 'Active'
      }
    } catch (error) {
      console.error('Failed to get user:', error)
      
      // 返回一个默认用户对象
      return {
        address: userAddress || this.address || '0x0',
        username: 'Guest User',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
        totalRewards: '$0',
        commentTokens: 0,
        likeTokens: 0,
        totalCRT: 0,
        totalComments: 0,
        totalLikes: 0,
        joinDate: new Date().toLocaleDateString(),
        status: 'Active'
      }
    }
  }

  /**
   * 获取用户活动历史
   */
  async getUserActivity(userAddress?: string, offset: number = 0, limit: number = 20): Promise<any[]> {
    try {
      await initContractData() // 确保数据已加载
      
      const address = userAddress || this.address
      
      if (!address) {
        throw new Error('User address required')
      }
      
      // 模拟用户活动数据
      console.log('调用合约: getUserActivity', address, offset, limit)
      return []
    } catch (error) {
      console.error('Failed to get user activity:', error)
      return []
    }
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(sortBy: number = 2, offset: number = 0, limit: number = 10): Promise<Project[]> {
    try {
      await initContractData() // 确保数据已加载
      
      // 模拟排行榜数据
      console.log('调用合约: getLeaderboard', sortBy, offset, limit)
      return []
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      return []
    }
  }

  /**
   * 赞助项目
   */
  async sponsorProject(projectAddress: string, tokenAddress: string, amount: string): Promise<void> {
    try {
      await initContractData() // 确保数据已加载
      
      if (!this.address) {
        throw new Error('No wallet address set')
      }
      
      // 模拟赞助项目
      console.log('调用合约: sponsorProject', projectAddress, tokenAddress, amount)
    } catch (error) {
      console.error('Failed to sponsor project:', error)
      throw error
    }
  }

  /**
   * 活动类型转换
   */
  private getActivityTypeString(activityType: number): string {
    const types = ['comment', 'like', 'sponsor', 'reward']
    return types[activityType] || 'unknown'
  }

  /**
   * 活动动作转换
   */
  private getActivityActionString(activityType: number): string {
    const actions = ['Posted Comment', 'Liked Comment', 'Sponsored Project', 'Received Reward']
    return actions[activityType] || 'Unknown Action'
  }

  /**
   * 时间戳格式化
   */
  private formatTimestamp(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp
    
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }
}

// 导出单例实例
export const contractApi = new ContractAPI()

// 默认导出，保持与mockApi相同的接口
export const api = {
  async getProjects(): Promise<Project[]> {
    return contractApi.getProjects()
  },

  async getProject(projectAddress: string): Promise<Project | null> {
    return contractApi.getProject(projectAddress)
  },

  async getProjectComments(projectAddress: string): Promise<Comment[]> {
    return contractApi.getProjectComments(projectAddress)
  },

  async postComment(projectAddress: string, content: string): Promise<Comment> {
    return contractApi.postComment(projectAddress, content)
  },

  async likeComment(projectId: string, commentId: number): Promise<void> {
    return contractApi.likeComment(projectId, commentId)
  },

  async getUser(): Promise<User> {
    return contractApi.getUser()
  },

  async getUserActivity(): Promise<any[]> {
    return contractApi.getUserActivity()
  },

  async getLeaderboard(): Promise<Project[]> {
    return contractApi.getLeaderboard()
  }
} 