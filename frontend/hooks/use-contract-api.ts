import { getContractNetworkInfo, isContractNetwork } from '@/config/networks'
import { wagmiContractApi } from '@/lib/wagmi-contract-api'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'
import { useWagmiSync } from './use-wagmi-sync'

/**
 * 使用合约API的hook
 * 自动将当前连接的钱包地址绑定到合约API
 * 使用同步机制确保连接状态一致性，避免水合错误
 */
export function useContractApi() {
  const chainId = useChainId()
  const contractNetworkInfo = getContractNetworkInfo()
  
  // 使用新的同步机制
  const { 
    isReady, 
    isReconnecting, 
    isConnecting,
    syncedAddress, 
    syncedIsConnected 
  } = useWagmiSync()

  // 使用 useMemo 确保返回的对象引用稳定，防止无限循环
  const contractApiData = useMemo(() => {
    return {
      contractApi: wagmiContractApi,
      isConnected: syncedIsConnected,
      address: syncedAddress,
      userChainId: chainId,
      contractChainId: contractNetworkInfo.chainId,
      contractNetwork: contractNetworkInfo.name,
      isOnContractNetwork: isContractNetwork(chainId),
      // 只有连接完全就绪且在正确网络才能写操作
      canWrite: isReady && syncedIsConnected && isContractNetwork(chainId),
      canRead: true, // 始终可以读取合约数据
      // 添加连接状态信息用于调试
      connectionStatus: {
        isReady,
        isReconnecting,
        isConnecting,
        hasAddress: !!syncedAddress,
        isOnCorrectNetwork: isContractNetwork(chainId)
      }
    }
  }, [
    syncedIsConnected,
    syncedAddress,
    chainId,
    contractNetworkInfo.chainId,
    contractNetworkInfo.name,
    isReady,
    isReconnecting,
    isConnecting
  ])

  return contractApiData
} 