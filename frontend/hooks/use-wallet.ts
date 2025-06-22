import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi'

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, error: switchError } = useSwitchChain()
  const { data: balance } = useBalance({ address })

  const connectWallet = async () => {
    const connector = connectors[0]
    if (connector) {
      connect({ connector })
    }
  }

  const disconnectWallet = () => {
    disconnect()
  }

  const switchNetwork = (targetChainId: number) => {
    switchChain({ chainId: targetChainId as any })
  }

  const formatAddress = (addr?: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    // 状态
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    chainId,
    balance,
    
    // 操作
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    // 工具函数
    formatAddress,
    
    // 错误
    connectError,
    switchError,
    
    // 连接器
    connectors,
  }
} 