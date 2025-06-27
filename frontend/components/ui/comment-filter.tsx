import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Filter, X } from "lucide-react"

interface CommentFilterProps {
  selectedFilter: number | null
  onFilterChange: (filter: number | null) => void
  commentCounts: {
    total: number
    positive: number
    negative: number
    neutral: number
    untagged: number
  }
  className?: string
}

// Filter options configuration
const FILTER_OPTIONS = [
  {
    value: null,
    label: "All",
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30",
    countKey: "total" as const
  },
  {
    value: 1,
    label: "Positive",
    color: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
    countKey: "positive" as const
  },
  {
    value: 2,
    label: "Negative",
    color: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
    countKey: "negative" as const
  },
  {
    value: 3,
    label: "Neutral",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
    countKey: "neutral" as const
  },
  {
    value: 0,
    label: "No Tag",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30",
    countKey: "untagged" as const
  }
]

export function CommentFilter({ selectedFilter, onFilterChange, commentCounts, className }: CommentFilterProps) {
  return (
    <div className={cn("bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm", className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-white">Filter Comments</span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map((option) => {
            const isSelected = selectedFilter === option.value
            const count = commentCounts[option.countKey]
            
            return (
              <Button
                key={option.value?.toString() || 'all'}
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  "h-8 px-3 text-xs font-medium border transition-all duration-200",
                  isSelected 
                    ? option.color.replace('hover:', '') + " ring-1 ring-current"
                    : option.color
                )}
              >
                <span>{option.label}</span>
                {count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1.5 h-4 px-1.5 text-xs bg-white/10 text-white border-white/20"
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>

        {selectedFilter !== null && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange(null)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700/50"
            title="Clear Filter"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter result hint */}
      {selectedFilter !== null && (
        <div className="mt-2 text-xs text-gray-400">
          Showing {commentCounts[FILTER_OPTIONS.find(opt => opt.value === selectedFilter)?.countKey || 'total']} {FILTER_OPTIONS.find(opt => opt.value === selectedFilter)?.label} comments
        </div>
      )}
    </div>
  )
} 