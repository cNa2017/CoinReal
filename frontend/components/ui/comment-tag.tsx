import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CommentTagProps {
  flag: number
  className?: string
}

// Tag configuration
const TAG_CONFIG = {
  0: { label: "No Tag", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", show: true }, // No tag - now also displayed
  1: { label: "Positive", color: "bg-green-500/20 text-green-400 border-green-500/30", show: true }, // Positive
  2: { label: "Negative", color: "bg-red-500/20 text-red-400 border-red-500/30", show: true }, // Negative
  3: { label: "Neutral", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", show: true }, // Neutral
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