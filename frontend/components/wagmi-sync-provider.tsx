'use client'

import { useWagmiSync } from '@/hooks/use-wagmi-sync'
import { ReactNode, useEffect } from 'react'

interface WagmiSyncProviderProps {
  children: ReactNode
}

/**
 * Wagmi同步提供者组件
 * 在应用级别确保钱包连接状态的正确同步
 * 处理页面刷新后的重连和状态恢复
 */
export function WagmiSyncProvider({ children }: WagmiSyncProviderProps) {
  const { 
    isReady, 
    isReconnecting, 
    isConnecting,
    syncedAddress, 
    syncedIsConnected,
  } = useWagmiSync()

  useEffect(() => {
    // 在开发环境下输出连接状态信息，便于调试
    if (process.env.NODE_ENV === 'development') {
      console.log('WagmiSync状态:', {
        isReady,
        isReconnecting,
        isConnecting,
        hasAddress: !!syncedAddress,
        isConnected: syncedIsConnected
      })
    }
  }, [isReady, isReconnecting, isConnecting, syncedAddress, syncedIsConnected])

  return <>{children}</>
} 