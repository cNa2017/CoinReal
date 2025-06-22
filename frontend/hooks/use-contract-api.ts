import { getContractNetworkInfo, isContractNetwork } from '@/config/networks'
import { wagmiContractApi } from '@/lib/wagmi-contract-api'
import { useEffect, useMemo } from 'react'
import { useAccount, useChainId } from 'wagmi'

/**
 * 使用合约API的hook
 * 自动将当前连接的钱包地址绑定到合约API
 * 使用 useMemo 防止无限重新渲染
 */
export function useContractApi() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const contractNetworkInfo = getContractNetworkInfo()

  useEffect(() => {
    if (isConnected && address) {
      wagmiContractApi.setAddress(address)
    } else {
      wagmiContractApi.setAddress(undefined)
    }
  }, [address, isConnected])

  // 使用 useMemo 确保返回的对象引用稳定，防止无限循环
  const contractApiData = useMemo(() => {
    return {
      contractApi: wagmiContractApi,
      isConnected,
      address,
      userChainId: chainId,
      contractChainId: contractNetworkInfo.chainId,
      contractNetwork: contractNetworkInfo.name,
      isOnContractNetwork: isContractNetwork(chainId),
      canWrite: isConnected && isContractNetwork(chainId), // 只有连接且在正确网络才能写操作
      canRead: true // 始终可以读取合约数据
    }
  }, [
    isConnected, 
    address, 
    chainId, 
    contractNetworkInfo.chainId, 
    contractNetworkInfo.name
  ])

  return contractApiData
} 