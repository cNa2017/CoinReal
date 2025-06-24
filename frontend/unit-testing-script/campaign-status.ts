import { deployments, loadABI, publicClient } from './config'

/**
 * 查看Campaign状态和奖励
 */
async function viewCampaignStatus(campaignAddress?: string) {
  console.log('\n🎪 === Campaign状态和奖励 ===')
  
  try {
    const campaignABI = loadABI('Campaign')
    const platformABI = loadABI('CoinRealPlatform')
    
    // 如果没有指定Campaign地址，从部署信息中获取
    let campaignsToCheck: string[] = []
    
    if (campaignAddress) {
      campaignsToCheck = [campaignAddress]
    } else {
      // 从平台获取所有项目的Campaign
      const projects = await publicClient.readContract({
        address: deployments.platform as `0x${string}`,
        abi: platformABI,
        functionName: 'getProjects',
        args: [BigInt(0), BigInt(10)],
      }) as any
      
      // 获取每个项目的Campaign
      const projectABI = loadABI('Project')
      for (const project of projects[0]) {
        try {
          const campaigns = await publicClient.readContract({
            address: project.projectAddress as `0x${string}`,
            abi: projectABI,
            functionName: 'getCampaigns',
            args: [],
          }) as string[]
          
          campaignsToCheck.push(...campaigns)
        } catch (error) {
          console.log(`⚠️  获取项目 ${project.name} 的Campaign失败`)
        }
      }
    }
    
    if (campaignsToCheck.length === 0) {
      console.log('❌ 没有找到任何Campaign')
      return
    }
    
    console.log(`📋 找到 ${campaignsToCheck.length} 个Campaign`)
    
    for (const campaignAddr of campaignsToCheck) {
      console.log(`\n🎯 Campaign: ${campaignAddr}`)
      
      try {
        // 获取Campaign基本信息
        const [name, symbol, totalSupply] = await Promise.all([
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'name',
            args: [],
          }) as Promise<string>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'symbol',
            args: [],
          }) as Promise<string>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'totalSupply',
            args: [],
          }) as Promise<bigint>
        ])
        
        console.log(`📛 名称: ${name}`)
        console.log(`🏷️  符号: ${symbol}`)
        console.log(`💎 总发行量: ${totalSupply.toString()} CRT`)
        
        // 获取Campaign详细信息（使用实际存在的函数）
        const [rewardToken, totalRewardPool, startTime, endTime, sponsor, sponsorName, isActive, rewardsDistributed] = await Promise.all([
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'rewardToken',
            args: [],
          }) as Promise<string>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'totalRewardPool',
            args: [],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'startTime',
            args: [],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'endTime',
            args: [],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'sponsor',
            args: [],
          }) as Promise<string>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'sponsorName',
            args: [],
          }) as Promise<string>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'isCurrentlyActive',
            args: [],
          }) as Promise<boolean>,
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'rewardsDistributed',
            args: [],
          }) as Promise<boolean>
        ])
        
        console.log(`🎁 奖励代币: ${rewardToken}`)
        console.log(`💰 奖池金额: ${totalRewardPool.toString()}`)
        console.log(`⏰ 开始时间: ${new Date(Number(startTime) * 1000).toLocaleString()}`)
        console.log(`⏰ 结束时间: ${new Date(Number(endTime) * 1000).toLocaleString()}`)
        console.log(`👤 赞助商: ${sponsorName} (${sponsor})`)
        console.log(`📊 状态: ${isActive ? '活跃' : '已结束'}`)
        console.log(`🏆 已分配奖励: ${rewardsDistributed ? '是' : '否'}`)
        
        // 获取Campaign统计信息
        const campaignStats = await publicClient.readContract({
          address: campaignAddr as `0x${string}`,
          abi: campaignABI,
          functionName: 'getCampaignStats',
          args: [],
        }) as any
        
        console.log(`📊 Campaign统计:`)
        console.log(`   👥 总参与者: ${campaignStats[0]}`)
        console.log(`   💬 总评论数: ${campaignStats[1]}`)
        console.log(`   👍 总点赞数: ${campaignStats[2]}`)
        console.log(`   💎 总CRT发行: ${campaignStats[3]}`)
        console.log(`   ⏱️  剩余时间: ${campaignStats[4]} 秒`)
        
        // 显示奖励分配比例（硬编码，因为合约中没有对应函数）
        console.log(`📈 奖励分配比例:`)
        console.log(`   💬 评论奖励: 60%`)
        console.log(`   👍 点赞奖励: 25%`)
        console.log(`   🏆 精英奖励: 15%`)
        
      } catch (error) {
        console.error(`❌ 获取Campaign ${campaignAddr} 信息失败:`, error)
      }
      
      console.log('─'.repeat(50))
    }
    
  } catch (error) {
    console.error('❌ 获取Campaign状态失败:', error)
  }
}

