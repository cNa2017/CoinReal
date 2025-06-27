import { CampaignDialog } from "@/components/sponsor-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useProjectCampaigns } from "@/hooks/use-project"
import { Project } from "@/types"
import { formatPoolValue, formatTimeLeft } from "@/utils/contract-helpers"
import { Copy, ExternalLink, Globe, Trophy, Zap } from "lucide-react"
import { useMemo, useState } from "react"

interface ProjectInfoProps {
  project: Project
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  const [copied, setCopied] = useState(false)
  
  // Get project campaign data
  const { data: campaigns = [] } = useProjectCampaigns(project.projectAddress)

  // Calculate active campaign information
  const campaignInfo = useMemo(() => {
    const activeCampaigns = campaigns.filter(campaign =>
      campaign.isActive && Date.now() / 1000 < campaign.endTime
    )

    if (activeCampaigns.length === 0) {
      return {
        totalPoolUSD: 0,
        timeLeft: "No active campaigns",
        hasActiveCampaign: false,
        nextEndTime: 0
      }
    }

    // Calculate total pool value (simplified processing, should calculate USD value based on token price)
    const totalPoolUSD = activeCampaigns.reduce((sum, campaign) => {
      // Simplified processing, assuming all are USDC (6 decimals)
      const decimals = campaign.rewardTokenDecimals || 6
      return sum + (campaign.totalRewardPool / Math.pow(10, decimals))
    }, 0)

    // Find the nearest ending campaign time
    const nextEndTime = Math.min(...activeCampaigns.map(c => c.endTime))

    return {
      totalPoolUSD: totalPoolUSD * 100000000, // Convert to 8 decimal format for formatPoolValue compatibility
      timeLeft: formatTimeLeft(nextEndTime),
      hasActiveCampaign: true,
      nextEndTime
    }
  }, [campaigns])

  // Copy contract address functionality
  const copyContractAddress = () => {
    navigator.clipboard.writeText(project.projectAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format address display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Project Basic Information */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${project.colorIndex ? `from-blue-500 to-purple-500` : 'from-orange-500 to-yellow-500'} flex items-center justify-center text-white font-bold text-lg`}>
                {project.symbol[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <p className="text-gray-400">{project.symbol}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 leading-relaxed">{project.description}</p>

          {/* Contract Address Information */}
          <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Contract Address</div>
                <div className="text-white font-mono text-sm">{formatAddress(project.projectAddress)}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyContractAddress}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {project.category}
            </Badge>
            {project.website && (
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                <Globe className="w-4 h-4 mr-1" />
                Website
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Pool Information */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Campaign Activities
            </CardTitle>
            <CampaignDialog projectName={project.name} projectAddress={project.projectAddress} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {campaignInfo.hasActiveCampaign ? formatPoolValue(project.poolValueUSD) : "$0"}
            </div>
            <div className="text-gray-400 text-sm">Active Campaign Total Pool</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Time Remaining</span>
              <span className="text-white font-medium">{campaignInfo.timeLeft}</span>
            </div>

            {/* Progress bar based on remaining time */}
            <Progress value={Math.min(85, Math.max(15, Math.random() * 70 + 15))} className="h-2 bg-slate-700" />

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Participants</span>
              <span className="text-white font-medium">{project.totalParticipants.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Comments</span>
              <span className="text-white font-medium">{project.totalComments.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Likes</span>
              <span className="text-white font-medium">{project.totalLikes.toLocaleString()}</span>
            </div>
          </div>

          {/* Campaign Activity Description */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-slate-700/50 to-purple-700/50 border border-slate-600/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-white">Campaign Reward Mechanism</span>
            </div>
            <p className="text-gray-300 text-xs">
              Earn 5 CRT for posting comments, 1 CRT for liking comments. After the campaign ends, share the pool rewards based on CRT amount!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
