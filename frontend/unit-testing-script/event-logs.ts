import { deployments, loadABI, publicClient } from './config'

/**
 * 查询Campaign相关事件日志
 */
async function queryEventLogs(campaignAddress?: string, blockRange?: number) {
  console.log('\n🔍 === Campaign事件日志查询 ===')
  
  try {
    const campaignABI = loadABI('Campaign')
    const projectABI = loadABI('Project')
    
    // 获取当前区块号
    const currentBlock = await publicClient.getBlockNumber()
    const blockRangeToUse = Math.min(blockRange || 1000, Number(currentBlock))
    const fromBlock = currentBlock - BigInt(blockRangeToUse)
    
    console.log(`📊 查询区块范围: ${fromBlock} - ${currentBlock}`)
    
    // 如果没有指定Campaign地址，获取所有Campaign
    let campaignsToCheck: string[] = []
    
    if (campaignAddress) {
      campaignsToCheck = [campaignAddress]
    } else {
      // 从平台获取所有Campaign
      const platformABI = loadABI('CoinRealPlatform')
      const projects = await publicClient.readContract({
        address: deployments.platform as `0x${string}`,
        abi: platformABI,
        functionName: 'getProjects',
        args: [BigInt(0), BigInt(20)],
      }) as any
      
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
    
    console.log(`🎯 检查 ${campaignsToCheck.length} 个Campaign的事件`)
    
    for (const campaignAddr of campaignsToCheck) {
      console.log(`\n📋 Campaign: ${campaignAddr}`)
      
      try {
        // 获取Campaign名称
        const campaignName = await publicClient.readContract({
          address: campaignAddr as `0x${string}`,
          abi: campaignABI,
          functionName: 'name',
          args: [],
        }) as string
        
        console.log(`📛 名称: ${campaignName}`)
        
        // 查询所有事件日志（不解码，只统计数量）
        const allLogs = await publicClient.getLogs({
          address: campaignAddr as `0x${string}`,
          fromBlock,
          toBlock: currentBlock
        })
        
        console.log(`📊 总事件数量: ${allLogs.length}`)
        
        // 查询CRTMinted事件
        const crtMintedLogs = await publicClient.getLogs({
          address: campaignAddr as `0x${string}`,
          event: {
            type: 'event',
            name: 'CRTMinted',
            inputs: [
              { name: 'user', type: 'address', indexed: true },
              { name: 'amount', type: 'uint256', indexed: false },
              { name: 'reason', type: 'string', indexed: false }
            ]
          },
          fromBlock,
          toBlock: currentBlock
        })
        
        console.log(`🔥 CRTMinted事件数量: ${crtMintedLogs.length}`)
        if (crtMintedLogs.length > 0) {
          crtMintedLogs.forEach((log, index) => {
            console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
          })
        }
        
        // 查询Transfer事件
        const transferLogs = await publicClient.getLogs({
          address: campaignAddr as `0x${string}`,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'value', type: 'uint256', indexed: false }
            ]
          },
          fromBlock,
          toBlock: currentBlock
        })
        
        console.log(`💸 Transfer事件数量: ${transferLogs.length}`)
        if (transferLogs.length > 0) {
          transferLogs.forEach((log, index) => {
            console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
          })
        }
        
        // 查询Campaign初始化事件
        const initLogs = await publicClient.getLogs({
          address: campaignAddr as `0x${string}`,
          event: {
            type: 'event',
            name: 'CampaignInitialized',
            inputs: [
              { name: 'project', type: 'address', indexed: true },
              { name: 'sponsor', type: 'address', indexed: true },
              { name: 'sponsorName', type: 'string', indexed: false }
            ]
          },
          fromBlock,
          toBlock: currentBlock
        })
        
        console.log(`🎪 CampaignInitialized事件数量: ${initLogs.length}`)
        if (initLogs.length > 0) {
          initLogs.forEach((log, index) => {
            console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
          })
        }
        
        // 查询DebugCommentPosted事件
        const debugLogs = await publicClient.getLogs({
          address: campaignAddr as `0x${string}`,
          event: {
            type: 'event',
            name: 'DebugCommentPosted',
            inputs: [
              { name: 'campaign', type: 'address', indexed: true },
              { name: 'user', type: 'address', indexed: true },
              { name: 'commentId', type: 'uint256', indexed: true },
              { name: 'step', type: 'string', indexed: false },
              { name: 'timestamp', type: 'uint256', indexed: false },
              { name: 'isActiveStatus', type: 'bool', indexed: false },
              { name: 'currentStartTime', type: 'uint256', indexed: false },
              { name: 'currentEndTime', type: 'uint256', indexed: false }
            ]
          },
          fromBlock,
          toBlock: currentBlock
        })
        
        console.log(`🔧 DebugCommentPosted事件数量: ${debugLogs.length}`)
        if (debugLogs.length > 0) {
          debugLogs.forEach((log, index) => {
            console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
          })
        }
        
        // 检查Campaign状态
        const [isActive, startTime, endTime] = await Promise.all([
          publicClient.readContract({
            address: campaignAddr as `0x${string}`,
            abi: campaignABI,
            functionName: 'isCurrentlyActive',
            args: [],
          }) as Promise<boolean>,
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
          }) as Promise<bigint>
        ])
        
        console.log(`📊 Campaign状态:`)
        console.log(`   ✅ 当前活跃: ${isActive}`)
        console.log(`   ⏰ 开始时间: ${new Date(Number(startTime) * 1000).toLocaleString()}`)
        console.log(`   ⏰ 结束时间: ${new Date(Number(endTime) * 1000).toLocaleString()}`)
        console.log(`   🕐 当前时间: ${new Date().toLocaleString()}`)
        
      } catch (error) {
        console.error(`❌ 查询Campaign ${campaignAddr} 事件失败:`, error)
      }
      
      console.log('─'.repeat(50))
    }
    
  } catch (error) {
    console.error('❌ 查询事件日志失败:', error)
  }
}

