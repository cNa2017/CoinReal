import { Campaign, Comment, ContractComment, CreateCampaignParams, Project, User, UserCampaignCRT } from '@/types'
import { Address, formatUnits, parseUnits } from 'viem'
import { readContract, writeContract } from 'wagmi/actions'
import { contractConfig } from './wagmi'

// 动态导入JSON文件
const loadJSON = async (path: string) => {
  try {
    // 在客户端和服务端使用不同的URL处理方式
    let url: string
    
    if (typeof window !== 'undefined') {
      // 客户端环境：使用相对路径
      url = path
    } else {
      // 服务端环境：使用完整URL
      url = `http://localhost:3000${path}`
    }
    
    console.log(`Loading JSON from: ${url} (${typeof window !== 'undefined' ? 'client' : 'server'} side)`)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
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
let CampaignABI: any = null
let CampaignFactoryABI: any = null

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
    // CRTTokenABI = await loadJSON('/abi-json/CRTToken.json')
    CampaignABI = await loadJSON('/abi-json/Campaign.json')
    CampaignFactoryABI = await loadJSON('/abi-json/CampaignFactory.json')
    
    isInitialized = true
    initError = null
    console.log('合约数据初始化成功:', {
      platform: deploymentsInfo.platform,
      campaignFactory: deploymentsInfo.campaignFactory,
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
  // 只在客户端环境执行初始化
  if (typeof window === 'undefined') {
    console.log('服务端环境，跳过合约初始化')
    return
  }
  
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
    flag: safeToNumber(contractComment.flag) || 0, // 评论标签：0无标签，1积极，2消极，3中立
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${contractComment.author}`,
    verified: false,
    dislikes: 0
  }
}

/**
 * 通用的写合约函数，带有连接器重试机制
 * 解决页面刷新后 connection.connector.getChainId is not a function 的问题
 */
const writeContractWithRetry = async (contractCallConfig: any, maxRetries: number = 3): Promise<string> => {
  let attempt = 0
  
  while (attempt < maxRetries) {
    try {
      // 等待连接器完全初始化（根据重试次数递增等待时间）
      if (attempt > 0) {
        const waitTime = 300 * attempt
        console.log(`等待连接器就绪: ${waitTime}ms (重试 ${attempt}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }

      console.log(`尝试写合约操作 (第${attempt + 1}次尝试)`)
      
      // 使用用户配置，因为连接状态在userConfig中管理
      const { userConfig } = await import('./wagmi')
      const txHash = await writeContract(userConfig, contractCallConfig)
      console.log('交易哈希:', txHash)
      return txHash
      
    } catch (error: any) {
      attempt++
      
      // 检查是否是连接器未就绪的错误
      const isConnectorError = error.message?.includes('getChainId is not a function') ||
                              error.message?.includes('connector') ||
                              error.name === 'ConnectorNotFoundError'
      
      if (isConnectorError && attempt < maxRetries) {
        console.warn(`连接器未就绪，准备重试 ${attempt}/${maxRetries}:`, error.message)
        continue
      }
      
      // 其他错误或达到最大重试次数，直接抛出
      console.error(`写合约操作失败 (尝试 ${attempt}/${maxRetries}):`, error)
      
      // 提供更友好的错误信息
      if (error.message?.includes('getChainId is not a function')) {
        throw new Error('钱包连接状态异常，请刷新页面后重试')
      } else if (error.message?.includes('User rejected')) {
        throw new Error('用户取消了交易')
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('余额不足')
      }
      
      throw error
    }
  }
  
  // 如果所有重试都失败了
  throw new Error('连接器状态异常，请刷新页面后重试')
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
    // 只在客户端环境启动初始化
    if (typeof window === 'undefined') {
      console.log('服务端环境，延迟合约初始化')
      return
    }
    
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
   * 获取合约数据（供hooks使用）
   */
  async getContractData() {
    await ensureInitialized()
    
    if (!deploymentsInfo || !CoinRealPlatformABI) {
      return null
    }

    return {
      platform: deploymentsInfo.platform,
      campaignFactory: deploymentsInfo.campaignFactory,
      projectFactory: deploymentsInfo.projectFactory,
      priceOracle: deploymentsInfo.priceOracle,
      tokens: deploymentsInfo.tokens,
      CoinRealPlatformABI,
      ProjectABI,
      ERC20ABI,
      CampaignABI,
      CampaignFactoryABI
    }
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

      // 确保ProjectABI已加载
      if (!ProjectABI) {
        console.error('Project ABI not available')
        throw new Error('Project ABI not loaded')
      }

      // 为每个项目获取详细数据
      const projects: Project[] = []
      
      for (const projectInfo of projectInfos) {
        try {
          // 获取项目的详细信息
          const projectAddress = projectInfo.projectAddress

          // 并行获取项目的详细数据
          const [description, category, totalComments, totalLikes, projectStats, poolValueUSD, nextDrawTime] = await Promise.all([
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
              functionName: 'totalComments',
              args: []
            }),
            readContract(contractConfig, {
              address: projectAddress as Address,
              abi: ProjectABI,
              functionName: 'totalLikes',
              args: []
            }),
            readContract(contractConfig, {
              address: projectAddress as Address,
              abi: ProjectABI,
              functionName: 'getProjectStats',
              args: []
            }),
            readContract(contractConfig, {
              address: projectAddress as Address,
              abi: ProjectABI,
              functionName: 'getPoolValueUSD',
              args: []
            }),
            readContract(contractConfig, {
              address: projectAddress as Address,
              abi: ProjectABI,
              functionName: 'nextDrawTime',
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

          // 从projectStats中提取数据 [totalParticipants, totalLikes, lastActivityTime, currentPoolUSD]
          const statsArray = Array.isArray(projectStats) ? projectStats : []
          const totalParticipants = statsArray[0] ? safeToNumber(statsArray[0]) : 0
          const lastActivityTime = statsArray[2] ? safeToNumber(statsArray[2]) : Math.floor(Date.now() / 1000)

          // 构造项目对象
          const project: Project = {
            projectAddress: projectInfo.projectAddress,
            name: projectInfo.name,
            symbol: projectInfo.symbol,
            description: description as string,
            category: category as string,
            poolValueUSD: Math.floor(safeToNumber(poolValueUSD) / 1000000), // 从8位小数转为美分
            nextDrawTime: safeToNumber(nextDrawTime),
            totalParticipants,
            totalComments: safeToNumber(totalComments),
            totalLikes: safeToNumber(totalLikes),
            lastActivityTime,
            isActive: projectInfo.isActive,
            creator: projectInfo.creator,
            website: '',
            whitepaper: '',
            colorIndex: Math.floor(Math.random() * 10),
            status: projectInfo.isActive ? "Active" : "Paused"
          }

          projects.push(project)
        } catch (error) {
          console.error(`Failed to get details for project ${projectInfo.projectAddress}:`, error)
          // 如果获取详细信息失败，创建一个基本的项目对象
          const basicProject: Project = {
            projectAddress: projectInfo.projectAddress,
            name: projectInfo.name,
            symbol: projectInfo.symbol,
            description: 'Description not available',
            category: 'Unknown',
            poolValueUSD: 0,
            nextDrawTime: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
            totalParticipants: 0,
            totalComments: 0,
            totalLikes: 0,
            lastActivityTime: Math.floor(Date.now() / 1000),
            isActive: projectInfo.isActive,
            creator: projectInfo.creator,
            website: '',
            whitepaper: '',
            colorIndex: Math.floor(Math.random() * 10),
            status: projectInfo.isActive ? "Active" : "Paused"
          }
          projects.push(basicProject)
        }
      }

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
   * 使用通用重试机制避免连接器状态异常
   */
  async postComment(projectAddress: string, content: string): Promise<Comment> {
    try {
      await ensureInitialized()
      
      if (!this.address) {
        throw new Error('钱包未连接，请先连接钱包')
      }

      if (!ProjectABI) {
        throw new Error('合约ABI未加载')
      }

      // 调用合约发表评论
      const txHash = await writeContractWithRetry({
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
        flag: 0, // 新评论默认无标签
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.address}`,
        verified: false,
        dislikes: 0
      }

      return newComment
    } catch (error: any) {
      console.error('Failed to post comment:', error)
      throw error
    }
  }

  /**
   * 点赞评论
   * 使用通用重试机制避免连接器状态异常
   */
  async likeComment(projectAddress: string, commentId: number): Promise<void> {
    try {
      await ensureInitialized()
      
      if (!this.address) {
        throw new Error('钱包未连接，请先连接钱包')
      }

      if (!ProjectABI) {
        throw new Error('合约ABI未加载')
      }

      await writeContractWithRetry({
        address: projectAddress as Address,
        abi: ProjectABI,
        functionName: 'likeComment',
        args: [BigInt(commentId)]
      })

    } catch (error: any) {
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

      // 确保ProjectABI已加载
      if (!ProjectABI) {
        throw new Error('Project ABI not loaded')
      }

      // 为每个项目地址获取详细数据
      const projects: Project[] = []
      
      for (let i = 0; i < projectAddresses.length; i++) {
        try {
          const projectAddress = projectAddresses[i]
          
          // 并行获取项目的基本信息和详细数据
          const [name, symbol, description, category, creator, isActive, totalComments, totalLikes, projectStats, poolValueUSD, nextDrawTime] = await Promise.all([
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
              functionName: 'creator',
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
              functionName: 'totalComments',
              args: []
            }),
            readContract(contractConfig, {
              address: projectAddress as Address,
              abi: ProjectABI,
              functionName: 'totalLikes',
              args: []
            }),
            readContract(contractConfig, {
              address: projectAddress as Address,
              abi: ProjectABI,
              functionName: 'getProjectStats',
              args: []
            }),
            readContract(contractConfig, {
              address: projectAddress as Address,
              abi: ProjectABI,
              functionName: 'getPoolValueUSD',
              args: []
            }),
            readContract(contractConfig, {
              address: projectAddress as Address,
              abi: ProjectABI,
              functionName: 'nextDrawTime',
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

          // 从projectStats中提取数据
          const statsArray = Array.isArray(projectStats) ? projectStats : []
          const totalParticipants = statsArray[0] ? safeToNumber(statsArray[0]) : 0
          const lastActivityTime = statsArray[2] ? safeToNumber(statsArray[2]) : Math.floor(Date.now() / 1000)

          // 构造项目对象
          const project: Project = {
            projectAddress,
            name: name as string,
            symbol: symbol as string,
            description: description as string,
            category: category as string,
            poolValueUSD: Math.floor(safeToNumber(poolValueUSD) / 1000000),
            nextDrawTime: safeToNumber(nextDrawTime),
            totalParticipants,
            totalComments: safeToNumber(totalComments),
            totalLikes: safeToNumber(totalLikes),
            lastActivityTime,
            isActive: isActive as boolean,
            creator: creator as string,
            website: '',
            whitepaper: '',
            colorIndex: Math.floor(Math.random() * 10),
            status: (isActive as boolean) ? "Active" : "Paused"
          }

          projects.push(project)
        } catch (error) {
          console.error(`Failed to get details for project ${projectAddresses[i]}:`, error)
          // 跳过获取失败的项目
        }
      }

      return projects
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      return []
    }
  }

  /**
   * 创建项目
   * 使用通用重试机制避免连接器状态异常
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
        throw new Error('钱包未连接，请先连接钱包')
      }

      if (!deploymentsInfo?.platform || !CoinRealPlatformABI) {
        throw new Error('平台合约数据未加载')
      }

      // 调用平台合约创建项目
      const txHash = await writeContractWithRetry({
        address: deploymentsInfo.platform as Address,
        abi: CoinRealPlatformABI,
        functionName: 'createProject',
        args: [
          projectData.name,
          projectData.symbol,
          projectData.description,
          projectData.category,
          projectData.drawPeriodDays // 直接传递天数，合约期望uint16类型
        ]
      })
      
      console.log('Project created successfully, tx hash:', txHash)
      return txHash
    } catch (error: any) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  /**
   * 赞助项目
   * 使用通用重试机制避免连接器状态异常
   */
  async sponsorProject(projectAddress: string, tokenAddress: string, amount: string): Promise<void> {
    try {
      await ensureInitialized()
      
      if (!this.address) {
        throw new Error('钱包未连接，请先连接钱包')
      }

      if (!ProjectABI || !ERC20ABI) {
        throw new Error('合约ABI未加载')
      }

      // 首先授权代币转移
      const approveTx = await writeContractWithRetry({
        address: tokenAddress as Address,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [projectAddress as Address, parseUnits(amount, 18)]
      })

      console.log('代币授权交易哈希:', approveTx)

      // 然后调用项目合约的赞助功能
      const sponsorTx = await writeContractWithRetry({
        address: projectAddress as Address,
        abi: ProjectABI,
        functionName: 'sponsor',
        args: [tokenAddress as Address, parseUnits(amount, 18)]
      })

      console.log('赞助项目交易哈希:', sponsorTx)
    } catch (error: any) {
      console.error('Failed to sponsor project:', error)
      throw error
    }
  }

  /**
   * 创建Campaign
   * 使用通用重试机制避免连接器状态异常
   */
  async createCampaign(params: CreateCampaignParams): Promise<string> {
    try {
      await ensureInitialized()
      
      if (!this.address) {
        throw new Error('钱包未连接，请先连接钱包')
      }

      if (!deploymentsInfo?.campaignFactory || !CampaignFactoryABI || !ERC20ABI) {
        throw new Error('Campaign工厂合约数据未加载')
      }

      const { projectAddress, sponsorName, duration, rewardToken, rewardAmount, rewardTokenDecimals } = params

      // 首先授权代币转移给CampaignFactory
      const approveTx = await writeContractWithRetry({
        address: rewardToken as Address,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [deploymentsInfo.campaignFactory as Address, parseUnits(rewardAmount, rewardTokenDecimals)]
      })

      console.log('代币授权交易哈希:', approveTx)

      // 调用CampaignFactory创建Campaign
      const createTx = await writeContractWithRetry({
        address: deploymentsInfo.campaignFactory as Address,
        abi: CampaignFactoryABI,
        functionName: 'createCampaign',
        args: [
          projectAddress as Address,
          sponsorName,
          BigInt(duration),
          rewardToken as Address,
          parseUnits(rewardAmount, rewardTokenDecimals)
        ]
      })

      console.log('Campaign创建交易哈希:', createTx)
      return createTx
    } catch (error: any) {
      console.error('Failed to create campaign:', error)
      throw error
    }
  }

  /**
   * 获取项目的所有Campaign
   */
  async getProjectCampaigns(projectAddress: string): Promise<Campaign[]> {
    try {
      await ensureInitialized()
      
      if (!deploymentsInfo?.campaignFactory || !CampaignFactoryABI) {
        throw new Error('Campaign factory contract data not loaded')
      }

      // 获取项目的Campaign地址列表
      const campaignAddresses = await readContract(contractConfig, {
        address: deploymentsInfo.campaignFactory as Address,
        abi: CampaignFactoryABI,
        functionName: 'getProjectCampaigns',
        args: [projectAddress as Address]
      }) as Address[]

      if (!campaignAddresses || campaignAddresses.length === 0) {
        return []
      }

      // 批量获取Campaign详情
      const campaigns: Campaign[] = []
      for (const campaignAddress of campaignAddresses) {
        try {
          const campaign = await this.getCampaignDetails(campaignAddress)
          if (campaign) {
            campaigns.push(campaign)
          }
        } catch (error) {
          console.error(`Failed to get campaign details for ${campaignAddress}:`, error)
        }
      }

      return campaigns
    } catch (error) {
      console.error('Failed to get project campaigns:', error)
      return []
    }
  }

  /**
   * 获取Campaign详细信息
   */
  async getCampaignDetails(campaignAddress: string): Promise<Campaign | null> {
    try {
      await ensureInitialized()
      
      if (!CampaignABI) {
        throw new Error('Campaign ABI not loaded')
      }

      // 获取Campaign基本信息
      const [
        projectAddress, sponsor, sponsorName, startTime, endTime,
        isActive, rewardsDistributed, rewardToken, totalRewardPool,
        totalComments, totalLikes, name, symbol, totalSupply
      ] = await Promise.all([
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'projectAddress',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'sponsor',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'sponsorName',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'startTime',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'endTime',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'isCurrentlyActive',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'rewardsDistributed',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'rewardToken',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'totalRewardPool',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'totalComments',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'totalLikes',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'name',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'symbol',
          args: []
        }),
        readContract(contractConfig, {
          address: campaignAddress as Address,
          abi: CampaignABI,
          functionName: 'totalSupply',
          args: []
        })
      ])

      // 获取奖励代币信息（新增）
      let rewardTokenName = ''
      let rewardTokenSymbol = ''
      let rewardTokenDecimals = 18
      
      try {
        if (ERC20ABI && rewardToken !== '0x0000000000000000000000000000000000000000') {
          const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
            readContract(contractConfig, {
              address: rewardToken as Address,
              abi: ERC20ABI,
              functionName: 'name',
              args: []
            }),
            readContract(contractConfig, {
              address: rewardToken as Address,
              abi: ERC20ABI,
              functionName: 'symbol',
              args: []
            }),
            readContract(contractConfig, {
              address: rewardToken as Address,
              abi: ERC20ABI,
              functionName: 'decimals',
              args: []
            })
          ])
          
          rewardTokenName = tokenName as string
          rewardTokenSymbol = tokenSymbol as string  
          rewardTokenDecimals = Number(tokenDecimals)
        }
      } catch (error) {
        console.error('Failed to get reward token info:', error)
        // 使用默认值，不影响主要功能
      }

      // 获取参与者数量
      const campaignStats = await readContract(contractConfig, {
        address: campaignAddress as Address,
        abi: CampaignABI,
        functionName: 'getCampaignStats',
        args: []
      }) as [bigint, bigint, bigint, bigint, bigint]

      const [totalParticipants, , , , remainingTime] = campaignStats

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

      const campaign: Campaign = {
        address: campaignAddress,
        projectAddress: projectAddress as string,
        sponsor: sponsor as string,
        sponsorName: sponsorName as string,
        startTime: safeToNumber(startTime),
        endTime: safeToNumber(endTime),
        isActive: isActive as boolean,
        rewardsDistributed: rewardsDistributed as boolean,
        rewardToken: rewardToken as string,
        totalRewardPool: safeToNumber(totalRewardPool),
        totalComments: safeToNumber(totalComments),
        totalLikes: safeToNumber(totalLikes),
        totalParticipants: safeToNumber(totalParticipants),
        name: name as string,
        symbol: symbol as string,
        totalSupply: safeToNumber(totalSupply),
        remainingTime: safeToNumber(remainingTime),
        // 新增的奖励代币信息
        rewardTokenName,
        rewardTokenSymbol,
        rewardTokenDecimals
      }

      return campaign
    } catch (error) {
      console.error('Failed to get campaign details:', error)
      return null
    }
  }

  /**
   * 获取用户在项目所有Campaign中的CRT详情
   */
  async getUserCampaignCRTDetails(projectAddress: string, userAddress?: string): Promise<UserCampaignCRT[]> {
    try {
      await ensureInitialized()
      
      const address = userAddress || this.address
      if (!address) {
        throw new Error('User address required')
      }

      if (!ProjectABI) {
        throw new Error('Project ABI not loaded')
      }

      // 调用Project合约的getUserCampaignCRTDetails方法
      const result = await readContract(contractConfig, {
        address: projectAddress as Address,
        abi: ProjectABI,
        functionName: 'getUserCampaignCRTDetails',
        args: [address as Address]
      }) as [Address[], bigint[], bigint[], bigint[], bigint[]]

      const [campaignAddresses, commentCRTs, likeCRTs, totalCRTs, pendingRewards] = result

      // 转换数据格式
      const userCampaignCRTs: UserCampaignCRT[] = []
      for (let i = 0; i < campaignAddresses.length; i++) {
        const campaignAddress = campaignAddresses[i]
        
        // 获取用户在该Campaign中的CRT代币余额
        let crtBalance = BigInt(0)
        try {
          if (CampaignABI) {
            crtBalance = await readContract(contractConfig, {
              address: campaignAddress,
              abi: CampaignABI,
              functionName: 'balanceOf',
              args: [address as Address]
            }) as bigint
          }
        } catch (error) {
          console.error(`Failed to get CRT balance for ${campaignAddress}:`, error)
        }

        // 获取奖励代币信息（新增）
        let tokenSymbol = ''
        let tokenDecimals = 18
        try {
          if (CampaignABI && ERC20ABI) {
            // 先获取奖励代币地址
            const rewardToken = await readContract(contractConfig, {
              address: campaignAddress,
              abi: CampaignABI,
              functionName: 'rewardToken',
              args: []
            }) as string

            if (rewardToken !== '0x0000000000000000000000000000000000000000') {
              // 获取代币符号和精度
              const [symbol, decimals] = await Promise.all([
                readContract(contractConfig, {
                  address: rewardToken as Address,
                  abi: ERC20ABI,
                  functionName: 'symbol',
                  args: []
                }),
                readContract(contractConfig, {
                  address: rewardToken as Address,
                  abi: ERC20ABI,
                  functionName: 'decimals',
                  args: []
                })
              ])
              
              tokenSymbol = symbol as string
              tokenDecimals = Number(decimals)
            }
          }
        } catch (error) {
          console.error(`Failed to get reward token info for ${campaignAddress}:`, error)
        }

        userCampaignCRTs.push({
          campaignAddress: campaignAddress,
          commentCRT: Number(commentCRTs[i]),
          likeCRT: Number(likeCRTs[i]),
          totalCRT: Number(totalCRTs[i]),
          pendingReward: Number(pendingRewards[i]),
          crtBalance: Number(crtBalance),
          // 新增的奖励代币信息
          tokenSymbol,
          tokenDecimals
        })
      }

      return userCampaignCRTs
    } catch (error) {
      console.error('Failed to get user campaign CRT details:', error)
      return []
    }
  }

  /**
   * 用户领取Campaign奖励
   * 使用通用重试机制避免连接器状态异常
   */
  async claimCampaignReward(campaignAddress: string): Promise<string> {
    try {
      await ensureInitialized()

      if (!this.address) {
        throw new Error('钱包未连接，请先连接钱包')
      }

      if (!CampaignABI) {
        throw new Error('Campaign ABI未加载')
      }

      const txHash = await writeContractWithRetry({
        address: campaignAddress as Address,
        abi: CampaignABI,
        functionName: 'claimRewards',
        args: []
      })

      console.log('领取奖励交易哈希:', txHash)
      return txHash
    } catch (error: any) {
      console.error('Failed to claim campaign reward:', error)
      throw error
    }
  }

  /**
   * Campaign开奖 - 分配奖励
   * 使用通用重试机制避免连接器状态异常
   */
  async distributeCampaignRewards(campaignAddress: string): Promise<string> {
    try {
      await ensureInitialized()

      if (!this.address) {
        throw new Error('钱包未连接，请先连接钱包')
      }

      if (!CampaignABI) {
        throw new Error('Campaign ABI未加载')
      }

      const txHash = await writeContractWithRetry({
        address: campaignAddress as Address,
        abi: CampaignABI,
        functionName: 'distributeRewards',
        args: []
      })

      console.log('Campaign开奖交易哈希:', txHash)
      return txHash
    } catch (error: any) {
      console.error('Failed to distribute campaign rewards:', error)
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
  },

  async getProjectCampaigns(projectAddress: string): Promise<Campaign[]> {
    return wagmiContractApi.getProjectCampaigns(projectAddress)
  },

  async getUserCampaignCRTDetails(projectAddress: string, userAddress?: string): Promise<UserCampaignCRT[]> {
    return wagmiContractApi.getUserCampaignCRTDetails(projectAddress, userAddress)
  },

  async claimCampaignReward(campaignAddress: string): Promise<string> {
    return wagmiContractApi.claimCampaignReward(campaignAddress)
  },

  async distributeCampaignRewards(campaignAddress: string): Promise<string> {
    return wagmiContractApi.distributeCampaignRewards(campaignAddress)
  },

  async createCampaign(params: CreateCampaignParams): Promise<string> {
    return wagmiContractApi.createCampaign(params)
  }
}