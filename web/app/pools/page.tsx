"use client"

import { ProjectLayout } from "@/components/project-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Award,
    Clock,
    DollarSign,
    History,
    MessageSquare,
    Target,
    Trophy,
    Users
} from "lucide-react"
import { useEffect, useState } from "react"

interface PoolData {
  id: string
  name: string
  symbol: string
  totalPool: string
  currentRound: number
  nextDrawDate: Date
  participants: number
  comments: number
  status: "Active" | "Drawing" | "Completed"
  distribution: {
    commentRewards: number
    likeRewards: number
    eliteRewards: number
  }
}

interface DrawHistory {
  round: number
  date: string
  totalReward: string
  winners: {
    category: string
    count: number
    totalAmount: string
  }[]
  status: "Completed" | "Pending"
}

interface Winner {
  id: string
  username: string
  avatar: string
  category: "评论者" | "点赞者" | "精英"
  amount: string
  tokens: number
}

export default function PoolsPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 12,
    minutes: 34,
    seconds: 56
  })

  // Mock数据
  const poolData: PoolData = {
    id: "bitcoin-pool",
    name: "Bitcoin 社区奖池",
    symbol: "BTC",
    totalPool: "$45,230",
    currentRound: 12,
    nextDrawDate: new Date("2024-12-25T12:00:00"),
    participants: 15420,
    comments: 1247,
    status: "Active",
    distribution: {
      commentRewards: 60,
      likeRewards: 25,
      eliteRewards: 15
    }
  }

  const drawHistory: DrawHistory[] = [
    {
      round: 11,
      date: "2024-12-15",
      totalReward: "$38,450",
      winners: [
        { category: "评论者", count: 234, totalAmount: "$23,070" },
        { category: "点赞者", count: 1205, totalAmount: "$9,612" },
        { category: "精英", count: 12, totalAmount: "$5,768" }
      ],
      status: "Completed"
    },
    {
      round: 10,
      date: "2024-12-08",
      totalReward: "$42,300",
      winners: [
        { category: "评论者", count: 198, totalAmount: "$25,380" },
        { category: "点赞者", count: 1089, totalAmount: "$10,575" },
        { category: "精英", count: 15, totalAmount: "$6,345" }
      ],
      status: "Completed"
    },
    {
      round: 9,
      date: "2024-12-01",
      totalReward: "$35,800",
      winners: [
        { category: "评论者", count: 156, totalAmount: "$21,480" },
        { category: "点赞者", count: 934, totalAmount: "$8,950" },
        { category: "精英", count: 8, totalAmount: "$5,370" }
      ],
      status: "Completed"
    }
  ]

  const recentWinners: Winner[] = [
    {
      id: "1",
      username: "CryptoMaster",
      avatar: "👑",
      category: "精英",
      amount: "$892",
      tokens: 245
    },
    {
      id: "2", 
      username: "BTCHodler",
      avatar: "💎",
      category: "评论者",
      amount: "$234",
      tokens: 178
    },
    {
      id: "3",
      username: "DeFiExplorer",
      avatar: "🚀",
      category: "点赞者",
      amount: "$156",
      tokens: 89
    },
    {
      id: "4",
      username: "BlockchainDev",
      avatar: "⚡",
      category: "评论者",
      amount: "$198",
      tokens: 156
    },
    {
      id: "5",
      username: "Web3Builder",
      avatar: "🛠️",
      category: "精英",
      amount: "$445",
      tokens: 198
    }
  ]

  // 倒计时逻辑
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = poolData.nextDrawDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [poolData.nextDrawDate])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "评论者": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "点赞者": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "精英": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Drawing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Completed": return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <ProjectLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            奖池中心
          </h1>
          <p className="text-gray-400 text-lg">查看奖池分配、开奖历史和获奖者信息</p>
        </div>

        {/* 当前奖池概览 */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white text-2xl">{poolData.name}</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  第 {poolData.currentRound} 轮 · {poolData.symbol}
                </CardDescription>
              </div>
              <Badge variant="secondary" className={getStatusColor(poolData.status)}>
                {poolData.status === "Active" ? "进行中" : poolData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-slate-700/30 border-slate-600/50">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-cyan-400">{poolData.totalPool}</div>
                  <div className="text-gray-400 text-sm">当前奖池</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/30 border-slate-600/50">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">{poolData.participants.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">参与用户</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/30 border-slate-600/50">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">{poolData.comments.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">总评论数</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/30 border-slate-600/50">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">{poolData.currentRound}</div>
                  <div className="text-gray-400 text-sm">当前轮次</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 开奖倒计时 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                下次开奖倒计时
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "天", value: timeLeft.days },
                    { label: "时", value: timeLeft.hours },
                    { label: "分", value: timeLeft.minutes },
                    { label: "秒", value: timeLeft.seconds }
                  ].map((item, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-3xl font-bold text-cyan-400">{item.value.toString().padStart(2, '0')}</div>
                      <div className="text-gray-400 text-sm">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-gray-400">
                  开奖时间: {poolData.nextDrawDate.toLocaleDateString()} {poolData.nextDrawDate.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 奖池分配机制 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                奖池分配机制
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      60%
                    </Badge>
                    <span className="text-gray-300">评论者奖励</span>
                  </div>
                  <span className="text-cyan-400 font-medium">
                    ${(parseFloat(poolData.totalPool.replace(/[\$,]/g, "")) * 0.6).toLocaleString()}
                  </span>
                </div>
                <Progress value={60} className="h-2" />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      25%
                    </Badge>
                    <span className="text-gray-300">点赞者奖励</span>
                  </div>
                  <span className="text-purple-400 font-medium">
                    ${(parseFloat(poolData.totalPool.replace(/[\$,]/g, "")) * 0.25).toLocaleString()}
                  </span>
                </div>
                <Progress value={25} className="h-2" />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      15%
                    </Badge>
                    <span className="text-gray-300">精英奖励</span>
                  </div>
                  <span className="text-green-400 font-medium">
                    ${(parseFloat(poolData.totalPool.replace(/[\$,]/g, "")) * 0.15).toLocaleString()}
                  </span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最近获奖者 */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              最近获奖者
            </CardTitle>
            <CardDescription className="text-gray-400">
              上轮开奖的优秀获奖者展示
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {recentWinners.map((winner, index) => (
                <div key={winner.id} className="bg-slate-700/30 rounded-lg p-4 text-center relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        #{index + 1}
                      </Badge>
                    </div>
                  )}
                  <div className="text-2xl mb-2">{winner.avatar}</div>
                  <div className="text-white font-medium text-sm mb-1">{winner.username}</div>
                  <Badge variant="secondary" className={`${getCategoryColor(winner.category)} text-xs mb-2`}>
                    {winner.category}
                  </Badge>
                  <div className="text-cyan-400 font-bold">{winner.amount}</div>
                  <div className="text-gray-400 text-xs">{winner.tokens} tokens</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 开奖历史 */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              开奖历史
            </CardTitle>
            <CardDescription className="text-gray-400">
              查看历史开奖记录和奖励分配详情
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {drawHistory.map((record) => (
                <div key={record.round} className="border border-slate-700 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-white font-medium text-lg">第 {record.round} 轮开奖</h3>
                      <p className="text-gray-400">{record.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold text-xl">{record.totalReward}</div>
                      <Badge variant="secondary" className={getStatusColor(record.status)}>
                        {record.status === "Completed" ? "已完成" : "处理中"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {record.winners.map((winner, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className={getCategoryColor(winner.category)}>
                            {winner.category}
                          </Badge>
                          <span className="text-gray-400 text-sm">{winner.count} 人</span>
                        </div>
                        <div className="text-white font-bold">{winner.totalAmount}</div>
                        <div className="text-gray-400 text-sm">
                          平均 ${(parseFloat(winner.totalAmount.replace(/[\$,]/g, "")) / winner.count).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                查看更多历史记录
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 参与提示 */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Target className="w-12 h-12 text-cyan-400" />
              <div>
                <h3 className="text-white font-bold text-lg mb-2">如何参与奖池分配？</h3>
                <p className="text-gray-300 mb-4">
                  持有对应代币即可评论获得 5 个评论Token，评论被点赞还能获得额外Token。
                  钱包资产 ≥ $100 USDC 即可点赞获得点赞Token。
                </p>
                <div className="flex gap-4">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    立即参与
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                    了解规则
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProjectLayout>
  )
} 