/**
 * 查询Project相关事件
 */
async function queryProjectEvents(projectAddress: string, blockRange?: number) {
  console.log(`\n📝 === Project事件日志: ${projectAddress} ===`)
  
  try {
    const projectABI = loadABI('Project')
    
    // 获取当前区块号
    const currentBlock = await publicClient.getBlockNumber()
    const blockRangeToUse = Math.min(blockRange || 1000, Number(currentBlock))
    const fromBlock = currentBlock - BigInt(blockRangeToUse)
    
    console.log(`📊 查询区块范围: ${fromBlock} - ${currentBlock}`)
    
    // 查询所有事件
    const allLogs = await publicClient.getLogs({
      address: projectAddress as `0x${string}`,
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`📊 总事件数量: ${allLogs.length}`)
    
    // 查询CommentPosted事件
    const commentLogs = await publicClient.getLogs({
      address: projectAddress as `0x${string}`,
      event: {
        type: 'event',
        name: 'CommentPosted',
        inputs: [
          { name: 'commentId', type: 'uint256', indexed: true },
          { name: 'user', type: 'address', indexed: true },
          { name: 'content', type: 'string', indexed: false }
        ]
      },
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`💬 CommentPosted事件数量: ${commentLogs.length}`)
    if (commentLogs.length > 0) {
      commentLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
      })
    }
    
    // 查询CommentLiked事件
    const likeLogs = await publicClient.getLogs({
      address: projectAddress as `0x${string}`,
      event: {
        type: 'event',
        name: 'CommentLiked',
        inputs: [
          { name: 'commentId', type: 'uint256', indexed: true },
          { name: 'liker', type: 'address', indexed: true }
        ]
      },
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`👍 CommentLiked事件数量: ${likeLogs.length}`)
    if (likeLogs.length > 0) {
      likeLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
      })
    }
    
    // 查询CampaignAdded事件
    const campaignAddedLogs = await publicClient.getLogs({
      address: projectAddress as `0x${string}`,
      event: {
        type: 'event',
        name: 'CampaignAdded',
        inputs: [
          { name: 'campaign', type: 'address', indexed: true }
        ]
      },
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`🎪 CampaignAdded事件数量: ${campaignAddedLogs.length}`)
    if (campaignAddedLogs.length > 0) {
      campaignAddedLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
      })
    }
    
    // 查询Campaign通知成功事件
    const campaignNotifiedLogs = await publicClient.getLogs({
      address: projectAddress as `0x${string}`,
      event: {
        type: 'event',
        name: 'CampaignCommentPosted',
        inputs: [
          { name: 'campaign', type: 'address', indexed: true },
          { name: 'user', type: 'address', indexed: true },
          { name: 'commentId', type: 'uint256', indexed: true }
        ]
      },
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`✅ CampaignCommentPosted事件数量: ${campaignNotifiedLogs.length}`)
    if (campaignNotifiedLogs.length > 0) {
      campaignNotifiedLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
      })
    }
    
    // 查询Campaign通知失败事件1
    const ignoredCampaign1Logs = await publicClient.getLogs({
      address: projectAddress as `0x${string}`,
      event: {
        type: 'event',
        name: 'IgnoredCampaign1',
        inputs: [
          { name: 'campaign', type: 'address', indexed: true }
        ]
      },
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`❌ IgnoredCampaign1事件数量: ${ignoredCampaign1Logs.length}`)
    if (ignoredCampaign1Logs.length > 0) {
      ignoredCampaign1Logs.forEach((log, index) => {
        console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
      })
    }
    
    // 查询Campaign通知失败事件2
    const ignoredCampaign2Logs = await publicClient.getLogs({
      address: projectAddress as `0x${string}`,
      event: {
        type: 'event',
        name: 'IgnoredCampaign2',
        inputs: [
          { name: 'campaign', type: 'address', indexed: true }
        ]
      },
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`❌ IgnoredCampaign2事件数量: ${ignoredCampaign2Logs.length}`)
    if (ignoredCampaign2Logs.length > 0) {
      ignoredCampaign2Logs.forEach((log, index) => {
        console.log(`   ${index + 1}. 区块: ${log.blockNumber}, 交易: ${log.transactionHash}`)
      })
    }
    
    // 获取Project的Campaign列表
    const campaigns = await publicClient.readContract({
      address: projectAddress as `0x${string}`,
      abi: projectABI,
      functionName: 'getCampaigns',
      args: [],
    }) as string[]
    
    console.log(`🎪 关联的Campaign数量: ${campaigns.length}`)
    campaigns.forEach((campaign, index) => {
      console.log(`   ${index + 1}. ${campaign}`)
    })
    
  } catch (error) {
    console.error('❌ 查询Project事件失败:', error)
  }
}

// 运行脚本
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('用法:')
    console.log('  npm run test:events                              // 查看所有Campaign事件')
    console.log('  npm run test:events <Campaign地址>               // 查看指定Campaign事件')
    console.log('  npm run test:events project <Project地址>        // 查看Project事件')
    console.log('  npm run test:events <地址> <区块范围>             // 指定查询区块范围')
  } else if (args[0] === 'project') {
    if (args.length >= 2) {
      const blockRange = args.length >= 3 ? parseInt(args[2]) : undefined
      queryProjectEvents(args[1], blockRange)
    } else {
      console.log('请提供Project地址')
    }
  } else {
    const blockRange = args.length >= 2 ? parseInt(args[1]) : undefined
    queryEventLogs(args[0], blockRange)
  }
} 