"use client"

import { ProjectLayout } from "@/components/project-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { mockApi, User } from "@/lib/mock-data"
import {
  Clock,
  Copy,
  ExternalLink,
  Gift,
  History,
  MessageSquare,
  Settings,
  ThumbsUp,
  TrendingUp,
  Trophy,
  User as UserIcon,
  Wallet
} from "lucide-react"
import { useEffect, useState } from "react"

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<typeof import("@/lib/mock-data").mockUserActivities>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const [userData, activityData] = await Promise.all([
        mockApi.getUser(),
        mockApi.getUserActivity()
      ])
      setUser(userData)
      setActivities(activityData)
    } catch (error) {
      console.error("Failed to load user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyWalletAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address)
      // TODO: Add toast notification
    }
  }

  if (loading) {
    return (
      <ProjectLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading user data...</p>
          </div>
        </div>
      </ProjectLayout>
    )
  }

  if (!user) {
    return (
      <ProjectLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-gray-400">Please check your login status</p>
        </div>
      </ProjectLayout>
    )
  }

  return (
    <ProjectLayout>
      <div className="space-y-8">
        {/* User Header */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.username} />
                                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-2xl">
                    {user.username?.slice(0, 2) || "U"}
                  </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                  <div className="flex gap-2 justify-center md:justify-start">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        user.status === "Verified" 
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : user.status === "Elite"
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {user.status === "Verified" ? "Verified" : user.status === "Elite" ? "Elite User" : "Active"}
                    </Badge>
                    {user.badge && (
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                        {user.badge}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 mb-4 justify-center md:justify-start">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono text-sm">{user.address}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyWalletAddress}
                    className="text-gray-400 hover:text-white p-1 h-auto"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 text-center md:text-left">
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">{user.totalRewards}</div>
                    <div className="text-gray-400 text-sm">Total Rewards</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{user.totalComments}</div>
                    <div className="text-gray-400 text-sm">Comments Posted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{user.totalLikes}</div>
                    <div className="text-gray-400 text-sm">Likes Received</div>
                  </div>
                  <div>
                    <div className="text-gray-300">{user.joinDate}</div>
                    <div className="text-gray-400 text-sm">Join Date</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                              <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Share
              </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-700">
                  {[
          { id: "overview", label: "Overview", icon: UserIcon },
          { id: "tokens", label: "Token Balance", icon: Gift },
          { id: "activities", label: "Activity History", icon: History },
          { id: "rewards", label: "Reward Statistics", icon: Trophy },
        ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Token Balance Overview */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-500" />
                  Token Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <div className="text-white font-semibold">Comment Tokens</div>
                    <div className="text-gray-400 text-sm">Comment Tokens</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-cyan-400">{user.commentTokens}</div>
                    <div className="text-gray-400 text-sm">Redeemable</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <div className="text-white font-semibold">Like Tokens</div>
                    <div className="text-gray-400 text-sm">Like Tokens</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-400">{user.likeTokens}</div>
                    <div className="text-gray-400 text-sm">Redeemable</div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                  Redeem Rewards
                </Button>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Performance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Community Activity</span>
                    <span className="text-white">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Content Quality Score</span>
                    <span className="text-white">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Reward Acquisition Rate</span>
                    <span className="text-white">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="text-sm text-gray-400 mb-2">Monthly Ranking</div>
                  <div className="text-2xl font-bold text-yellow-400">#23</div>
                  <div className="text-sm text-gray-400">Among all users</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "tokens" && (
          <div className="space-y-6">
            {/* Token Balances Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.tokenBalances?.map((token, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                          token.symbol === 'BTC' ? 'from-orange-500 to-yellow-500' :
                          token.symbol === 'ETH' ? 'from-blue-500 to-purple-500' :
                          token.symbol === 'SOL' ? 'from-purple-500 to-pink-500' :
                          token.symbol === 'ADA' ? 'from-blue-600 to-cyan-500' :
                          'from-green-500 to-emerald-500'
                        } flex items-center justify-center text-white font-bold text-sm`}>
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{token.symbol}</div>
                          <div className="text-gray-400 text-sm">{token.name}</div>
                        </div>
                      </div>
                      <div className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">{token.amount}</div>
                      <div className="text-lg text-cyan-400">{token.value}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Exchange History */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" />
                  交易记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      type: "Exchange", 
                      date: "2 hours ago", 
                      from: "485 CRT", 
                      to: "$48.50", 
                      status: "Completed" 
                    },
                    { 
                      type: "Reward", 
                      date: "1 day ago", 
                      from: "Comment Reward", 
                      to: "+15 CRT", 
                      status: "Completed" 
                    },
                    { 
                      type: "Exchange", 
                      date: "3 days ago", 
                      from: "312 CRT", 
                      to: "$31.20", 
                      status: "Completed" 
                    },
                    { 
                      type: "Reward", 
                      date: "5 days ago", 
                      from: "Like Reward", 
                      to: "+8 CRT", 
                      status: "Completed" 
                    },
                  ].map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs ${
                          record.type === "Exchange" 
                            ? "bg-blue-500/20 text-blue-400" 
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {record.type}
                        </div>
                        <div>
                          <div className="text-white text-sm">{record.from}</div>
                          <div className="text-gray-400 text-xs">{record.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-400 text-sm font-medium">{record.to}</div>
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "activities" && (
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                最近活动
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "comment" ? "bg-cyan-500/20" : 
                    activity.type === "like" ? "bg-purple-500/20" :
                    activity.type === "reward" ? "bg-green-500/20" :
                    "bg-yellow-500/20"
                  }`}>
                    {activity.type === "comment" && <MessageSquare className="w-4 h-4 text-cyan-400" />}
                    {activity.type === "like" && <ThumbsUp className="w-4 h-4 text-purple-400" />}
                    {activity.type === "reward" && <Gift className="w-4 h-4 text-green-400" />}
                    {activity.type === "achievement" && <Trophy className="w-4 h-4 text-yellow-400" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium">{activity.action}</span>
                      <span className="text-gray-400">·</span>
                      <Badge variant="outline" className="border-slate-600 text-gray-300 text-xs">
                        {activity.target}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-gray-400 text-xs">
                        {activity.timestamp}
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        {activity.reward}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无活动记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "rewards" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  奖励成就
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                                  {[
                    { title: "Comment Master", description: "Posted more than 50 comments", progress: 90, icon: "💬" },
                    { title: "Like Expert", description: "Received more than 200 likes", progress: 100, icon: "👍" },
                    { title: "Community Contributor", description: "Participated in 10 different projects", progress: 60, icon: "🏆" },
                    { title: "Early User", description: "Early registered user on the platform", progress: 100, icon: "⭐" },
                                    ].map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <div className="text-white font-medium">{achievement.title}</div>
                        <div className="text-gray-400 text-sm">{achievement.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={achievement.progress} className="flex-1 h-2" />
                      <span className="text-sm text-gray-400">{achievement.progress}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">奖励趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                    <div className="text-3xl font-bold text-green-400 mb-2">+$234.50</div>
                    <div className="text-gray-400">本月总收益</div>
                    <div className="text-sm text-green-400 mt-1">↑ 23.5% vs 上月</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className="text-xl font-bold text-cyan-400">$89.30</div>
                      <div className="text-gray-400 text-sm">评论收益</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className="text-xl font-bold text-purple-400">$145.20</div>
                      <div className="text-gray-400 text-sm">点赞收益</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <div className="text-sm text-gray-400 mb-3">收益分布</div>
                    <div className="space-y-2">
                      {[
                        { project: "Bitcoin", amount: "$78.50", percentage: 33 },
                        { project: "Ethereum", amount: "$65.20", percentage: 28 },
                        { project: "Solana", amount: "$45.80", percentage: 20 },
                        { project: "Others", amount: "$45.00", percentage: 19 },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{item.project}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{item.amount}</span>
                            <span className="text-gray-400">({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProjectLayout>
  )
}
