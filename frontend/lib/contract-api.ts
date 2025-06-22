import { Comment, Project, User } from '@/types'
import {
    batchConvertProjectsForFrontend,
    convertContractCommentToFrontend,
    convertContractProjectToFrontend,
    convertContractUserToFrontend
} from '@/utils/contract-helpers'

// 合约地址配置 - 从deployments.json或环境变量中获取
const CONTRACT_ADDRESSES = {
  platform: process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  crtToken: process.env.NEXT_PUBLIC_CRT_TOKEN_ADDRESS || "0xcafac3dd18ac6c6e92c921884f9e4176737c052c",
  priceOracle: process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS || "0x5fbdb2315678afecb367f032d93f642f64180aa3"
}

// Web3 相关配置（这里需要根据实际使用的Web3库进行调整）
// 比如使用wagmi、ethers、web3.js等

/**
 * 真实合约API类
 * 替代mockApi，与区块链合约进行真实交互
 */
export class ContractAPI {
  private platformContract: any
  private provider: any
  private signer: any

  constructor() {
    // 初始化Web3连接
    // this.provider = new ethers.providers.JsonRpcProvider(RPC_URL)
    // this.platformContract = new ethers.Contract(CONTRACT_ADDRESSES.platform, ABI, this.provider)
  }

  /**
   * 获取所有项目列表（支持分页）
   */
  async getProjects(offset: number = 0, limit: number = 50): Promise<Project[]> {
    try {
      // 调用合约的getProjects方法
      const { projects, total } = await this.platformContract.getProjects(offset, limit)
      
      // 批量获取详细数据
      const projectAddresses = projects.map((p: any) => p.projectAddress)
      const detailedData = await this.platformContract.batchGetProjectsData(projectAddresses)
      
      // 转换为前端格式
      return batchConvertProjectsForFrontend(detailedData)
    } catch (error) {
      console.error('Failed to get projects:', error)
      // 降级到mock数据或抛出错误
      throw error
    }
  }

  /**
   * 获取单个项目详情
   */
  async getProject(projectAddress: string): Promise<Project | null> {
    try {
      // 使用批量获取接口获取单个项目数据
      const detailedData = await this.platformContract.batchGetProjectsData([projectAddress])
      
      if (detailedData.length === 0) {
        return null
      }
      
      return convertContractProjectToFrontend(detailedData[0])
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
      // 获取项目合约实例
      const projectContract = this.getProjectContract(projectAddress)
      
      // 调用合约的getComments方法
      const { comments } = await projectContract.getComments(offset, limit)
      
      // 转换为前端格式
      return comments.map(convertContractCommentToFrontend)
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
      if (!this.signer) {
        throw new Error('No wallet connected')
      }

      const projectContract = this.getProjectContract(projectAddress)
      
      // 调用合约的postComment方法
      const tx = await projectContract.postComment(content)
      const receipt = await tx.wait()
      
      // 从事件中获取评论ID
      const event = receipt.events?.find((e: any) => e.event === 'CommentPosted')
      const commentId = event?.args?.commentId
      
      // 获取新创建的评论
      const comment = await projectContract.getComment(commentId)
      
      return convertContractCommentToFrontend(comment)
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
      if (!this.signer) {
        throw new Error('No wallet connected')
      }

      const projectContract = this.getProjectContract(projectAddress)
      
      // 调用合约的likeComment方法
      const tx = await projectContract.likeComment(commentId)
      await tx.wait()
    } catch (error) {
      console.error('Failed to like comment:', error)
      throw error
    }
  }

