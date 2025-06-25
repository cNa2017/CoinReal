import { anvil, avalancheFuji, sepolia } from 'wagmi/chains'

/**
 * 合约部署网络配置
 * 当前使用 anvil 本地网络，将来可能切换到 sepolia 测试网
 */
export const CONTRACT_NETWORK = avalancheFuji // 可切换为 sepolia

/**
 * 支持的合约网络列表
 */
export const SUPPORTED_CONTRACT_NETWORKS = {
  anvil,
  sepolia,
  avalancheFuji
} as const

/**
 * 网络显示名称
 */
export const NETWORK_NAMES = {
  [anvil.id]: 'Anvil Local',
  [sepolia.id]: 'Sepolia Testnet',
  [avalancheFuji.id]: 'Avalanche Fuji Testnet'
} as const

/**
 * 获取当前合约网络信息
 */
export function getContractNetworkInfo() {
  return {
    chain: CONTRACT_NETWORK,
    name: NETWORK_NAMES[CONTRACT_NETWORK.id],
    chainId: CONTRACT_NETWORK.id
  }
}

/**
 * 检查网络是否为合约网络
 */
export function isContractNetwork(chainId: number) {
  return chainId === CONTRACT_NETWORK.id
} 