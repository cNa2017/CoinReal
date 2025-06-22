import { Comment, ContractComment, ContractProjectData, Project, User } from '@/types'
import { Address, formatUnits, parseUnits } from 'viem'
import { readContract, writeContract } from 'wagmi/actions'
import { contractConfig } from './wagmi'

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

// 初始化状态跟踪
let initPromise: Promise<void> | null = null
let isInitialized = false
let initError: Error | null = null

// 初始化函数 - 加载合约ABI和部署信息
const initContractData = async () => {
  try {
    console.log('开始初始化合约数据...')
    
    // 尝试加载部署信息
    deploymentsInfo = await loadJSON('/deployments.json')
    if (!deploymentsInfo?.platform) {
      throw new Error('Deployments file missing platform address')
    }
    
    // 尝试加载ABI文件
    CoinRealPlatformABI = await loadJSON('/abi-json/CoinRealPlatform.json')
    if (!CoinRealPlatformABI || !Array.isArray(CoinRealPlatformABI)) {
      throw new Error('CoinRealPlatform ABI is invalid')
    }
    
    ProjectABI = await loadJSON('/abi-json/Project.json')
    ERC20ABI = await loadJSON('/abi-json/MockERC20.json')
    CRTTokenABI = await loadJSON('/abi-json/CRTToken.json')
    
    isInitialized = true
    initError = null
    console.log('合约数据初始化成功:', {
      platform: deploymentsInfo.platform,
      abiLoaded: !!CoinRealPlatformABI
    })
  } catch (error) {
    console.error('合约数据初始化失败:', error)
    isInitialized = false
    initError = error as Error
    
    console.warn('使用备用配置 - 部分功能可能无法正常工作')
    
    // 使用备用配置
    deploymentsInfo = {
      platform: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
      crtToken: "0xcafac3dd18ac6c6e92c921884f9e4176737c052c",
      priceOracle: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
      projectFactory: "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
      projects: {}
    }
    
    // 如果ABI加载失败，尝试重新加载或使用最小ABI
    if (!CoinRealPlatformABI) {
      console.warn('使用最小ABI用于基本功能')
      // 可以在这里设置最小的ABI用于基本功能
    }
    
    throw error
  }
}

// 确保初始化完成的函数
const ensureInitialized = async (): Promise<void> => {
  // 如果已经初始化成功，直接返回
  if (isInitialized) {
    console.log('合约数据已初始化，直接使用')
    return
  }
  
  // 如果已经有初始化Promise在进行中，等待它完成
  if (initPromise) {
    console.log('等待正在进行的初始化...')
    try {
      await initPromise
      console.log('初始化等待完成')
      return
    } catch (error) {
      // 如果之前的初始化失败，重新尝试
      console.log('之前的初始化失败，准备重新尝试...', error)
      initPromise = null // 清除失败的Promise
    }
  }
  
  // 创建新的初始化Promise
  console.log('创建新的初始化请求...')
  initPromise = initContractData()
  
  try {
    await initPromise
    console.log('初始化请求完成')
  } catch (error) {
    console.error('初始化失败:', error)
    // 即使初始化失败，也要清除Promise以便下次重试
    initPromise = null
    
    // 检查是否有备用数据可用
    if (deploymentsInfo?.platform && CoinRealPlatformABI) {
      console.log('虽然初始化过程中有错误，但基本数据可用，继续执行')
      isInitialized = true
      return
    }
    
    throw error
  }
}

// 数据转换函数
const convertContractProjectToFrontend = (contractData: ContractProjectData): Project => {
  // 安全地将 BigInt 转换为 number
  const safeToNumber = (value: any): number => {
    if (typeof value === 'bigint') {
      return Number(value)
    }
    if (typeof value === 'string') {
      return parseInt(value, 10) || 0
    }
    return Number(value) || 0
  }

  return {
    projectAddress: contractData.projectAddress,
    name: contractData.name,
    symbol: contractData.symbol,
    description: contractData.description,
    category: contractData.category,
    poolValueUSD: Math.floor(safeToNumber(contractData.poolValueUSD) / 1000000), // 从8位小数转为美分
    nextDrawTime: safeToNumber(contractData.nextDrawTime),
    totalParticipants: safeToNumber(contractData.totalParticipants),
    totalComments: safeToNumber(contractData.totalComments),
    totalLikes: safeToNumber(contractData.totalLikes),
    lastActivityTime: Math.floor(Date.now() / 1000), // 临时使用当前时间
    isActive: contractData.isActive,
    creator: '', // 需要单独查询
    website: '',
    whitepaper: '',
    colorIndex: Math.floor(Math.random() * 10),
    status: contractData.isActive ? "Active" : "Paused"
  }
}

