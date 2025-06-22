import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { config } from './wagmi'

// 创建查询客户端
const queryClient = new QueryClient()

interface WagmiProviderWrapperProps {
  children: ReactNode
}

/**
 * WagmiProviderWrapper组件
 * 为应用提供Wagmi上下文，使合约API可以在应用中使用
 */
export function WagmiProviderWrapper({ children }: WagmiProviderWrapperProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default WagmiProviderWrapper 