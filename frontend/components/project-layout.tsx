import { Navigation } from "@/components/navigation"
import type React from "react"

interface ProjectLayoutProps {
  children: React.ReactNode
}

export function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex min-h-screen">
        {/* Left Navigation - Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-screen w-1/5 border-r border-slate-700/50 z-10">
          <Navigation />
        </div>

        {/* Main Content Area - With left margin to account for fixed sidebar */}
        <div className="flex-1 ml-[20%] p-6">{children}</div>
      </div>
    </div>
  )
}
