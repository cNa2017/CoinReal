/**
 * Format wallet address
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
 * Format number with thousand separators
 */
export function formatNumber(num: number | string): string {
  if (typeof num === 'string') {
    num = parseFloat(num)
  }

  if (isNaN(num)) return '0'

  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'USDC',
  decimals: number = 2
): string {
  if (typeof amount === 'string') {
    amount = parseFloat(amount)
  }

  if (isNaN(amount)) return `0.00 ${currency}`

  return `${amount.toFixed(decimals)} ${currency}`
}

/**
 * Format time difference
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const target = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} days ago`
  }

  return target.toLocaleDateString('en-US')
}

/**
 * Truncate text and add ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}