  /**
   * 获取用户信息
   */
  async getUser(userAddress: string): Promise<User> {
    try {
      // 获取用户参与的项目
      const userProjects = await this.platformContract.getUserProjects(userAddress)
      
      // 汇总用户在所有项目中的数据
      let totalComments = 0
      let totalLikes = 0
      let totalCRT = 0
      let commentTokens = 0
      let likeTokens = 0
      let claimedRewards = 0

      for (const projectAddress of userProjects) {
        const projectContract = this.getProjectContract(projectAddress)
        
        // 获取用户在该项目的统计
        const userStats = await projectContract.getUserStats(userAddress)
        const crtBreakdown = await projectContract.getUserCRTBreakdown(userAddress)
        
        totalComments += userStats.totalComments
        totalLikes += userStats.totalLikes
        totalCRT += userStats.totalCRT
        commentTokens += crtBreakdown.commentTokens
        likeTokens += crtBreakdown.likeTokens
        claimedRewards += userStats.claimedRewards
      }

      // 构造用户数据
      const userData = {
        address: userAddress,
        totalComments,
        totalLikes,
        totalCRT,
        commentTokens,
        likeTokens,
        claimedRewards
      }

      return convertContractUserToFrontend(userData)
    } catch (error) {
      console.error('Failed to get user:', error)
      throw error
    }
  }

  /**
   * 获取用户活动历史
   */
  async getUserActivity(userAddress: string, offset: number = 0, limit: number = 20): Promise<any[]> {
    try {
      // 调用平台合约的getUserPlatformActivity方法
      const activities = await this.platformContract.getUserPlatformActivity(userAddress, offset, limit)
      
      // 转换为前端期望的格式
      return activities.map((activity: any) => ({
        id: `${activity.projectAddress}-${activity.timestamp}`,
        type: this.getActivityTypeString(activity.activityType),
        action: this.getActivityActionString(activity.activityType),
        target: activity.details,
        reward: `+${Math.floor(activity.reward / Math.pow(10, 18))} CRT`,
        timestamp: this.formatTimestamp(activity.timestamp),
        description: activity.details
      }))
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
      // 调用合约的getProjectLeaderboard方法
      const { projects, stats } = await this.platformContract.getProjectLeaderboard(sortBy, offset, limit)
      
      // 获取详细数据
      const detailedData = await this.platformContract.batchGetProjectsData(projects)
      
      return batchConvertProjectsForFrontend(detailedData)
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
      if (!this.signer) {
        throw new Error('No wallet connected')
      }

      const projectContract = this.getProjectContract(projectAddress)
      
      // 先批准代币转账
      const tokenContract = this.getTokenContract(tokenAddress)
      const approveTx = await tokenContract.approve(projectAddress, amount)
      await approveTx.wait()
      
      // 调用赞助方法
      const sponsorTx = await projectContract.sponsor(tokenAddress, amount)
      await sponsorTx.wait()
    } catch (error) {
      console.error('Failed to sponsor project:', error)
      throw error
    }
  }

  /**
   * 获取项目合约实例
   */
  private getProjectContract(projectAddress: string): any {
    // 返回项目合约实例
    // return new ethers.Contract(projectAddress, PROJECT_ABI, this.signer || this.provider)
    return null // 临时返回
  }

  /**
   * 获取代币合约实例
   */
  private getTokenContract(tokenAddress: string): any {
    // 返回ERC20代币合约实例
    // return new ethers.Contract(tokenAddress, ERC20_ABI, this.signer)
    return null // 临时返回
  }

  /**
   * 设置签名者（当用户连接钱包时调用）
   */
  setSigner(signer: any): void {
    this.signer = signer
    // 重新初始化需要签名的合约实例
    // this.platformContract = new ethers.Contract(CONTRACT_ADDRESSES.platform, ABI, this.signer)
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

  async likeComment(commentId: number): Promise<void> {
    // 注意：这里需要项目地址，需要从上下文中获取
    throw new Error('likeComment requires project address - use contractApi.likeComment instead')
  },

  async getUser(): Promise<User> {
    // 需要从钱包获取当前用户地址
    const userAddress = '0x742d35Cc6634C0532925a3b8D391E00b0BaE93A1' // 临时地址
    return contractApi.getUser(userAddress)
  },

  async getUserActivity(): Promise<any[]> {
    const userAddress = '0x742d35Cc6634C0532925a3b8D391E00b0BaE93A1' // 临时地址
    return contractApi.getUserActivity(userAddress)
  },

  async getLeaderboard(): Promise<Project[]> {
    return contractApi.getLeaderboard()
  }
} 