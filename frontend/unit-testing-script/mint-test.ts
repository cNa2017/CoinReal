import { formatEther, parseEther } from 'viem'
import { account, deployments, loadABI, publicClient, walletClient } from './config'

/**
 * 测试Campaign合约的mint函数
 */
async function testCampaignMint(campaignAddress?: string, userAddress?: string, amount?: string) {
  console.log('\n🎪 === Campaign Mint 函数测试 ===')
  
  try {
    const campaignABI = loadABI('Campaign')
    
    // 如果没有指定Campaign地址，从部署信息中获取第一个Campaign
    let targetCampaign = campaignAddress
    if (!targetCampaign) {
      // 从平台获取项目，然后获取Campaign
      const platformABI = loadABI('CoinRealPlatform')
      const projects = await publicClient.readContract({
        address: deployments.platform as `0x${string}`,
        abi: platformABI,
        functionName: 'getProjects',
        args: [BigInt(0), BigInt(1)],
      }) as any
      
      if (projects[0].length > 0) {
        const projectABI = loadABI('Project')
        const campaigns = await publicClient.readContract({
          address: projects[0][0].projectAddress as `0x${string}`,
          abi: projectABI,
          functionName: 'getCampaigns',
          args: [],
        }) as string[]
        
        if (campaigns.length > 0) {
          targetCampaign = campaigns[0]
        }
      }
    }
    
    if (!targetCampaign) {
      console.log('❌ 没有找到可用的Campaign地址')
      return
    }
    
    const targetUser = userAddress || account.address
    const mintAmount = parseEther(amount || '10') // 默认mint 10个代币
    
    console.log(`🎯 Campaign地址: ${targetCampaign}`)
    console.log(`👤 目标用户: ${targetUser}`)
    console.log(`💎 Mint数量: ${formatEther(mintAmount)} CRT`)
    
    // 获取mint前的余额
    const balanceBefore = await publicClient.readContract({
      address: targetCampaign as `0x${string}`,
      abi: campaignABI,
      functionName: 'balanceOf',
      args: [targetUser as `0x${string}`],
    }) as bigint
    
    console.log(`📊 Mint前余额: ${formatEther(balanceBefore)} CRT`)
    
    // 执行mint操作
    console.log('🔄 执行mint操作...')
    const hash = await walletClient.writeContract({
      address: targetCampaign as `0x${string}`,
      abi: campaignABI,
      functionName: 'mint',
      args: [targetUser as `0x${string}`, mintAmount],
    })
    
    console.log(`📝 交易哈希: ${hash}`)
    
    // 等待交易确认
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(`✅ 交易已确认，区块: ${receipt.blockNumber}`)
    
    // 获取mint后的余额
    const balanceAfter = await publicClient.readContract({
      address: targetCampaign as `0x${string}`,
      abi: campaignABI,
      functionName: 'balanceOf',
      args: [targetUser as `0x${string}`],
    }) as bigint
    
    console.log(`📊 Mint后余额: ${formatEther(balanceAfter)} CRT`)
    console.log(`📈 余额增加: ${formatEther(balanceAfter - balanceBefore)} CRT`)
    
    // 验证mint是否成功
    if (balanceAfter - balanceBefore === mintAmount) {
      console.log('✅ Campaign mint测试成功！')
    } else {
      console.log('❌ Campaign mint测试失败！')
    }
    
    // 获取Campaign总供应量
    const totalSupply = await publicClient.readContract({
      address: targetCampaign as `0x${string}`,
      abi: campaignABI,
      functionName: 'totalSupply',
      args: [],
    }) as bigint
    
    console.log(`🏦 Campaign总供应量: ${formatEther(totalSupply)} CRT`)
    
  } catch (error) {
    console.error('❌ Campaign mint测试失败:', error)
  }
}

/**
 * 测试MockERC20合约的mint函数
 */
