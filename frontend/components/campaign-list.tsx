"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContractApi } from "@/hooks/use-contract-api"
import { useClaimCampaignReward, useProjectCampaigns, useUserCampaignCRT } from "@/hooks/use-project"
import { UserCampaignCRT } from "@/types"
import { formatTimeLeft } from "@/utils/contract-helpers"
import { Clock, Gift, Trophy, Users, Zap } from "lucide-react"

interface CampaignListProps {
  projectAddress: string
  projectName: string
}

export function CampaignList({ projectAddress, projectName }: CampaignListProps) {
  const api = useContractApi()
  
  // 使用React Query hooks获取数据
  const { data: campaigns = [], isLoading: campaignsLoading } = useProjectCampaigns(projectAddress)
  const { data: userCRTDetails = [] } = useUserCampaignCRT(projectAddress, api?.address)
  const claimRewardMutation = useClaimCampaignReward()

  const handleClaimReward = async (campaignAddress: string) => {
    if (!api?.canWrite) {
      alert('请先连接钱包')
      return
    }

    try {
      await claimRewardMutation.mutateAsync(campaignAddress)
      alert('奖励领取成功！')
    } catch (error) {
      console.error('Failed to claim reward:', error)
      alert('奖励领取失败: ' + (error as Error).message)
    }
  }

  const getUserCRTForCampaign = (campaignAddress: string): UserCampaignCRT | undefined => {
    return userCRTDetails.find(detail => detail.campaignAddress === campaignAddress)
  }

  const formatCRTAmount = (amount: number): string => {
    return (amount / 1e18).toFixed(2)
  }

  const formatRewardAmount = (amount: number, tokenDecimals?: number, tokenSymbol?: string): string => {
    const decimals = tokenDecimals || 18
    const formatted = (amount / Math.pow(10, decimals)).toFixed(Math.min(decimals, 6))
    const symbol = tokenSymbol || '代币'
    return `${formatted} ${symbol}`
  }

  if (campaignsLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400">加载Campaign中...</div>
        </CardContent>
      </Card>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <div className="text-gray-400 mb-2">暂无活跃的Campaign</div>
          <div className="text-gray-500 text-sm">成为第一个为 {projectName} 创建Campaign的人！</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          活跃Campaign ({campaigns.length})
        </h3>
      </div>

      {campaigns.map((campaign) => {
        const userCRT = getUserCRTForCampaign(campaign.address)
        const isActive = campaign.isActive && Date.now() / 1000 < campaign.endTime
        const canClaimReward = userCRT && userCRT.pendingReward > 0 && campaign.rewardsDistributed

        return (
          <Card key={campaign.address} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {campaign.name.split('-').pop()?.replace('Campaign', 'C')}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-white text-base">{campaign.name}</CardTitle>
                      {/* 奖池信息 - 显示在同一行 */}
                      <span className="text-sm font-medium text-yellow-400">
                        {formatRewardAmount(campaign.totalRewardPool, campaign.rewardTokenDecimals, campaign.rewardTokenSymbol)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">by {campaign.sponsorName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      进行中
                    </Badge>
                  ) : campaign.rewardsDistributed ? (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      已结束
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      待开奖
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Campaign统计 */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-cyan-400">{campaign.totalParticipants}</div>
                  <div className="text-gray-400 text-xs flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    参与者
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400">{campaign.totalComments}</div>
                  <div className="text-gray-400 text-xs">评论数</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-pink-400">{campaign.totalLikes}</div>
                  <div className="text-gray-400 text-xs">点赞数</div>
                </div>
              </div>

              {/* 时间信息 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {isActive ? '剩余时间' : '已结束'}
                </div>
                <div className="text-white font-medium">
                  {isActive ? formatTimeLeft(campaign.endTime) : '活动结束'}
                </div>
              </div>

              {/* 用户CRT信息 */}
              {userCRT && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-slate-700/50 to-purple-700/50 border border-slate-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-white">我的CRT收益</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-cyan-400 font-bold">{formatCRTAmount(userCRT.commentCRT)}</div>
                      <div className="text-gray-400">评论CRT</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">{formatCRTAmount(userCRT.likeCRT)}</div>
                      <div className="text-gray-400">点赞CRT</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-bold">{formatCRTAmount(userCRT.totalCRT)}</div>
                      <div className="text-gray-400">总CRT</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold">{formatRewardAmount(userCRT.pendingReward, userCRT.tokenDecimals, userCRT.tokenSymbol)}</div>
                      <div className="text-gray-400">待领取</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 领取奖励按钮 */}
              {canClaimReward && (
                <Button
                  onClick={() => handleClaimReward(campaign.address)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  disabled={!api?.canWrite}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  领取奖励 ({formatRewardAmount(userCRT!.pendingReward, userCRT.tokenDecimals, userCRT.tokenSymbol)})
                </Button>
              )}

              {/* Campaign说明 */}
              {isActive && (
                <div className="text-xs text-gray-400 text-center">
                  💡 发表评论获得5 CRT，点赞评论获得1 CRT
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 