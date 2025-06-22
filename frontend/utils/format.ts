/**
 * 格式化钱包地址
 */
export function formatAddress(
  address?: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address) return ''
  if (address.length <= startLength + endLength) return address
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * 格式化数字，添加千分位分隔符
 */
export function formatNumber(num: number | string): string {
  if (typeof num === 'string') {
    num = parseFloat(num)
  }
  
  if (isNaN(num)) return '0'
  
  return new Intl.NumberFormat('zh-CN').format(num)
}

/**
 * 格式化货币金额
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'USDC',
  decimals: number = 2
): string {
  if (typeof amount === 'string') {
    amount = parseFloat(amount)
  }
  
  if (isNaN(amount)) return `0 ${currency}`
  
  return `${amount.toFixed(decimals)} ${currency}`
}

/**
 * 格式化时间差
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const target = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}小时前`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}天前`
  }
  
  return target.toLocaleDateString('zh-CN')
}

/**
 * 截断文本并添加省略号
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}