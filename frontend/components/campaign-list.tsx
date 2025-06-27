"use client"

import { CampaignDialog } from "@/components/sponsor-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContractApi } from "@/hooks/use-contract-api"
import { useClaimCampaignReward, useDistributeCampaignRewards, useProjectCampaigns, useUserCampaignCRT } from "@/hooks/use-project"
import { UserCampaignCRT } from "@/types"
import { formatTimeLeft } from "@/utils/contract-helpers"
import { Clock, Copy, Gift, Sparkles, Trophy, Users, Zap } from "lucide-react"
import { useMemo, useState } from "react"

interface CampaignListProps {
  projectAddress: string
  projectName: string
}

export function CampaignList({ projectAddress, projectName }: CampaignListProps) {
  const api = useContractApi()
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Use React Query hooks to get data
  const { data: campaigns = [], isLoading: campaignsLoading } = useProjectCampaigns(projectAddress)
  const { data: userCRTDetails = [] } = useUserCampaignCRT(projectAddress, api?.address)
  const claimRewardMutation = useClaimCampaignReward()
  const distributeRewardsMutation = useDistributeCampaignRewards()

  // Campaign sorting logic: Pending lottery > Remaining time ascending > Ended
  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      const currentTime = Date.now() / 1000
      const aIsActive = a.isActive && currentTime < a.endTime
      const bIsActive = b.isActive && currentTime < b.endTime

      // Status priority: Pending lottery(2) > Active(1) > Ended(0)
      const getStatusPriority = (campaign: typeof a) => {
        const isActive = campaign.isActive && currentTime < campaign.endTime
        if (!isActive && !campaign.rewardsDistributed) {
          return 2 // Pending lottery
        } else if (isActive) {
          return 1 // Active
        } else {
          return 0 // Ended
        }
      }

      const aPriority = getStatusPriority(a)
      const bPriority = getStatusPriority(b)

      // First sort by status priority
      if (aPriority !== bPriority) {
        return bPriority - aPriority // Descending, higher priority first
      }

      // If same status, active campaigns sorted by remaining time ascending (less time first)
      if (aPriority === 1 && bPriority === 1) {
        return a.endTime - b.endTime
      }

      // Other cases maintain original order
      return 0
    })
  }, [campaigns])

  const handleClaimReward = async (campaignAddress: string) => {
    if (!api?.canWrite) {
      alert('Please connect your wallet first')
      return
    }

    try {
      await claimRewardMutation.mutateAsync(campaignAddress)
      alert('Reward claimed successfully!')
    } catch (error) {
      console.error('Failed to claim reward:', error)
      alert('Failed to claim reward: ' + (error as Error).message)
    }
  }

  // Handle campaign lottery
  const handleDistributeRewards = async (campaignAddress: string, campaignName: string) => {
    if (!api?.canWrite) {
      alert('Please connect your wallet first')
      return
    }

    // Confirm lottery operation
    const confirmed = window.confirm(`Are you sure you want to conduct the lottery for "${campaignName}"?\n\nAfter the lottery, rewards will be distributed based on users' CRT amounts. This operation cannot be undone.`)
    if (!confirmed) {
      return
    }

    try {
      await distributeRewardsMutation.mutateAsync(campaignAddress)
      alert('Lottery successful! Rewards have been distributed to all participants.')
    } catch (error) {
      console.error('Failed to distribute rewards:', error)
      alert('Lottery failed: ' + (error as Error).message)
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
    const actualAmount = amount / Math.pow(10, decimals)

    // For USDC and similar stablecoins, always show 2 decimal places
    // For other tokens, show up to 4 decimal places but remove trailing zeros
    const isStablecoin = tokenSymbol && ['USDC', 'USDT', 'DAI'].includes(tokenSymbol.toUpperCase())

    let formatted: string
    if (isStablecoin) {
      // Always show 2 decimal places for stablecoins
      formatted = actualAmount.toFixed(2)
    } else {
      // For other tokens, show up to 4 decimal places and remove trailing zeros
      formatted = actualAmount.toFixed(4).replace(/\.?0+$/, '')
    }

    const symbol = tokenSymbol || 'Token'
    return `${formatted} ${symbol}`
  }

  // Copy campaign contract address functionality
  const copyCampaignAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  // Format address display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (campaignsLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400">Loading campaigns...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Campaign Activities
              </CardTitle>
              <CampaignDialog projectName={projectName} projectAddress={projectAddress} />
            </div>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <div className="text-gray-400 mb-2">No active campaigns</div>
            <div className="text-gray-500 text-sm">Be the first to create a campaign for {projectName}!</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Active Campaigns ({campaigns.length})
            </h3>
            <CampaignDialog projectName={projectName} projectAddress={projectAddress} />
          </div>

          {sortedCampaigns.map((campaign) => {
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
                          Active
                        </Badge>
                      ) : campaign.rewardsDistributed ? (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Ended
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Pending Lottery
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Campaign Statistics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-cyan-400">{campaign.totalParticipants}</div>
                      <div className="text-gray-400 text-xs flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" />
                        Participants
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-400">{campaign.totalComments}</div>
                      <div className="text-gray-400 text-xs">Comments</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-pink-400">{campaign.totalLikes}</div>
                      <div className="text-gray-400 text-xs">Likes</div>
                    </div>
                  </div>

                  {/* Campaign Contract Address */}
                  <div className="p-2 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Campaign Contract</div>
                        <div className="text-white font-mono text-xs">{formatAddress(campaign.address)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCampaignAddress(campaign.address)}
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors h-8 px-2"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        <span className="text-xs">
                          {copiedAddress === campaign.address ? "Copied!" : "Copy"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Time Information */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      {isActive ? 'Time Remaining' : 'Ended'}
                    </div>
                    <div className="text-white font-medium">
                      {isActive ? formatTimeLeft(campaign.endTime) : 'Campaign Ended'}
                    </div>
                  </div>

                  {/* User CRT Information */}
                  {userCRT && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-slate-700/50 to-purple-700/50 border border-slate-600/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-white">My CRT Earnings</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="text-center">
                          <div className="text-cyan-400 font-bold">{formatCRTAmount(userCRT.commentCRT)}</div>
                          <div className="text-gray-400">Comment CRT</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-400 font-bold">{formatCRTAmount(userCRT.likeCRT)}</div>
                          <div className="text-gray-400">Like CRT</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400 font-bold">{formatCRTAmount(userCRT.totalCRT)}</div>
                          <div className="text-gray-400">Total CRT</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-400 font-bold">{formatRewardAmount(userCRT.pendingReward, userCRT.tokenDecimals, userCRT.tokenSymbol)}</div>
                          <div className="text-gray-400">Pending</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lottery Button - Only shown in pending lottery status */}
                  {!isActive && !campaign.rewardsDistributed && (
                    <Button
                      onClick={() => handleDistributeRewards(campaign.address, campaign.name)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={!api?.canWrite || distributeRewardsMutation.isPending}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {distributeRewardsMutation.isPending ? 'Drawing...' : 'Draw Lottery'}
                    </Button>
                  )}

                  {/* Claim Reward Button */}
                  {canClaimReward && (
                    <Button
                      onClick={() => handleClaimReward(campaign.address)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      disabled={!api?.canWrite}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Claim Reward ({formatRewardAmount(userCRT!.pendingReward, userCRT.tokenDecimals, userCRT.tokenSymbol)})
                    </Button>
                  )}

                  {/* Campaign Description */}
                  {isActive && (
                    <div className="text-xs text-gray-400 text-center">
                      💡 Earn 5 CRT for posting comments, 1 CRT for liking comments
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 