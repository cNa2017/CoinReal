import { CONTRACT_NETWORK } from '@/config/networks'
import { createConfig, http } from 'wagmi'
import { anvil, avalancheFuji, mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

/**
 * 合约交互配置
 * 固定使用配置文件中指定的网络，用于所有合约读写操作
 */
export const contractConfig = createConfig({
  chains: [CONTRACT_NETWORK],
  connectors: [
    injected(),
  ],
  transports: {
    [CONTRACT_NETWORK.id]: http(),
  },
})

/**
 * 用户钱包配置  
 * 支持多网络，跟随用户钱包网络，用于获取用户余额等信息
 */
export const userConfig = createConfig({
  chains: [mainnet, sepolia, anvil, avalancheFuji],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [anvil.id]: http(),
    [avalancheFuji.id]: http(),
  },
})

/**
 * 默认导出用户配置（用于wagmi provider）
 */
export const config = userConfig

/**
 * 获取合约交互配置
 */
export function getContractConfig() {
  return contractConfig
}

/**
 * 获取用户配置
 */
export function getUserConfig() {
  return userConfig
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
} 