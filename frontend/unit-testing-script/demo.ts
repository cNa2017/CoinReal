import * as fs from 'fs'
import * as path from 'path'
import { createPublicClient, http } from 'viem'
import { anvil } from 'viem/chains'

// 简化配置
const publicClient = createPublicClient({
  chain: anvil,
  transport: http('http://127.0.0.1:8545'),
})

// 读取部署信息
const deployments = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public/deployments.json'), 'utf-8')
)

// 读取ABI
function loadABI(contractName: string) {
  const abiPath = path.join(process.cwd(), `public/abi-json/${contractName}.json`)
  return JSON.parse(fs.readFileSync(abiPath, 'utf-8'))
}

async function demo() {
  console.log('🚀 CoinReal 合约状态演示')
  console.log('═'.repeat(50))
  
  try {
    // 1. 测试平台统计
    console.log('\n📊 1. 平台统计信息')
    console.log('─'.repeat(30))
    
    const platformABI = loadABI('CoinRealPlatform')
    const stats = await publicClient.readContract({
      address: deployments.platform as `0x${string}`,
      abi: platformABI,
      functionName: 'getPlatformStats',
      args: [],
    }) as any
    
    console.log(`🏗️  总项目数: ${stats[0]}`)
    console.log(`👥 总用户数: ${stats[1]}`)
    console.log(`💬 总评论数: ${stats[2]}`)
    console.log(`💰 总奖池价值: $${stats[3]}`)
    
    // 2. 测试项目列表
    console.log('\n📋 2. 项目列表')
    console.log('─'.repeat(30))
    
    const projects = await publicClient.readContract({
      address: deployments.platform as `0x${string}`,
      abi: platformABI,
      functionName: 'getProjects',
      args: [BigInt(0), BigInt(5)],
    }) as any
    
    console.log(`找到 ${projects[0].length} 个项目:`)
    projects[0].forEach((project: any, index: number) => {
      console.log(`${index + 1}. ${project.name} (${project.symbol})`)
      console.log(`   📍 地址: ${project.projectAddress}`)
      console.log(`   🏷️  分类: ${project.category}`)
    })
    
    // 3. 测试单个项目详情
    console.log('\n🎯 3. 项目详情 (Bitcoin)')
    console.log('─'.repeat(30))
    
    const btcProject = deployments.projects.btc
    const projectABI = loadABI('Project')
    
    const projectStats = await publicClient.readContract({
      address: btcProject.address as `0x${string}`,
      abi: projectABI,
      functionName: 'getProjectStats',
      args: [],
    }) as any
    
    console.log(`📛 项目名称: ${btcProject.name}`)
    console.log(`👥 参与人数: ${projectStats[0]}`)
    console.log(`👍 总点赞数: ${projectStats[1]}`)
    console.log(`⏰ 最后活动: ${new Date(Number(projectStats[2]) * 1000).toLocaleString()}`)
    
    // 4. 测试Campaign信息
    console.log('\n🎪 4. Campaign信息')
    console.log('─'.repeat(30))
    
    const campaigns = await publicClient.readContract({
      address: btcProject.address as `0x${string}`,
      abi: projectABI,
      functionName: 'getCampaigns',
      args: [],
    }) as string[]
    
    console.log(`🎪 关联Campaign数量: ${campaigns.length}`)
    if (campaigns.length > 0) {
      campaigns.forEach((campaign, index) => {
        console.log(`   ${index + 1}. ${campaign}`)
      })
    } else {
      console.log('   暂无Campaign')
    }
    
    // 5. 测试评论列表
    console.log('\n💬 5. 评论列表')
    console.log('─'.repeat(30))
    
    const comments = await publicClient.readContract({
      address: btcProject.address as `0x${string}`,
      abi: projectABI,
      functionName: 'getComments',
      args: [BigInt(0), BigInt(5)],
    }) as any
    
    console.log(`📝 评论总数: ${comments[1]}`)
    if (comments[0].length > 0) {
      comments[0].forEach((comment: any, index: number) => {
        console.log(`${index + 1}. ID: ${comment.id}`)
        console.log(`   👤 作者: ${comment.author}`)
        console.log(`   💬 内容: ${comment.content}`)
        console.log(`   👍 点赞: ${comment.likes}`)
        console.log(`   📅 时间: ${new Date(Number(comment.timestamp) * 1000).toLocaleString()}`)
      })
    } else {
      console.log('   暂无评论')
    }
    
    console.log('\n✅ 演示完成!')
    
  } catch (error) {
    console.error('❌ 演示失败:', error)
    
    // 提供调试信息
    console.log('\n🔍 调试信息:')
    console.log(`📍 平台地址: ${deployments.platform}`)
    console.log(`📍 BTC项目地址: ${deployments.projects.btc?.address}`)
    console.log(`🔗 RPC: http://127.0.0.1:8545`)
    
    // 检查网络连接
    try {
      const blockNumber = await publicClient.getBlockNumber()
      console.log(`📦 当前区块: ${blockNumber}`)
    } catch (networkError) {
      console.log('❌ 网络连接失败，请确保Anvil正在运行')
    }
  }
}

// 运行演示
demo() 