async function testMockERC20Mint(tokenAddress?: string, userAddress?: string, amount?: string) {
  console.log('\n💰 === MockERC20 Mint 函数测试 ===')
  
  try {
    const mockERC20ABI = loadABI('MockERC20')
    
    // 如果没有指定代币地址，使用部署信息中的USDC
    const targetToken = tokenAddress || deployments.tokens?.usdc || deployments.usdc
    if (!targetToken) {
      console.log('❌ 没有找到可用的MockERC20代币地址')
      return
    }
    
    const targetUser = userAddress || account.address
    const mintAmount = parseEther(amount || '100') // 默认mint 100个代币
    
    console.log(`🎯 代币地址: ${targetToken}`)
    console.log(`👤 目标用户: ${targetUser}`)
    console.log(`💰 Mint数量: ${formatEther(mintAmount)}`)
    
    // 获取代币信息
    const [name, symbol, decimals] = await Promise.all([
      publicClient.readContract({
        address: targetToken as `0x${string}`,
        abi: mockERC20ABI,
        functionName: 'name',
        args: [],
      }) as Promise<string>,
      publicClient.readContract({
        address: targetToken as `0x${string}`,
        abi: mockERC20ABI,
        functionName: 'symbol',
        args: [],
      }) as Promise<string>,
      publicClient.readContract({
        address: targetToken as `0x${string}`,
        abi: mockERC20ABI,
        functionName: 'decimals',
        args: [],
      }) as Promise<number>
    ])
    
    console.log(`📛 代币信息: ${name} (${symbol}), ${decimals} decimals`)
    
    // 获取mint前的余额
    const balanceBefore = await publicClient.readContract({
      address: targetToken as `0x${string}`,
      abi: mockERC20ABI,
      functionName: 'balanceOf',
      args: [targetUser as `0x${string}`],
    }) as bigint
    
    console.log(`📊 Mint前余额: ${formatEther(balanceBefore)} ${symbol}`)
    
    // 执行mint操作
    console.log('🔄 执行mint操作...')
    const hash = await walletClient.writeContract({
      address: targetToken as `0x${string}`,
      abi: mockERC20ABI,
      functionName: 'mint',
      args: [targetUser as `0x${string}`, mintAmount],
    })
    
    console.log(`📝 交易哈希: ${hash}`)
    
    // 等待交易确认
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(`✅ 交易已确认，区块: ${receipt.blockNumber}`)
    
    // 获取mint后的余额
    const balanceAfter = await publicClient.readContract({
      address: targetToken as `0x${string}`,
      abi: mockERC20ABI,
      functionName: 'balanceOf',
      args: [targetUser as `0x${string}`],
    }) as bigint
    
    console.log(`📊 Mint后余额: ${formatEther(balanceAfter)} ${symbol}`)
    console.log(`📈 余额增加: ${formatEther(balanceAfter - balanceBefore)} ${symbol}`)
    
    // 验证mint是否成功
    if (balanceAfter - balanceBefore === mintAmount) {
      console.log('✅ MockERC20 mint测试成功！')
    } else {
      console.log('❌ MockERC20 mint测试失败！')
    }
    
    // 获取总供应量
    const totalSupply = await publicClient.readContract({
      address: targetToken as `0x${string}`,
      abi: mockERC20ABI,
      functionName: 'totalSupply',
      args: [],
    }) as bigint
    
    console.log(`🏦 总供应量: ${formatEther(totalSupply)} ${symbol}`)
    
  } catch (error) {
    console.error('❌ MockERC20 mint测试失败:', error)
  }
}

/**
 * 批量测试多个Campaign的mint函数
 */
async function testBatchCampaignMint(amount?: string) {
  console.log('\n🚀 === 批量Campaign Mint测试 ===')
  
  try {
    const platformABI = loadABI('CoinRealPlatform')
    const projectABI = loadABI('Project')
    
    // 获取所有项目
    const projects = await publicClient.readContract({
      address: deployments.platform as `0x${string}`,
      abi: platformABI,
      functionName: 'getProjects',
      args: [BigInt(0), BigInt(5)],
    }) as any
    
    console.log(`📋 找到 ${projects[0].length} 个项目`)
    
    const mintAmount = parseEther(amount || '5') // 默认每个Campaign mint 5个代币
    
    for (const project of projects[0]) {
      console.log(`\n📁 项目: ${project.name} (${project.projectAddress})`)
      
      try {
        // 获取项目的Campaign列表
        const campaigns = await publicClient.readContract({
          address: project.projectAddress as `0x${string}`,
          abi: projectABI,
          functionName: 'getCampaigns',
          args: [],
        }) as string[]
        
        console.log(`   🎪 找到 ${campaigns.length} 个Campaign`)
        
        for (const campaign of campaigns) {
          console.log(`   🎯 测试Campaign: ${campaign}`)
          
          try {
            const campaignABI = loadABI('Campaign')
            
            // 获取Campaign名称
            const campaignName = await publicClient.readContract({
              address: campaign as `0x${string}`,
              abi: campaignABI,
              functionName: 'name',
              args: [],
            }) as string
            
            console.log(`      📛 Campaign名称: ${campaignName}`)
            
            // 执行mint
            const hash = await walletClient.writeContract({
              address: campaign as `0x${string}`,
              abi: campaignABI,
              functionName: 'mint',
              args: [account.address, mintAmount],
            })
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash })
            console.log(`      ✅ Mint成功，区块: ${receipt.blockNumber}`)
            
            // 检查余额
            const balance = await publicClient.readContract({
              address: campaign as `0x${string}`,
              abi: campaignABI,
              functionName: 'balanceOf',
              args: [account.address],
            }) as bigint
            
            console.log(`      💎 当前余额: ${formatEther(balance)} CRT`)
            
          } catch (error) {
            console.log(`      ❌ Campaign mint失败:`, error)
          }
        }
      } catch (error) {
        console.log(`   ❌ 获取Campaign列表失败:`, error)
      }
    }
    
  } catch (error) {
    console.error('❌ 批量Campaign mint测试失败:', error)
  }
}

