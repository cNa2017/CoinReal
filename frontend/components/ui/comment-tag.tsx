import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CommentTagProps {
  flag: number
  className?: string
}

// 标签配置
const TAG_CONFIG = {
  0: { label: "无标签", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", show: true }, // 无标签 - 现在也显示
  1: { label: "积极", color: "bg-green-500/20 text-green-400 border-green-500/30", show: true }, // 积极
  2: { label: "消极", color: "bg-red-500/20 text-red-400 border-red-500/30", show: true }, // 消极
  3: { label: "中立", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", show: true }, // 中立
} as const

export function CommentTag({ flag, className }: CommentTagProps) {
  const config = TAG_CONFIG[flag as keyof typeof TAG_CONFIG] || TAG_CONFIG[0]
  
  if (!config.show) {
    return null
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        config.color,
        "text-xs",
        className
      )}
    >
      {config.label}
    </Badge>
  )
} 