import { anvil, arbitrum, avalancheFuji, bsc, mainnet, polygon, sepolia } from 'wagmi/chains'

export type SupportedChain = {
  id: number
  name: string
  symbol: string
  color: string
  chain: any
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: anvil.id,
    name: "Anvil 本地网络",
    symbol: "ETH",
    color: "bg-orange-500",
    chain: anvil,
  },
  {
    id: mainnet.id,
    name: "以太坊主网",
    symbol: "ETH",
    color: "bg-blue-500",
    chain: mainnet,
  },
  {
    id: sepolia.id,
    name: "Sepolia 测试网",
    symbol: "ETH",
    color: "bg-blue-400",
    chain: sepolia,
  },
  {
    id: avalancheFuji.id,
    name: "Avalanche Fuji 测试网",
    symbol: "AVAX",
    color: "bg-red-500",
    chain: avalancheFuji,
  },
  {
    id: polygon.id,
    name: "Polygon",
    symbol: "MATIC",
    color: "bg-purple-500",
    chain: polygon,
  },
  {
    id: bsc.id,
    name: "BSC",
    symbol: "BNB",
    color: "bg-yellow-500",
    chain: bsc,
  },
  {
    id: arbitrum.id,
    name: "Arbitrum",
    symbol: "ARB",
    color: "bg-cyan-500",
    chain: arbitrum,
  },
] as const

export const DEFAULT_CHAIN = mainnet

export const getChainById = (chainId: number) => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId)
} 