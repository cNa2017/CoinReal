"use client"

import { ProjectLayout } from "@/components/project-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    AlertCircle,
    BarChart3,
    Calendar,
    Coins,
    DollarSign,
    Edit,
    Eye,
    MessageSquare,
    Pause,
    Play,
    Plus,
    Settings,
    TrendingUp,
    Users,
    Wallet
} from "lucide-react"
import { useState } from "react"

interface ProjectData {
  id: string
  name: string
  symbol: string
  status: "Active" | "Paused" | "Draft"
  pool: string
  participants: number
  comments: number
  nextDraw: string
  createdAt: string
}

interface PoolHistory {
  id: string
  amount: string
  type: "Add" | "Withdraw" | "Reward"
  date: string
  status: "Completed" | "Pending"
}

type TabType = "overview" | "pool" | "analytics" | "settings"

export default function ProjectAdminPage() {
  const [selectedProject, setSelectedProject] = useState<string>("bitcoin")
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [newPoolAmount, setNewPoolAmount] = useState("")
  const [drawPeriod, setDrawPeriod] = useState("7")

  // Mock数据
  const userProjects: ProjectData[] = [
    {
      id: "bitcoin",
      name: "Bitcoin Community",
      symbol: "BTC",
      status: "Active",
      pool: "$45,230",
      participants: 15420,
      comments: 1247,
      nextDraw: "2024-12-25",
      createdAt: "2024-01-15"
    },
    {
      id: "ethereum",
      name: "Ethereum DeFi Hub",
      symbol: "ETH",
      status: "Active",
      pool: "$32,450",
      participants: 12890,
      comments: 892,
      nextDraw: "2024-12-23",
      createdAt: "2024-02-20"
    },
    {
      id: "solana",
      name: "Solana Builders",
      symbol: "SOL",
      status: "Paused",
      pool: "$18,920",
      participants: 8934,
      comments: 634,
      nextDraw: "2024-12-30",
      createdAt: "2024-03-10"
    }
  ]

  const poolHistory: PoolHistory[] = [
    {
      id: "1",
      amount: "+$5,000",
      type: "Add",
      date: "2024-12-20",
      status: "Completed"
    },
    {
      id: "2",
      amount: "-$2,340",
      type: "Reward",
      date: "2024-12-15",
      status: "Completed"
    },
    {
      id: "3",
      amount: "+$10,000",
      type: "Add",
      date: "2024-12-10",
      status: "Completed"
    },
    {
      id: "4",
      amount: "-$3,200",
      type: "Reward",
      date: "2024-12-05",
      status: "Completed"
    }
  ]

  const currentProject = userProjects.find(p => p.id === selectedProject)

  const handleAddPool = async () => {
    if (!newPoolAmount || parseFloat(newPoolAmount) <= 0) return
    
    setIsLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log(`Adding $${newPoolAmount} to ${selectedProject}`)
      setNewPoolAmount("")
    } catch (error) {
      console.error("Failed to add pool:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`Changing ${projectId} status to ${newStatus}`)
    } catch (error) {
      console.error("Failed to change status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Paused": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Draft": return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Add": return "text-green-400"
      case "Withdraw": return "text-red-400"
      case "Reward": return "text-blue-400"
      default: return "text-gray-400"
    }
  }

  const tabs = [
    { id: "overview", label: "概览", icon: BarChart3 },
    { id: "pool", label: "奖池管理", icon: Coins },
    { id: "analytics", label: "数据分析", icon: TrendingUp },
    { id: "settings", label: "设置", icon: Settings }
  ]

  return (
    <ProjectLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              项目管理中心
            </h1>
            <p className="text-gray-400">管理您的项目、奖池和社区活动</p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            创建新项目
          </Button>
        </div>

        {/* 项目选择器 */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">选择项目</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {userProjects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedProject === project.id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{project.name}</h3>
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>奖池:</span>
                      <span className="text-cyan-400">{project.pool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>参与者:</span>
                      <span>{project.participants.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentProject && (
          <div className="space-y-6">
            {/* 标签导航 */}
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-slate-700 text-white"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* 概览标签页 */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">当前奖池</p>
                          <p className="text-2xl font-bold text-cyan-400">{currentProject.pool}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-cyan-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">参与用户</p>
                          <p className="text-2xl font-bold text-purple-400">{currentProject.participants.toLocaleString()}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">总评论数</p>
                          <p className="text-2xl font-bold text-green-400">{currentProject.comments.toLocaleString()}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">下次开奖</p>
                          <p className="text-2xl font-bold text-yellow-400">
                            {Math.ceil((new Date(currentProject.nextDraw).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}天
                          </p>
                        </div>
                        <Calendar className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 快速操作 */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">快速操作</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700"
                        onClick={() => handleStatusChange(currentProject.id, currentProject.status === "Active" ? "Paused" : "Active")}
                        disabled={isLoading}
                      >
                        {currentProject.status === "Active" ? (
                          <><Pause className="w-4 h-4 mr-2" />暂停项目</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" />启动项目</>
                        )}
                      </Button>
                      <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                        <Eye className="w-4 h-4 mr-2" />
                        查看项目页面
                      </Button>
                      <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                        <Edit className="w-4 h-4 mr-2" />
                        编辑项目信息
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 奖池管理标签页 */}
            {activeTab === "pool" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 添加奖池 */}
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">增加奖池</CardTitle>
                      <CardDescription className="text-gray-400">
                        向项目奖池中添加资金以激励用户参与
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="poolAmount" className="text-gray-300">金额 (USDC)</Label>
                        <Input
                          id="poolAmount"
                          type="number"
                          value={newPoolAmount}
                          onChange={(e) => setNewPoolAmount(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="1000"
                          min="1"
                          step="0.01"
                        />
                      </div>
                      <Button
                        onClick={handleAddPool}
                        disabled={isLoading || !newPoolAmount || parseFloat(newPoolAmount) <= 0}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            处理中...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            添加资金
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* 奖池分配 */}
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">奖池分配</CardTitle>
                      <CardDescription className="text-gray-400">
                        当前奖池的分配机制和比例
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-gray-300">评论者奖励</span>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            60%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-gray-300">点赞者奖励</span>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            25%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-gray-300">精英奖励</span>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            15%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 奖池历史 */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">奖池历史</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-gray-400">日期</TableHead>
                          <TableHead className="text-gray-400">类型</TableHead>
                          <TableHead className="text-gray-400">金额</TableHead>
                          <TableHead className="text-gray-400">状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {poolHistory.map((record) => (
                          <TableRow key={record.id} className="border-slate-700">
                            <TableCell className="text-gray-300">{record.date}</TableCell>
                            <TableCell className="text-gray-300">{record.type}</TableCell>
                            <TableCell className={`font-medium ${getTypeColor(record.type)}`}>
                              {record.amount}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={
                                record.status === "Completed" 
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              }>
                                {record.status === "Completed" ? "已完成" : "处理中"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 数据分析标签页 */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        用户参与趋势
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                          <p>图表数据加载中...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        评论活跃度
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                          <p>图表数据加载中...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 关键指标 */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">关键指标</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400 mb-2">78%</div>
                        <div className="text-gray-400">用户活跃度</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">$2.34</div>
                        <div className="text-gray-400">平均奖励/用户</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">156%</div>
                        <div className="text-gray-400">月增长率</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 设置标签页 */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      项目设置
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-300">开奖周期</Label>
                        <Select value={drawPeriod} onValueChange={setDrawPeriod}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="7" className="text-white">7天</SelectItem>
                            <SelectItem value="14" className="text-white">14天</SelectItem>
                            <SelectItem value="21" className="text-white">21天</SelectItem>
                            <SelectItem value="30" className="text-white">30天</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">项目状态</Label>
                        <Select value={currentProject.status}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="Active" className="text-white">活跃</SelectItem>
                            <SelectItem value="Paused" className="text-white">暂停</SelectItem>
                            <SelectItem value="Draft" className="text-white">草稿</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <h3 className="text-white font-medium">危险操作</h3>
                      </div>
                      <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                        删除项目
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </ProjectLayout>
  )
} 