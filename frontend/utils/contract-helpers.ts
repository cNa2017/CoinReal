import { PROJECT_COLORS } from "@/types"

/**
 * Contract data conversion utility functions
 * Used for conversion between frontend display fields and contract fields
 */

// Time format conversion: Unix timestamp to relative time
export function formatTimeLeft(nextDrawTime: number): string {
  const now = Math.floor(Date.now() / 1000)
  const difference = nextDrawTime - now

  if (difference <= 0) return "Ended"

  const days = Math.floor(difference / (24 * 60 * 60))
  const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((difference % (60 * 60)) / 60)
  const seconds = difference % 60

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

// Debug: Detailed time information display
export function formatTimeLeftDetailed(nextDrawTime: number, label: string = ""): string {
  const now = Math.floor(Date.now() / 1000)
  const difference = nextDrawTime - now

  const debugInfo = {
    label,
    currentTime: now,
    targetTime: nextDrawTime,
    difference,
    currentDate: new Date(now * 1000).toLocaleString('en-US'),
    targetDate: new Date(nextDrawTime * 1000).toLocaleString('en-US'),
    isExpired: difference <= 0
  }

  console.log('⏰ Time calculation details:', debugInfo)

  if (difference <= 0) return "Ended"

  const days = Math.floor(difference / (24 * 60 * 60))
  const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((difference % (60 * 60)) / 60)
  const seconds = difference % 60

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

// Time format conversion: Unix timestamp to relative time description
export function formatTimestamp(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const difference = now - timestamp

  if (difference < 60) return "just now"
  if (difference < 3600) return `${Math.floor(difference / 60)} minutes ago`
  if (difference < 86400) return `${Math.floor(difference / 3600)} hours ago`
  if (difference < 604800) return `${Math.floor(difference / 86400)} days ago`

  return new Date(timestamp * 1000).toLocaleDateString()
}

// Amount format conversion: 8-decimal USD to dollar display
export function formatPoolValue(poolValueUSD: number): string {
  // Contract returns 8-decimal precision USD value, need to divide by 10^8 to convert to standard dollars
  const dollars = poolValueUSD / 100000000
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

// Generate color index based on project address
export function getProjectColorIndex(projectAddress: string): number {
  // Use the last few characters of the address to generate color index
  const hash = projectAddress.slice(-8)
  const num = parseInt(hash, 16)
  return num % PROJECT_COLORS.length
}

// Get project color class
export function getProjectColor(projectAddress: string): string {
  const index = getProjectColorIndex(projectAddress)
  return PROJECT_COLORS[index]
}

// Generate default avatar URL
export function generateDefaultAvatar(address: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
}

// Shorten wallet address display
export function shortenAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Determine if user is an elite user (frontend helper function)
export function checkIsEliteUser(userStats: {totalComments: number, totalLikes: number, totalCRT: number}): boolean {
  // Simple elite user judgment logic, should actually get from contract's getEliteComments
  return userStats.totalCRT > 1000 || userStats.totalComments > 50
}

// CRT Token format display (handle 18-decimal precision)
export function formatCRTAmount(amount: number): string {
  // CRT Token uses 18-decimal precision, need to divide by 10^18
  const crtAmount = amount / Math.pow(10, 18)

  if (crtAmount >= 1000000) {
    return `${(crtAmount / 1000000).toFixed(1)}M CRT`
  }
  if (crtAmount >= 1000) {
    return `${(crtAmount / 1000).toFixed(1)}K CRT`
  }
  return `${crtAmount.toFixed(0)} CRT`
}

// Project status calculation (based on contract data)
export function calculateProjectStatus(isActive: boolean, nextDrawTime: number): "Active" | "New" | "Paused" | "Ended" {
  const now = Math.floor(Date.now() / 1000)

  if (!isActive) return "Paused"
  if (nextDrawTime <= now) return "Ended"

  // If it's a newly created project (long time until lottery), mark as New
  const timeLeft = nextDrawTime - now
  const sevenDays = 7 * 24 * 60 * 60

  if (timeLeft > sevenDays) return "New"
  return "Active"
}

// Validate contract address format
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
    flag: contractComment.flag || 0, // Comment tags: 0=no tag, 1=positive, 2=negative, 3=neutral

    // Frontend-specific fields
    avatar: generateDefaultAvatar(contractComment.author),
    verified: false,
    dislikes: 0,
  }
} 