const convertContractCommentToFrontend = (contractComment: ContractComment): Comment => {
  // 安全地将 BigInt 转换为 number
  const safeToNumber = (value: any): number => {
    if (typeof value === 'bigint') {
      return Number(value)
    }
    if (typeof value === 'string') {
      return parseInt(value, 10) || 0
    }
    return Number(value) || 0
  }

  // 安全地处理 CRT 奖励转换
  const convertCRTReward = (reward: any): number => {
    try {
      let bigIntReward: bigint
      if (typeof reward === 'bigint') {
        bigIntReward = reward
      } else {
        bigIntReward = BigInt(reward || 0)
      }
      return parseInt(formatUnits(bigIntReward, 18))
    } catch (error) {
      console.warn('Failed to convert CRT reward:', reward, error)
      return 0
    }
  }

  return {
    id: safeToNumber(contractComment.id),
    author: contractComment.author,
    content: contractComment.content,
    likes: safeToNumber(contractComment.likes),
    timestamp: safeToNumber(contractComment.timestamp),
    crtReward: convertCRTReward(contractComment.crtReward),
    isElite: contractComment.isElite,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${contractComment.author}`,
    verified: false,
    dislikes: 0
  }
}

/**
 * 真实合约API类
 * 使用固定的合约网络配置，与区块链合约进行真实交互
 */
export class WagmiContractAPI {
  private address: string | undefined = undefined
  private initialized: boolean = false

  constructor() {
    console.log('正在初始化 WagmiContractAPI...')
    // 立即启动初始化，确保initPromise被设置
    this.startInitialization()
  }

  private startInitialization() {
    if (!initPromise && !isInitialized) {
      console.log('启动合约数据初始化...')
      initPromise = initContractData()
      
      initPromise
        .then(() => {
          this.initialized = true
          console.log('WagmiContractAPI 初始化成功')
        })
        .catch((err) => {
          console.error('WagmiContractAPI 初始化失败:', err)
          console.warn('WagmiContractAPI 将以有限功能运行')
          // 清除失败的Promise，允许重试
          initPromise = null
        })
    }
  }

  /**
   * 设置当前用户钱包地址
   */
  setAddress(address: string | undefined): void {
    this.address = address
    console.log('用户地址设置为:', address || 'undefined')
  }
  
  /**
   * 获取所有项目列表（支持分页）
   */
  async getProjects(offset: number = 0, limit: number = 50): Promise<Project[]> {
    try {
      // 确保合约数据已初始化
      await ensureInitialized()
      
      // 验证必要的数据是否加载成功
      if (!deploymentsInfo?.platform) {
        console.error('Platform address not available')
        throw new Error('Contract data not loaded: missing platform address')
      }
      
      if (!CoinRealPlatformABI) {
        console.error('CoinRealPlatform ABI not available')
        throw new Error('Contract data not loaded: missing platform ABI')
      }

      console.log('Calling contract with:', {
        platform: deploymentsInfo.platform,
        hasABI: !!CoinRealPlatformABI,
        offset,
        limit
      })

      // 调用平台合约获取项目列表
      const result = await readContract(contractConfig, {
        address: deploymentsInfo.platform as Address,
        abi: CoinRealPlatformABI,
        functionName: 'getProjects',
        args: [BigInt(offset), BigInt(limit)]
      }) as any

      const [projectInfos, total] = result
      console.log('Contract returned:', { projectInfos: projectInfos?.length, total })

      // 如果没有项目，返回空数组
      if (!projectInfos || projectInfos.length === 0) {
        console.log('No projects found, returning empty array')
        return []
      }

      // 批量获取项目详细数据
      const projectAddresses = projectInfos.map((info: any) => info.projectAddress)
      const detailedData = await readContract(contractConfig, {
        address: deploymentsInfo.platform as Address,
        abi: CoinRealPlatformABI,
        functionName: 'batchGetProjectsData',
        args: [projectAddresses]
      }) as ContractProjectData[]

      // 转换数据格式
      const projects = detailedData.map(convertContractProjectToFrontend)
      console.log('Successfully converted projects:', projects.length)
      
      return projects
    } catch (error) {
      console.error('Failed to get projects:', error)
      console.log('Error details:', {
        hasDeployments: !!deploymentsInfo,
        platformAddress: deploymentsInfo?.platform,
        hasABI: !!CoinRealPlatformABI
      })
      
      // 返回空数组而不是抛出错误，让UI能够正常显示
      return []
    }
  }

  /**
   * 获取单个项目详情
   */
  async getProject(projectAddress: string): Promise<Project | null> {
    try {
      await ensureInitialized()
      
      if (!projectAddress || !projectAddress.startsWith('0x')) {
        return null
      }

      if (!ProjectABI) {
        throw new Error('Project ABI not loaded')
      }

              // 并行获取项目的所有基本信息
        const [name, symbol, description, category, isActive, creator, nextDrawTime] = await Promise.all([
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'name',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'symbol',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'description',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'category',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'isActive',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'creator',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'nextDrawTime',
            args: []
          })
        ])

        // 获取统计数据
        const [poolValueUSD, totalParticipants, totalComments, totalLikes] = await Promise.all([
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'getPoolValueUSD',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'getTotalParticipants',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'totalComments',
            args: []
          }),
          readContract(contractConfig, {
            address: projectAddress as Address,
            abi: ProjectABI,
            functionName: 'totalLikes',
            args: []
          })
        ])

        // 安全地将 BigInt 转换为 number
        const safeToNumber = (value: any): number => {
          if (typeof value === 'bigint') {
            return Number(value)
          }
          if (typeof value === 'string') {
            return parseInt(value, 10) || 0
          }
          return Number(value) || 0
        }

        // 构造项目对象
        const project: Project = {
          projectAddress,
          name: name as string,
          symbol: symbol as string,
          description: description as string,
          category: category as string,
          poolValueUSD: Math.floor(safeToNumber(poolValueUSD) / 1000000),
          nextDrawTime: safeToNumber(nextDrawTime),
          totalParticipants: safeToNumber(totalParticipants),
          totalComments: safeToNumber(totalComments),
          totalLikes: safeToNumber(totalLikes),
          lastActivityTime: Math.floor(Date.now() / 1000),
          isActive: isActive as boolean,
          creator: creator as string,
          website: '',
          whitepaper: '',
          colorIndex: Math.floor(Math.random() * 10),
          status: (isActive as boolean) ? "Active" : "Paused"
        }

        return project
    } catch (error) {
      console.error('Failed to get project:', error)
      return null
    }
  }

  /**
   * 获取项目评论列表
   */
  async getProjectComments(projectAddress: string, offset: number = 0, limit: number = 20): Promise<Comment[]> {
    try {
      await ensureInitialized()
      
      if (!ProjectABI) {
        throw new Error('Project ABI not loaded')
      }

      const result = await readContract(contractConfig, {
        address: projectAddress as Address,
        abi: ProjectABI,
        functionName: 'getComments',
        args: [BigInt(offset), BigInt(limit)]
      }) as [ContractComment[], bigint]

      console.log('项目评论原始数据:', result)

      // 正确解构合约返回的元组：[commentList, total]
      const [commentList, total] = result
      
      console.log('解析后的评论:', { commentList, total: total.toString() })

      // 只处理评论数组部分
      return commentList.map(convertContractCommentToFrontend)
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
      await ensureInitialized()
      
      if (!this.address) {
        throw new Error('No wallet address set')
      }

      if (!ProjectABI) {
        throw new Error('Project ABI not loaded')
      }

      // 调用合约发表评论
      const txHash = await writeContract(contractConfig, {
        address: projectAddress as Address,
        abi: ProjectABI,
        functionName: 'postComment',
        args: [content]
      })

      console.log('评论交易哈希:', txHash)

      // 返回新评论对象（临时生成，实际应该从事件中获取）
      const newComment: Comment = {
        id: Date.now(),
        author: this.address,
        content,
        likes: 0,
        timestamp: Math.floor(Date.now() / 1000),
        crtReward: 0,
        isElite: false,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.address}`,
        verified: false,
        dislikes: 0
      }

      return newComment
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
      await ensureInitialized()
      
      if (!this.address) {
        throw new Error('No wallet address set')
      }

      if (!ProjectABI) {
        throw new Error('Project ABI not loaded')
      }

      const txHash = await writeContract(contractConfig, {
        address: projectAddress as Address,
        abi: ProjectABI,
        functionName: 'likeComment',
        args: [BigInt(commentId)]
      })

      console.log('点赞交易哈希:', txHash)
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
      await ensureInitialized()
      
      const address = userAddress || this.address
      
      if (!address) {
        throw new Error('User address required')
      }

      if (!deploymentsInfo?.platform || !CoinRealPlatformABI) {
        throw new Error('Platform contract not loaded')
      }

      // 获取用户平台统计
      const userStats = await readContract(contractConfig, {
        address: deploymentsInfo.platform as Address,
        abi: CoinRealPlatformABI,
        functionName: 'getUserStats',
        args: [address as Address]
      }) as any

      console.log('用户统计:', userStats)

      // 获取CRT代币余额
      let crtBalance = BigInt(0)
      if (deploymentsInfo.crtToken && CRTTokenABI) {
        try {
          crtBalance = await readContract(contractConfig, {
            address: deploymentsInfo.crtToken as Address,
            abi: CRTTokenABI,
            functionName: 'balanceOf',
            args: [address as Address]
          }) as bigint
        } catch (error) {
          console.error('Failed to get CRT balance:', error)
        }
      }

      const [totalComments, totalLikes, totalRewardsUSD, commentTokens, likeTokens] = userStats

      // 安全地将 BigInt 转换为 number
      const safeToNumber = (value: any): number => {
        if (typeof value === 'bigint') {
          return Number(value)
        }
        if (typeof value === 'string') {
          return parseInt(value, 10) || 0
        }
        return Number(value) || 0
      }

      // 安全地处理 CRT 转换
      const safeCRTToNumber = (value: any): number => {
        try {
          let bigIntValue: bigint
          if (typeof value === 'bigint') {
            bigIntValue = value
          } else {
            bigIntValue = BigInt(value || 0)
          }
          return parseInt(formatUnits(bigIntValue, 18))
        } catch (error) {
          console.warn('Failed to convert CRT value:', value, error)
          return 0
        }
      }

      return {
        address: address as Address,
        username: `User_${address.slice(2, 8)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        totalRewards: `$${Math.floor(safeToNumber(totalRewardsUSD) / 1000000)}`,
        commentTokens: safeToNumber(commentTokens),
        likeTokens: safeToNumber(likeTokens),
        totalCRT: safeCRTToNumber(crtBalance),
        totalComments: safeToNumber(totalComments),
        totalLikes: safeToNumber(totalLikes),
        joinDate: new Date().toLocaleDateString(),
        status: 'Active'
      }
    } catch (error) {
      console.error('Failed to get user:', error)
      
      // 返回默认用户对象
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
      await ensureInitialized()
      
      const address = userAddress || this.address
      
      if (!address) {
        throw new Error('User address required')
      }

      if (!deploymentsInfo?.platform || !CoinRealPlatformABI) {
        throw new Error('Platform contract not loaded')
      }

      // 获取用户平台活动
      const activities = await readContract(contractConfig, {
        address: deploymentsInfo.platform as Address,
        abi: CoinRealPlatformABI,
        functionName: 'getUserPlatformActivity',
        args: [address as Address, BigInt(offset), BigInt(limit)]
      }) as any[]

      console.log('用户活动历史:', activities)

      // 安全地将 BigInt 转换为 number
      const safeToNumber = (value: any): number => {
        if (typeof value === 'bigint') {
          return Number(value)
        }
        if (typeof value === 'string') {
          return parseInt(value, 10) || 0
        }
        return Number(value) || 0
      }

      // 安全地处理 CRT 转换
      const safeCRTToNumber = (value: any): number => {
        try {
          let bigIntValue: bigint
          if (typeof value === 'bigint') {
            bigIntValue = value
          } else {
            bigIntValue = BigInt(value || 0)
          }
          return parseInt(formatUnits(bigIntValue, 18))
        } catch (error) {
          console.warn('Failed to convert CRT value:', value, error)
          return 0
        }
      }

      return activities.map((activity: any) => ({
        id: `${safeToNumber(activity.timestamp)}-${safeToNumber(activity.activityType)}`,
        type: this.getActivityTypeString(safeToNumber(activity.activityType)),
        action: this.getActivityActionString(safeToNumber(activity.activityType)),
        target: activity.details || 'Unknown',
        reward: `${safeCRTToNumber(activity.reward)} CRT`,
        timestamp: this.formatTimestamp(safeToNumber(activity.timestamp)),
        description: activity.details || ''
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
      await ensureInitialized()
      
      if (!deploymentsInfo?.platform || !CoinRealPlatformABI) {
        throw new Error('Platform contract not loaded')
      }

      // 获取项目排行榜
      const result = await readContract(contractConfig, {
        address: deploymentsInfo.platform as Address,
        abi: CoinRealPlatformABI,
        functionName: 'getProjectLeaderboard',
        args: [sortBy, BigInt(offset), BigInt(limit)]
      }) as any

      const [projectAddresses, stats] = result
      console.log('项目排行榜:', projectAddresses, stats)

      if (!projectAddresses || projectAddresses.length === 0) {
        return []
      }

      // 批量获取项目详细数据
      const detailedData = await readContract(contractConfig, {
        address: deploymentsInfo.platform as Address,
        abi: CoinRealPlatformABI,
        functionName: 'batchGetProjectsData',
        args: [projectAddresses]
      }) as ContractProjectData[]

      return detailedData.map(convertContractProjectToFrontend)
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      return []
    }
  }

  /**
   * 创建新项目
   */
  async createProject(projectData: {
    name: string
    symbol: string
    description: string
    category: string
    website: string
    whitepaper: string
    logoUrl: string
    drawPeriodDays: number
  }): Promise<string> {
    try {
      await ensureInitialized()
      
      if (!this.address) {
        throw new Error('No connected wallet')
      }

      if (!deploymentsInfo?.platform || !CoinRealPlatformABI) {
        throw new Error('Platform contract data not loaded')
      }

      // 调用平台合约创建项目
      const txHash = await writeContract(contractConfig, {
        address: deploymentsInfo.platform as Address,
        abi: CoinRealPlatformABI,
        functionName: 'createProject',
        args: [
          projectData.name,
          projectData.symbol,
          projectData.description,
          projectData.category,
          projectData.website,
          projectData.whitepaper,
          projectData.logoUrl,
          BigInt(projectData.drawPeriodDays * 24 * 60 * 60) // 转换为秒
        ]
      })
      
      console.log('Project created successfully, tx hash:', txHash)
      return txHash
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  /**
   * 赞助项目
   */
  async sponsorProject(projectAddress: string, tokenAddress: string, amount: string): Promise<void> {
    try {
      await ensureInitialized()
      
      if (!this.address) {
        throw new Error('No wallet address set')
      }

      if (!ProjectABI || !ERC20ABI) {
        throw new Error('Contract ABI not loaded')
      }

      // 首先授权代币转移
      const approveTx = await writeContract(contractConfig, {
        address: tokenAddress as Address,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [projectAddress as Address, parseUnits(amount, 18)]
      })

      console.log('代币授权交易哈希:', approveTx)

      // 然后调用项目合约的赞助功能
      const sponsorTx = await writeContract(contractConfig, {
        address: projectAddress as Address,
        abi: ProjectABI,
        functionName: 'sponsor',
        args: [tokenAddress as Address, parseUnits(amount, 18)]
      })

      console.log('赞助项目交易哈希:', sponsorTx)
    } catch (error) {
      console.error('Failed to sponsor project:', error)
      throw error
    }
  }

  // 辅助方法
  private getActivityTypeString(activityType: number): string {
    const types = ['comment', 'like', 'sponsor', 'reward']
    return types[activityType] || 'unknown'
  }

  private getActivityActionString(activityType: number): string {
    const actions = ['发表评论', '点赞评论', '赞助项目', '获得奖励']
    return actions[activityType] || '未知操作'
  }

  private formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString()
  }
}

// 导出单例实例
export const wagmiContractApi = new WagmiContractAPI()

// 默认导出，保持与原API相同的接口
export const api = {
  async getProjects(): Promise<Project[]> {
    return wagmiContractApi.getProjects()
  },

  async getProject(projectAddress: string): Promise<Project | null> {
    return wagmiContractApi.getProject(projectAddress)
  },

  async getProjectComments(projectAddress: string): Promise<Comment[]> {
    return wagmiContractApi.getProjectComments(projectAddress)
  },

  async postComment(projectAddress: string, content: string): Promise<Comment> {
    return wagmiContractApi.postComment(projectAddress, content)
  },

  async likeComment(projectId: string, commentId: number): Promise<void> {
    return wagmiContractApi.likeComment(projectId, commentId)
  },

  async getUser(): Promise<User> {
    return wagmiContractApi.getUser()
  },

  async getUserActivity(): Promise<any[]> {
    return wagmiContractApi.getUserActivity()
  },

  async getLeaderboard(): Promise<Project[]> {
    return wagmiContractApi.getLeaderboard()
  }
}