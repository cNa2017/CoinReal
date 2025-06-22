"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContractApi } from "@/hooks/use-contract-api"
import { Project } from "@/lib/mock-data"
import { Coins, MessageSquare, Rocket, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalComments: 0,
    rewardsDistributed: "$0"
  })
  const [trendingProjects, setTrendingProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const api = useContractApi()

  useEffect(() => {
    loadPlatformStats()
  }, [api])

  const loadPlatformStats = async () => {
    if (!api) return

    setLoading(true)
    try {
      // 获取项目列表来统计数据
      const projects = await api.contractApi.getProjects(0, 100)
      
      // 计算统计数据
      const activeProjects = projects.filter(p => p.isActive).length
      const totalComments = projects.reduce((sum, p) => sum + p.totalComments, 0)
      const totalPoolValue = projects.reduce((sum, p) => sum + p.poolValueUSD, 0)
      
      setStats({
        activeProjects,
        totalComments,
        rewardsDistributed: `$${Math.floor(totalPoolValue / 100).toLocaleString()}`
      })

      // 获取前3个项目作为热门项目
      const topProjects = projects.slice(0, 3)
      setTrendingProjects(topProjects)
    } catch (error) {
      console.error('Failed to load platform stats:', error)
      // 使用默认值
      setStats({
        activeProjects: 0,
        totalComments: 0,
        rewardsDistributed: "$0"
      })
    } finally {
      setLoading(false)
    }
  }

  const getProjectColor = (index: number) => {
    const colors = [
      "from-orange-500 to-yellow-500",
      "from-blue-500 to-purple-500", 
      "from-purple-500 to-pink-500",
      "from-green-500 to-cyan-500",
      "from-red-500 to-pink-500"
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-purple-900/50">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.1) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
              <Rocket className="w-4 h-4" />
              The Future of Crypto Communities
            </div>

            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CoinReal
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The first decentralized content community where users earn cryptocurrency rewards through comments and
              likes
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/projects">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Exploring
                </Button>
              </Link>

              <Link href="/create-project">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose CoinReal?</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Advanced technology meets community-driven rewards in the ultimate crypto discussion platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">AI-Powered Tagging</CardTitle>
              <CardDescription className="text-gray-400">
                Intelligent content categorization and sentiment analysis for better discovery
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Chainlink Oracle</CardTitle>
              <CardDescription className="text-gray-400">
                Real-time data verification and transparent reward distribution on-chain
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Open Source Contracts</CardTitle>
              <CardDescription className="text-gray-400">
                Fully transparent reward pools and distribution logic for complete trust
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Platform Statistics</h3>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {loading ? "..." : stats.activeProjects}
              </div>
              <div className="text-gray-400">Active Projects</div>
            </div>

            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {loading ? "..." : stats.totalComments.toLocaleString()}
              </div>
              <div className="text-gray-400">Total Comments</div>
            </div>

            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {loading ? "..." : stats.rewardsDistributed}
              </div>
              <div className="text-gray-400">Rewards Distributed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Projects Preview */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Trending Projects</h2>
          <p className="text-gray-400 text-lg">Discover the most active crypto communities</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            [1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm animate-pulse">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-600"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-600 rounded w-20"></div>
                        <div className="h-3 bg-slate-600 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-slate-600 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-4 bg-slate-600 rounded w-24"></div>
                    <div className="h-4 bg-slate-600 rounded w-16"></div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            trendingProjects.map((project, index) => (
              <Link key={project.projectAddress} href={`/projects/${project.projectAddress}`}>
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-r ${getProjectColor(index)} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {project.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                          <CardDescription className="text-gray-400">{project.symbol}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        {project.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{project.totalComments} comments</span>
                      </div>
                      <div className="text-cyan-400 font-semibold">
                        ${Math.floor(project.poolValueUSD / 100)} pool
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              CoinReal
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Building the future of decentralized content communities where every interaction has value. Join us in
              revolutionizing how crypto communities engage and earn.
            </p>
            <div className="flex justify-center gap-6 text-gray-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">
                About
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
