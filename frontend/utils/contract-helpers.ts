import { PROJECT_COLORS } from "@/types"

/**
 * 合约数据转换工具函数
 * 用于在前端展示字段和合约字段之间进行转换
 */

// 时间格式转换：Unix时间戳转相对时间
export function formatTimeLeft(nextDrawTime: number): string {
  const now = Math.floor(Date.now() / 1000)
  const difference = nextDrawTime - now

  if (difference <= 0) return "已结束"

  const days = Math.floor(difference / (24 * 60 * 60))
  const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((difference % (60 * 60)) / 60)
  const seconds = difference % 60

  if (days > 0) return `${days}天`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  if (minutes > 0) return `${minutes}分钟${seconds}秒`
  return `${seconds}秒`
}

// 调试用：详细的时间信息显示
export function formatTimeLeftDetailed(nextDrawTime: number, label: string = ""): string {
  const now = Math.floor(Date.now() / 1000)
  const difference = nextDrawTime - now
  
  const debugInfo = {
    label,
    currentTime: now,
    targetTime: nextDrawTime,
    difference,
    currentDate: new Date(now * 1000).toLocaleString('zh-CN'),
    targetDate: new Date(nextDrawTime * 1000).toLocaleString('zh-CN'),
    isExpired: difference <= 0
  }
  
  console.log('⏰ 时间计算详情:', debugInfo)
  
  if (difference <= 0) return "已结束"

  const days = Math.floor(difference / (24 * 60 * 60))
  const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((difference % (60 * 60)) / 60)
  const seconds = difference % 60

  if (days > 0) return `${days}天`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  if (minutes > 0) return `${minutes}分钟${seconds}秒`
  return `${seconds}秒`
}

// 时间格式转换：Unix时间戳转相对时间描述
export function formatTimestamp(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const difference = now - timestamp
  
  if (difference < 60) return "just now"
  if (difference < 3600) return `${Math.floor(difference / 60)} minutes ago`
  if (difference < 86400) return `${Math.floor(difference / 3600)} hours ago`
  if (difference < 604800) return `${Math.floor(difference / 86400)} days ago`
  
  return new Date(timestamp * 1000).toLocaleDateString()
}

// 金额格式转换：8位小数USD转美元显示
export function formatPoolValue(poolValueUSD: number): string {
  // 合约返回8位小数精度的USD值，需要除以10^8转换为标准美元
  const dollars = poolValueUSD / 100000000
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars)
}

// 根据项目地址生成颜色索引
export function getProjectColorIndex(projectAddress: string): number {
  // 使用地址的最后几位字符生成颜色索引
  const hash = projectAddress.slice(-8)
  const num = parseInt(hash, 16)
  return num % PROJECT_COLORS.length
}

// 获取项目颜色类
export function getProjectColor(projectAddress: string): string {
  const index = getProjectColorIndex(projectAddress)
  return PROJECT_COLORS[index]
}

// 生成默认头像URL
export function generateDefaultAvatar(address: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
}

// 缩短钱包地址显示
export function shortenAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 判断用户是否为精英用户（前端辅助函数）
export function checkIsEliteUser(userStats: {totalComments: number, totalLikes: number, totalCRT: number}): boolean {
  // 简单的精英用户判断逻辑，实际应该从合约的 getEliteComments 获取
  return userStats.totalCRT > 1000 || userStats.totalComments > 50
}

// CRT Token 格式化显示（处理18位小数精度）
export function formatCRTAmount(amount: number): string {
  // CRT Token使用18位小数精度，需要除以10^18
  const crtAmount = amount / Math.pow(10, 18)
  
  if (crtAmount >= 1000000) {
    return `${(crtAmount / 1000000).toFixed(1)}M CRT`
  }
  if (crtAmount >= 1000) {
    return `${(crtAmount / 1000).toFixed(1)}K CRT`
  }
  return `${crtAmount.toFixed(0)} CRT`
}

// 项目状态计算（基于合约数据）
export function calculateProjectStatus(isActive: boolean, nextDrawTime: number): "Active" | "New" | "Paused" | "Ended" {
  const now = Math.floor(Date.now() / 1000)
  
  if (!isActive) return "Paused"
  if (nextDrawTime <= now) return "Ended"
  
  // 如果是新创建的项目（距离开奖时间很长），标记为New
  const timeLeft = nextDrawTime - now
  const sevenDays = 7 * 24 * 60 * 60
  
  if (timeLeft > sevenDays) return "New" 
  return "Active"
}

