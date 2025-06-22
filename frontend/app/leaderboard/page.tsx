"use client"

import { ProjectLayout } from "@/components/project-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockApi, Project } from "@/lib/mock-data"
import { ExternalLink, MessageSquare, TrendingDown, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function LeaderboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await mockApi.getLeaderboard()
      setProjects(data)
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProjectLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </ProjectLayout>
    )
  }
  return (
    <ProjectLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Project Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Top crypto projects ranked by community engagement and reward performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-2">
                ${projects.reduce((sum, p) => sum + parseFloat(p.tvl?.replace(/[\$B]/g, "") || "0"), 0).toFixed(1)}T
              </div>
              <div className="text-gray-400 text-sm">Total Value Locked</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {projects.reduce((sum, p) => sum + p.participants, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Active Participants</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {projects.reduce((sum, p) => sum + p.comments, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Comments</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                ${projects.reduce((sum, p) => sum + parseFloat(p.pool.replace(/[\$,]/g, "")), 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Reward Pool</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Top Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/30">
                  <TableHead className="text-gray-400">#</TableHead>
                  <TableHead className="text-gray-400">Project</TableHead>
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400">TVL</TableHead>
                  <TableHead className="text-gray-400">24h Change</TableHead>
                  <TableHead className="text-gray-400">Participants</TableHead>
                  <TableHead className="text-gray-400">Comments</TableHead>
                  <TableHead className="text-gray-400">Reward Pool</TableHead>
                  <TableHead className="text-gray-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project, index) => (
                  <TableRow key={project.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell className="text-white font-medium">#{index + 1}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {project.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{project.name}</div>
                          <div className="text-gray-400 text-sm">{project.symbol}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-700 text-gray-300 border-slate-600">
                        {project.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-white font-medium">{project.tvl || 'N/A'}</TableCell>

                    <TableCell>
                      <div
                        className={`flex items-center gap-1 ${(project.change24h || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {(project.change24h || 0) >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {(project.change24h || 0) >= 0 ? "+" : ""}
                          {(project.change24h || 0).toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>{project.participants.toLocaleString()}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-300">
                        <MessageSquare className="w-4 h-4" />
                        <span>{project.comments.toLocaleString()}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-cyan-400 font-medium">{project.pool}</TableCell>

                    <TableCell>
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProjectLayout>
  )
}
