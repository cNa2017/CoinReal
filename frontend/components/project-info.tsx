import { SponsorDialog } from "@/components/sponsor-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Project } from "@/lib/mock-data"
import { formatPoolValue, formatTimeLeft } from "@/utils/contract-helpers"
import { DollarSign, ExternalLink, Globe } from "lucide-react"

interface ProjectInfoProps {
  project: Project
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Project Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>

          <div className="space-y-2">
            {project.website && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700/50"
                onClick={() => window.open(project.website, '_blank')}
              >
                <Globe className="w-4 h-4 mr-2" />
                Official Website
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            )}

            {project.whitepaper && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700/50"
                onClick={() => window.open(project.whitepaper, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Whitepaper
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-700/50">
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Contract Address:</span>
                <span className="font-mono">{project.projectAddress.slice(0, 10)}...{project.projectAddress.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span>{project.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Creator:</span>
                <span className="font-mono">{project.creator.slice(0, 6)}...{project.creator.slice(-4)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Pool */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Reward Pool
            </CardTitle>
            <SponsorDialog projectName={project.name} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">{formatPoolValue(project.poolValueUSD)}</div>
            <div className="text-gray-400 text-sm">Total Available</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Time Remaining</span>
              <span className="text-white font-medium">{formatTimeLeft(project.nextDrawTime)}</span>
            </div>

            {/* Progress bar based on time remaining */}
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
              <span className="text-gray-400">Total Likes</span>
              <span className="text-white font-medium">{project.totalLikes.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Rules */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Reward Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Comment Rewards</span>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                60%
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Elite Comments</span>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                25%
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Like Rewards</span>
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                15%
              </Badge>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/50">
            <div className="text-xs text-gray-400 leading-relaxed">
              Early participants receive time-weighted bonuses. Elite comments are selected based on community
              engagement and quality. CRT tokens are distributed automatically after each draw.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Participation */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Your Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">3</div>
              <div className="text-gray-400 text-xs">Comments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">12</div>
              <div className="text-gray-400 text-xs">Likes Given</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Estimated CRT Rewards</span>
              <span className="text-green-400 font-medium">47.2 CRT</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
