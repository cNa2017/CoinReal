import { PROJECT_COLORS } from "@/types"

/**
 * 合约数据转换工具函数
 * 用于在前端展示字段和合约字段之间进行转换
 */

// 时间格式转换：Unix时间戳转相对时间
export function formatTimeLeft(nextDrawTime: number): string {
  const now = Math.floor(Date.now() / 1000)
  const difference = nextDrawTime - now
  
  if (difference <= 0) return "Already drawn"
  
  const days = Math.floor(difference / (24 * 60 * 60))
  const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60))
  
  if (days > 0) return `${days} days`
  if (hours > 0) return `${hours} hours`
  return "Less than 1 hour"
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

// 金额格式转换：美分转美元显示
export function formatPoolValue(poolValueUSD: number): string {
  const dollars = poolValueUSD / 100
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

// CRT Token 格式化显示
export function formatCRTAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M CRT`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K CRT`
  }
  return `${amount} CRT`
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
    colorIndex: getProjectColorIndex(contractProject.projectAddress),
    timeLeft: formatTimeLeft(contractProject.nextDrawTime),
    pool: formatPoolValue(contractProject.poolValueUSD),
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
    // 保留dislikes作为mock数据
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