/**
 * 查看用户在Campaign中的奖励
 */
async function viewUserRewards(campaignAddress: string, userAddress: string) {
  console.log(`\n🏆 === 用户奖励: ${userAddress} ===`)
  
  try {
    const campaignABI = loadABI('Campaign')
    
    // 获取用户CRT余额
    const crtBalance = await publicClient.readContract({
      address: campaignAddress as `0x${string}`,
      abi: campaignABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    }) as bigint
    
    console.log(`💎 CRT余额: ${crtBalance.toString()}`)
    
    // 获取用户CRT详细分解（使用实际存在的函数）
    const userCRTBreakdown = await publicClient.readContract({
      address: campaignAddress as `0x${string}`,
      abi: campaignABI,
      functionName: 'getUserCRTBreakdown',
      args: [userAddress as `0x${string}`],
    }) as any
    
    console.log(`🎁 CRT详细分解:`)
    console.log(`   💬 评论CRT: ${userCRTBreakdown[0].toString()}`)
    console.log(`   👍 点赞CRT: ${userCRTBreakdown[1].toString()}`)
    console.log(`   📊 总CRT: ${userCRTBreakdown[2].toString()}`)
    console.log(`   🎁 待领取奖励: ${userCRTBreakdown[3].toString()}`)
    
    // 获取用户参与状态
    const [isParticipant, commentCRT, likeCRT] = await Promise.all([
      publicClient.readContract({
        address: campaignAddress as `0x${string}`,
        abi: campaignABI,
        functionName: 'isParticipant',
        args: [userAddress as `0x${string}`],
      }) as Promise<boolean>,
      publicClient.readContract({
        address: campaignAddress as `0x${string}`,
        abi: campaignABI,
        functionName: 'commentCRT',
        args: [userAddress as `0x${string}`],
      }) as Promise<bigint>,
      publicClient.readContract({
        address: campaignAddress as `0x${string}`,
        abi: campaignABI,
        functionName: 'likeCRT',
        args: [userAddress as `0x${string}`],
      }) as Promise<bigint>
    ])
    
    console.log(`👤 参与状态: ${isParticipant ? '已参与' : '未参与'}`)
    console.log(`💬 评论CRT (直接查询): ${commentCRT.toString()}`)
    console.log(`👍 点赞CRT (直接查询): ${likeCRT.toString()}`)
    
    // 检查Campaign状态以确定是否可以领取奖励
    const [isActive, rewardsDistributed] = await Promise.all([
      publicClient.readContract({
        address: campaignAddress as `0x${string}`,
        abi: campaignABI,
        functionName: 'isCurrentlyActive',
        args: [],
      }) as Promise<boolean>,
      publicClient.readContract({
        address: campaignAddress as `0x${string}`,
        abi: campaignABI,
        functionName: 'rewardsDistributed',
        args: [],
      }) as Promise<boolean>
    ])
    
    const canClaim = !isActive && rewardsDistributed && isParticipant && userCRTBreakdown[3] > 0
    console.log(`🎯 可领取奖励: ${canClaim ? '是' : '否'}`)
    
    if (!canClaim) {
      if (isActive) {
        console.log(`   ℹ️  Campaign仍在进行中`)
      } else if (!rewardsDistributed) {
        console.log(`   ℹ️  奖励尚未分配`)
      } else if (!isParticipant) {
        console.log(`   ℹ️  用户未参与此Campaign`)
      } else if (userCRTBreakdown[3] === 0) {
        console.log(`   ℹ️  没有待领取的奖励`)
      }
    }
    
  } catch (error) {
    console.error('❌ 获取用户奖励失败:', error)
  }
}

// 运行脚本
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    // 查看所有Campaign
    viewCampaignStatus()
  } else if (args.length === 1) {
    // 查看指定Campaign
    viewCampaignStatus(args[0])
  } else if (args.length === 2) {
    // 查看用户奖励
    viewUserRewards(args[0], args[1])
  } else {
    console.log('用法:')
    console.log('  npm run test:campaign                    // 查看所有Campaign')
    console.log('  npm run test:campaign <Campaign地址>     // 查看指定Campaign')
    console.log('  npm run test:campaign <Campaign地址> <用户地址>  // 查看用户奖励')
  }
} 