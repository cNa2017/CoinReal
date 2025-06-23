'use client'

import { wagmiContractApi } from '@/lib/wagmi-contract-api'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

/**
 * Wagmi连接状态同步Hook
 * 确保钱包连接状态在contractApi中正确同步
 * 处理页面刷新后的重连问题
 */
export function useWagmiSync() {
  const { address, isConnected, isReconnecting, isConnecting } = useAccount()
  
  useEffect(() => {
    // 等待重连和连接过程完成后再同步状态
    if (!isReconnecting && !isConnecting) {
      if (isConnected && address) {
        console.log('Wagmi同步: 设置用户地址', address)
        wagmiContractApi.setAddress(address)
      } else {
        console.log('Wagmi同步: 清除用户地址')
        wagmiContractApi.setAddress(undefined)
      }
    } else {
      console.log('Wagmi同步: 等待连接完成...', { isReconnecting, isConnecting })
    }
  }, [address, isConnected, isReconnecting, isConnecting])
  
  // 返回连接是否完全就绪的状态
  const isReady = !isReconnecting && !isConnecting
  
  return { 
    isReady,
    isReconnecting,
    isConnecting,
    syncedAddress: isReady ? address : undefined,
    syncedIsConnected: isReady ? isConnected : false
  }
} 