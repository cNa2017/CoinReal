"use client"

import { CampaignList } from "@/components/campaign-list"
import { CommentSection } from "@/components/comment-section"
import { ProjectLayout } from "@/components/project-layout"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/hooks/use-project"
import { getProjectColor } from "@/utils/contract-helpers"
import { useEffect, useState } from "react"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string>("")

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setProjectId(resolvedParams.id)
    }
    
    initializeParams()
  }, [params])

  // 使用React Query hook获取项目数据
  const { data: project, isLoading: loading, error } = useProject(projectId)

  if (loading) {
    return (
      <ProjectLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project...</p>
          </div>
        </div>
      </ProjectLayout>
    )
  }

  if (error || !project) {
    return (
      <ProjectLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-gray-400">The project you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </ProjectLayout>
    )
  }

  return (
    <ProjectLayout>
      <div className="grid grid-cols-5 gap-6 h-full">
        {/* Left Side - Project Title + Comments (3/5) */}
        <div className="col-span-3 space-y-6">
          {/* 项目标题 */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-r ${getProjectColor(project.projectAddress)} flex items-center justify-center text-white font-bold text-xl`}
              >
                {project.symbol.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={`${
                      project.status === "Active" 
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : project.status === "New"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {project.status}
                  </Badge>
                  <span className="text-gray-400">{project.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 评论区域 */}
          <CommentSection projectId={project.projectAddress} />
        </div>

        {/* Right Sidebar - Campaign Overview & List (2/5) */}
        <div className="col-span-2 space-y-6">
          <CampaignList projectAddress={project.projectAddress} projectName={project.name} />
        </div>
      </div>
    </ProjectLayout>
  )
}