// 验证合约地址格式
export function isValidContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// 为前端组件准备项目显示数据
export function prepareProjectForDisplay(contractProject: any) {
  return {
    ...contractProject,
    // 修正字段名映射
    poolValueUSD: contractProject.currentPoolUSD || contractProject.poolValueUSD || 0,
    colorIndex: getProjectColorIndex(contractProject.projectAddress),
    timeLeft: formatTimeLeft(contractProject.nextDrawTime),
    pool: formatPoolValue(contractProject.currentPoolUSD || contractProject.poolValueUSD || 0),
    status: calculateProjectStatus(contractProject.isActive, contractProject.nextDrawTime),
    // 如果合约没有返回这些字段，使用默认值
    website: contractProject.website || "",
    whitepaper: contractProject.whitepaper || "",
  }
}

// 为前端组件准备评论显示数据
export function prepareCommentForDisplay(contractComment: any) {
  return {
    ...contractComment,
    avatar: contractComment.avatar || generateDefaultAvatar(contractComment.author),
    timeAgo: formatTimestamp(contractComment.timestamp),
    crtRewardFormatted: formatCRTAmount(contractComment.crtReward),
    authorShort: shortenAddress(contractComment.author),
    // dislikes 暂不实现
    dislikes: contractComment.dislikes || 0,
  }
}

// 为前端组件准备用户显示数据  
export function prepareUserForDisplay(contractUser: any) {
  return {
    ...contractUser,
    avatar: contractUser.avatar || generateDefaultAvatar(contractUser.address),
    username: contractUser.username || shortenAddress(contractUser.address),
    totalCRTFormatted: formatCRTAmount(contractUser.totalCRT),
    isElite: checkIsEliteUser({
      totalComments: contractUser.totalComments,
      totalLikes: contractUser.totalLikes, 
      totalCRT: contractUser.totalCRT
    }),
  }
}

// 转换合约项目数据到前端格式
export function convertContractProjectToFrontend(contractData: any): any {
  return {
    projectAddress: contractData.projectAddress,
    name: contractData.name,
    symbol: contractData.symbol,
    description: contractData.description,
    category: contractData.category,
    // 合约返回8位小数USD，前端期望整数美分，需要除以10^6
    poolValueUSD: Math.floor((contractData.currentPoolUSD || contractData.poolValueUSD || 0) / 1000000),
    nextDrawTime: contractData.nextDrawTime,
    totalParticipants: contractData.totalParticipants,
    totalComments: contractData.totalComments,
    totalLikes: contractData.totalLikes,
    lastActivityTime: contractData.lastActivityTime,
    isActive: contractData.isActive,
    creator: contractData.creator,
    
    // 前端特有字段
    website: "",
    whitepaper: "",
    colorIndex: getProjectColorIndex(contractData.projectAddress),
    status: calculateProjectStatus(contractData.isActive, contractData.nextDrawTime),
  }
}

// 转换合约用户数据到前端格式
export function convertContractUserToFrontend(contractData: any): any {
  return {
    address: contractData.address,
    username: shortenAddress(contractData.address),
    avatar: generateDefaultAvatar(contractData.address),
    // 处理奖励金额格式
    totalRewards: formatPoolValue(contractData.claimedRewards || 0),
    commentTokens: contractData.commentTokens ? Math.floor(contractData.commentTokens / Math.pow(10, 18)) : 0,
    likeTokens: contractData.likeTokens ? Math.floor(contractData.likeTokens / Math.pow(10, 18)) : 0,
    totalCRT: contractData.totalCRT ? Math.floor(contractData.totalCRT / Math.pow(10, 18)) : 0,
    totalComments: contractData.totalComments || 0,
    totalLikes: contractData.totalLikes || 0,
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    status: checkIsEliteUser(contractData) ? "Elite" : "Active",
    badge: contractData.badge || "",
  }
}

// 批量转换项目数据
export function batchConvertProjectsForFrontend(contractProjects: any[]): any[] {
  return contractProjects.map(convertContractProjectToFrontend)
}

// 转换合约评论数据到前端格式
export function convertContractCommentToFrontend(contractComment: any): any {
  return {
    id: contractComment.id,
    author: contractComment.author,
    content: contractComment.content,
    likes: contractComment.likes,
    timestamp: contractComment.timestamp,
    crtReward: Math.floor(contractComment.crtReward / Math.pow(10, 18)),
    isElite: contractComment.isElite,
    flag: contractComment.flag || 0, // 评论标签：0无标签，1积极，2消极，3中立
    
    // 前端特有字段
    avatar: generateDefaultAvatar(contractComment.author),
    verified: false,
    dislikes: 0,
  }
} 