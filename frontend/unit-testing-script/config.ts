import * as fs from 'fs'
import * as path from 'path'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { avalancheFuji } from 'viem/chains'

// 配置
export const CONFIG = {
  // 私钥（默认使用Anvil第一个账户）
  PRIVATE_KEY: process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  // RPC URL
  RPC_URL: process.env.RPC_URL || 'https://avax-fuji.g.alchemy.com/v2/CpC-pTO3q4uONZfB6uxlQ',
  // 网络
  CHAIN: avalancheFuji,
  // CHAIN: anvil,
}

// 创建账户
export const account = privateKeyToAccount(CONFIG.PRIVATE_KEY as `0x${string}`)

// 创建客户端
export const publicClient = createPublicClient({
  chain: CONFIG.CHAIN,
  transport: http(CONFIG.RPC_URL),
})

export const walletClient = createWalletClient({
  account,
  chain: CONFIG.CHAIN,
  transport: http(CONFIG.RPC_URL),
})

// 部署信息
export const deployments = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public/deployments.json'), 'utf-8')
)

// ABI加载器
export function loadABI(contractName: string) {
  const abiPath = path.join(process.cwd(), `public/abi-json/${contractName}.json`)
  return JSON.parse(fs.readFileSync(abiPath, 'utf-8'))
}

console.log('🔧 测试配置:')
console.log(`📍 网络: ${CONFIG.CHAIN.name}`)
console.log(`🔗 RPC: ${CONFIG.RPC_URL}`)
console.log(`👤 账户: ${account.address}`)
console.log(`📄 部署网络: ${deployments.network}`) 