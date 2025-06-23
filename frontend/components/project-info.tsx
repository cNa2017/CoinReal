import { CampaignDialog } from "@/components/sponsor-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Project } from "@/lib/mock-data"
import { formatPoolValue, formatTimeLeft } from "@/utils/contract-helpers"
import { ExternalLink, Globe, Trophy, Zap } from "lucide-react"

interface ProjectInfoProps {
  project: Project
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="space-y-6">
      {/* 项目基本信息 */}
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
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {project.category}
            </Badge>
            {project.website && (
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                <Globe className="w-4 h-4 mr-1" />
                官网
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign奖池信息 */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Campaign活动
            </CardTitle>
            <CampaignDialog projectName={project.name} projectAddress={project.projectAddress} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{formatPoolValue(project.poolValueUSD)}</div>
            <div className="text-gray-400 text-sm">活跃Campaign总奖池</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">剩余时间</span>
              <span className="text-white font-medium">{formatTimeLeft(project.nextDrawTime)}</span>
            </div>

            {/* 基于时间剩余的进度条 */}
            <Progress value={Math.min(85, Math.max(15, Math.random() * 70 + 15))} className="h-2 bg-slate-700" />

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">参与者</span>
              <span className="text-white font-medium">{project.totalParticipants.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">评论数</span>
              <span className="text-white font-medium">{project.totalComments.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">点赞数</span>
              <span className="text-white font-medium">{project.totalLikes.toLocaleString()}</span>
            </div>
          </div>

          {/* Campaign活动说明 */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-slate-700/50 to-purple-700/50 border border-slate-600/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-white">Campaign奖励机制</span>
            </div>
            <p className="text-gray-300 text-xs">
              发表评论获得5 CRT，点赞评论获得1 CRT。活动结束后，根据CRT数量瓜分奖池奖励！
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