/**
 * 测试所有可用的MockERC20代币mint
 */
async function testAllTokensMint(amount?: string) {
  console.log('\n💰 === 所有代币Mint测试 ===')
  
  const mintAmount = parseEther(amount || '50') // 默认每个代币mint 50个
  
  // 从部署信息中获取所有代币地址
  const tokenAddresses: { [key: string]: string } = {}
  
  // 检查不同的部署信息结构
  if (deployments.tokens) {
    Object.assign(tokenAddresses, deployments.tokens)
  }
  
  // 检查直接在deployments根级别的代币
  const possibleTokenKeys = ['usdc', 'weth', 'dai', 'usdt', 'bnb']
  for (const key of possibleTokenKeys) {
    if (deployments[key]) {
      tokenAddresses[key] = deployments[key]
    }
  }
  
  console.log(`🎯 找到 ${Object.keys(tokenAddresses).length} 个代币`)
  
  for (const [tokenKey, tokenAddress] of Object.entries(tokenAddresses)) {
    console.log(`\n💰 测试代币: ${tokenKey.toUpperCase()} (${tokenAddress})`)
    
    try {
      const mockERC20ABI = loadABI('MockERC20')
      
      // 获取代币信息
      const [name, symbol] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: mockERC20ABI,
          functionName: 'name',
          args: [],
        }) as Promise<string>,
        publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: mockERC20ABI,
          functionName: 'symbol',
          args: [],
        }) as Promise<string>
      ])
      
      console.log(`   📛 代币: ${name} (${symbol})`)
      
      // 执行mint
      const hash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: mockERC20ABI,
        functionName: 'mint',
        args: [account.address, mintAmount],
      })
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log(`   ✅ Mint成功，区块: ${receipt.blockNumber}`)
      
      // 检查余额
      const balance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: mockERC20ABI,
        functionName: 'balanceOf',
        args: [account.address],
      }) as bigint
      
      console.log(`   💰 当前余额: ${formatEther(balance)} ${symbol}`)
      
    } catch (error) {
      console.log(`   ❌ ${tokenKey.toUpperCase()} mint失败:`, error)
    }
  }
}

// 运行脚本
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🎯 Mint函数测试脚本')
    console.log('═'.repeat(50))
    console.log('用法:')
    console.log('  npm run test:mint campaign                              // 测试Campaign mint')
    console.log('  npm run test:mint campaign <Campaign地址>              // 测试指定Campaign')
    console.log('  npm run test:mint campaign <Campaign地址> <用户地址> <数量>  // 完整参数')
    console.log('  npm run test:mint token                                 // 测试MockERC20 mint')
    console.log('  npm run test:mint token <代币地址>                      // 测试指定代币')
    console.log('  npm run test:mint token <代币地址> <用户地址> <数量>        // 完整参数')
    console.log('  npm run test:mint batch-campaign <数量>                 // 批量测试Campaign')
    console.log('  npm run test:mint all-tokens <数量>                     // 测试所有代币')
    console.log('  npm run test:mint demo                                  // 运行演示')
  } else if (args[0] === 'campaign') {
    testCampaignMint(args[1], args[2], args[3])
  } else if (args[0] === 'token') {
    testMockERC20Mint(args[1], args[2], args[3])
  } else if (args[0] === 'batch-campaign') {
    testBatchCampaignMint(args[1])
  } else if (args[0] === 'all-tokens') {
    testAllTokensMint(args[1])
  } else if (args[0] === 'demo') {
    // 运行完整演示
    console.log('🚀 Mint函数完整演示')
    console.log('═'.repeat(50))
    
    Promise.resolve()
      .then(() => testCampaignMint())
      .then(() => testMockERC20Mint())
      .then(() => console.log('\n✅ 演示完成！'))
      .catch(error => console.error('❌ 演示失败:', error))
  } else {
    console.log('❌ 未知命令，请使用 npm run test:mint 查看帮助')
  }
} 