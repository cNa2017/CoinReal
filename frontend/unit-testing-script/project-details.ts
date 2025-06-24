import { deployments, loadABI, publicClient } from './config'

/**
 * 查看项目详情和评论
 */
async function viewProjectDetails(projectKey?: string) {
  console.log('\n📝 === 项目详情和评论 ===')
  
  try {
    const projectABI = loadABI('Project')
    
    // 如果没有指定项目，显示所有项目
    const projectsToCheck = projectKey 
      ? [{ key: projectKey, ...deployments.projects[projectKey] }]
      : Object.entries(deployments.projects).map(([key, value]) => ({ key, ...value }))
    
    for (const project of projectsToCheck) {
      console.log(`\n🎯 项目: ${project.name} (${project.symbol})`)
      console.log(`📍 地址: ${project.address}`)
      
      // 获取项目统计
      const stats = await publicClient.readContract({
        address: project.address as `0x${string}`,
        abi: projectABI,
        functionName: 'getProjectStats',
      })
      
      console.log(`👥 参与人数: ${stats[0]}`)
      console.log(`👍 总点赞数: ${stats[1]}`)
      console.log(`⏰ 最后活动时间: ${new Date(Number(stats[2]) * 1000).toLocaleString()}`)
      console.log(`💰 当前奖池USD: $${stats[3]}`)
      
      // 获取关联的Campaign
      const campaigns = await publicClient.readContract({
        address: project.address as `0x${string}`,
        abi: projectABI,
        functionName: 'getCampaigns',
      })
      
      console.log(`🎪 关联Campaign数量: ${campaigns.length}`)
      campaigns.forEach((campaign: string, index: number) => {
        console.log(`   ${index + 1}. ${campaign}`)
      })
      
      // 获取评论列表
      const comments = await publicClient.readContract({
        address: project.address as `0x${string}`,
        abi: projectABI,
        functionName: 'getComments',
        args: [0n, 10n], // offset, limit
      })
      
      console.log(`\n💬 评论列表 (前10条):`)
      if (comments[0].length === 0) {
        console.log('   暂无评论')
      } else {
        comments[0].forEach((comment: any, index: number) => {
          console.log(`${index + 1}. ID: ${comment.id}`)
          console.log(`   作者: ${comment.author}`)
          console.log(`   内容: ${comment.content}`)
          console.log(`   点赞数: ${comment.likes}`)
          console.log(`   时间: ${new Date(Number(comment.timestamp) * 1000).toLocaleString()}`)
          console.log(`   精英状态: ${comment.isElite ? '是' : '否'}`)
          console.log('')
        })
      }
      
      console.log('─'.repeat(50))
    }
    
  } catch (error) {
    console.error('❌ 获取项目详情失败:', error)
  }
}

/**
 * 查看用户在项目中的活动
 */
async function viewUserActivity(projectAddress: string, userAddress: string) {
  console.log(`\n👤 === 用户活动: ${userAddress} ===`)
  
  try {
    const projectABI = loadABI('Project')
    
    // 获取用户活动
    const activity = await publicClient.readContract({
      address: projectAddress as `0x${string}`,
      abi: projectABI,
      functionName: 'getUserActivity',
      args: [userAddress as `0x${string}`, 0n, 10n], // user, offset, limit
    })
    
    console.log(`📝 用户评论ID: [${activity[0].join(', ')}]`)
    console.log(`👍 用户点赞评论ID: [${activity[1].join(', ')}]`)
    
    // 获取用户CRT详情
    const crtDetails = await publicClient.readContract({
      address: projectAddress as `0x${string}`,
      abi: projectABI,
      functionName: 'getUserCampaignCRTDetails',
      args: [userAddress as `0x${string}`],
    })
    
    console.log(`\n🏆 用户CRT详情:`)
    if (crtDetails[0].length === 0) {
      console.log('   用户未参与任何Campaign')
    } else {
      crtDetails[0].forEach((campaignAddress: string, index: number) => {
        console.log(`Campaign ${index + 1}: ${campaignAddress}`)
        console.log(`   评论CRT: ${crtDetails[1][index]}`)
        console.log(`   点赞CRT: ${crtDetails[2][index]}`)
        console.log(`   总CRT: ${crtDetails[3][index]}`)
        console.log(`   待领取奖励: ${crtDetails[4][index]}`)
        console.log('')
      })
    }
    
    // 获取用户总CRT
    const totalCRT = await publicClient.readContract({
      address: projectAddress as `0x${string}`,
      abi: projectABI,
      functionName: 'getUserTotalCRT',
      args: [userAddress as `0x${string}`],
    })
    
    console.log(`💎 用户总CRT: ${totalCRT}`)
    
  } catch (error) {
    console.error('❌ 获取用户活动失败:', error)
  }
}

// 运行脚本
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    // 查看所有项目
    viewProjectDetails()
  } else if (args.length === 1) {
    // 查看指定项目
    viewProjectDetails(args[0])
  } else if (args.length === 2) {
    // 查看用户活动
    viewUserActivity(args[0], args[1])
  } else {
    console.log('用法:')
    console.log('  npm run test:project              // 查看所有项目')
    console.log('  npm run test:project btc          // 查看BTC项目')
    console.log('  npm run test:project <项目地址> <用户地址>  // 查看用户活动')
  }
} 