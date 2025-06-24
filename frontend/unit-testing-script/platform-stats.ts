import { deployments, loadABI, publicClient } from './config'

/**
 * 查看平台统计信息
 */
async function viewPlatformStats() {
  console.log('\n📊 === 平台统计信息 ===')
  
  try {
    const platformABI = loadABI('CoinRealPlatform')
    
    // 获取平台统计
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
    
    // 获取项目列表
    const projects = await publicClient.readContract({
      address: deployments.platform as `0x${string}`,
      abi: platformABI,
      functionName: 'getProjects',
      args: [BigInt(0), BigInt(10)], // offset, limit
    }) as any
    
    console.log(`\n📋 项目列表 (前10个):`)
    projects[0].forEach((project: any, index: number) => {
      console.log(`${index + 1}. ${project.name || '未知项目'} (${project.symbol || 'N/A'})`)
      console.log(`   地址: ${project.projectAddress}`)
      console.log(`   分类: ${project.category || '未分类'}`)
      
      // 安全处理description字段
      const description = project.description || '暂无描述'
      const displayDescription = description.length > 50 
        ? description.substring(0, 50) + '...' 
        : description
      console.log(`   描述: ${displayDescription}`)
      console.log('')
    })
    
    // 获取项目排行榜
    const leaderboard = await publicClient.readContract({
      address: deployments.platform as `0x${string}`,
      abi: platformABI,
      functionName: 'getProjectLeaderboard',
      args: [0, BigInt(0), BigInt(5)], // sortBy: 0-参与人数, offset, limit
    }) as any
    
    console.log(`🏆 项目排行榜 (按参与人数):`)
    if (leaderboard[0] && leaderboard[0].length > 0) {
      leaderboard[0].forEach((projectAddress: string, index: number) => {
        const stat = leaderboard[1][index]
        console.log(`${index + 1}. 项目: ${projectAddress}`)
        console.log(`   参与人数: ${stat}`)
      })
    } else {
      console.log('   暂无排行榜数据')
    }
    
  } catch (error) {
    console.error('❌ 获取平台统计失败:', error)
  }
}

// 运行脚本
if (require.main === module) {
  viewPlatformStats()
} 