import type React from "react"
import { Navigation } from "@/components/navigation"

interface ProjectLayoutProps {
  children: React.ReactNode
}

export function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="grid grid-cols-5 min-h-screen">
        {/* Left Navigation (1/5) */}
        <div className="col-span-1 border-r border-slate-700/50">
          <Navigation />
        </div>

        {/* Main Content Area (4/5) */}
        <div className="col-span-4 p-6">{children}</div>
      </div>
    </div>
  )
}
