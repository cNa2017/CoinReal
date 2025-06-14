import { ProjectLayout } from "@/components/project-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Coins, TrendingUp, Award, Clock } from "lucide-react"

export default function UserPage() {
  return (
    <ProjectLayout>
      <div className="grid grid-cols-5 gap-6">
        {/* Main Content (3/5) */}
        <div className="col-span-3 space-y-6">
          {/* User Profile Header */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-cyan-500/50">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xl font-bold">
                    CR
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-white">CryptoRealist</h1>
                  <p className="text-gray-400">Active Community Member</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <Award className="w-3 h-3 mr-1" />
                      Elite Contributor
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Earnings Overview */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                Earnings Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="text-3xl font-bold text-green-400 mb-2">$1,247.50</div>
                  <div className="text-gray-400">Total Rewards Earned</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">$324.80</div>
                  <div className="text-gray-400">Pending Rewards</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  type: "comment",
                  project: "Bitcoin",
                  content: "Great analysis on the recent price movement. The technical indicators suggest...",
                  likes: 23,
                  time: "2 hours ago",
                  reward: "+5 Comment Tokens",
                },
                {
                  type: "like",
                  project: "Ethereum",
                  content: "Liked a comment about ETH 2.0 staking rewards",
                  time: "5 hours ago",
                  reward: "+2 Like Tokens",
                },
                {
                  type: "comment",
                  project: "Solana",
                  content: "The network performance has been impressive lately. Low fees and fast...",
                  likes: 15,
                  time: "1 day ago",
                  reward: "+5 Comment Tokens",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "comment" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {activity.type === "comment" ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <ThumbsUp className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{activity.project}</span>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {activity.time}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{activity.content}</p>
                    <div className="flex items-center justify-between">
                      {activity.likes && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <ThumbsUp className="w-3 h-3" />
                          {activity.likes} likes
                        </div>
                      )}
                      <div className="text-green-400 text-xs font-medium">{activity.reward}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Detailed Stats (2/5) */}
        <div className="col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>Total Comments</span>
                </div>
                <span className="text-white font-semibold">127</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Total Likes Given</span>
                </div>
                <span className="text-white font-semibold">342</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Likes Received</span>
                </div>
                <span className="text-white font-semibold">891</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Token Holdings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-400">Comment Tokens</div>
                <div className="text-cyan-400 font-semibold">635</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-gray-400">Like Tokens</div>
                <div className="text-purple-400 font-semibold">284</div>
              </div>

              <div className="pt-2 border-t border-slate-700/50">
                <div className="text-sm text-gray-400 mb-2">Estimated Next Payout</div>
                <div className="text-green-400 font-semibold text-lg">$324.80 USDC</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Active Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Bitcoin", symbol: "BTC", color: "from-orange-500 to-yellow-500", activity: "3 comments" },
                { name: "Ethereum", symbol: "ETH", color: "from-blue-500 to-purple-500", activity: "5 comments" },
                { name: "Solana", symbol: "SOL", color: "from-purple-500 to-pink-500", activity: "2 comments" },
              ].map((project, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {project.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{project.name}</div>
                    <div className="text-gray-400 text-xs">{project.activity}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProjectLayout>
  )
}
