"use client"

import { ProjectLayout } from "@/components/project-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContractApi } from "@/hooks/use-contract-api"
import { Project } from "@/types"
import { formatPoolValue, formatTimeLeft, getProjectColor } from "@/utils/contract-helpers"
import { MessageSquare, ThumbsUp, Users } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useContractApi()

  // 使用 useCallback 稳定函数引用
  const loadProjects = useCallback(async () => {
    if (!api.canRead) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await api.contractApi.getProjects()
      setProjects(data)
    } catch (error) {
      console.error("Failed to load projects:", error)
      setError("Failed to load projects. Please check your network connection.")
    } finally {
      setLoading(false)
    }
  }, [api.canRead, api.contractApi])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  if (loading) {
    return (
      <ProjectLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects from {api.contractNetwork}...</p>
          </div>
        </div>
      </ProjectLayout>
    )
  }

  if (error) {
    return (
      <ProjectLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-red-400 mb-4">⚠️ Error</div>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadProjects} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </ProjectLayout>
    )
  }

  return (
    <ProjectLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Crypto Projects Community
          </h1>
          <p className="text-gray-400 text-lg">Explore the most active cryptocurrency projects and participate in discussions to earn rewards</p>
          
          {/* Network Status */}
          <div className="mt-4 flex justify-center">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
              Connected to {api.contractNetwork}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-2">
                {projects.length}
              </div>
              <div className="text-gray-400 text-sm">Active Projects</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {projects.reduce((sum, p) => sum + p.totalParticipants, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Participants</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {projects.reduce((sum, p) => sum + p.totalComments, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Comments</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {formatPoolValue(projects.reduce((sum, p) => sum + p.poolValueUSD, 0))}
              </div>
              <div className="text-gray-400 text-sm">Total Pool Amount</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
              <Link key={project.projectAddress} href={`/projects/${project.projectAddress}`}>
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${getProjectColor(project.projectAddress)} flex items-center justify-center text-white font-bold text-lg`}
                        >
                          {project.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg group-hover:text-cyan-400 transition-colors">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="text-gray-400">{project.symbol}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            project.status === "Active" 
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : project.status === "New"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {project.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-slate-600 text-gray-300">
                          {project.category}
                        </Badge>
                      </div>
                    </div>

                    <CardDescription className="text-gray-400 line-clamp-2 mb-4">
                      {project.description}
                    </CardDescription>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{project.totalParticipants.toLocaleString()} participants</span>
                        </div>
                        <div className="text-cyan-400 font-semibold">{formatPoolValue(project.poolValueUSD)} pool</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{project.totalComments.toLocaleString()} comments</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{project.totalLikes.toLocaleString()} likes</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                        <div className="text-gray-400 text-sm">Next draw</div>
                        <div className="text-purple-400 font-medium text-sm">
                          {formatTimeLeft(project.nextDrawTime)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Want to create your own project community?
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Create a dedicated discussion forum for your crypto project, set up reward pools to incentivize community participation, and get real user feedback and support
            </p>
            <Link href="/create-project">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-3"
              >
                Create Project Forum
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </ProjectLayout>
  )
}
