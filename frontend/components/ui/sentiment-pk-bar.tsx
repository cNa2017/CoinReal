import { cn } from "@/lib/utils"
import type { Comment } from "@/types"

interface SentimentPKBarProps {
  comments: Comment[]
  className?: string
}

export function SentimentPKBar({ comments, className }: SentimentPKBarProps) {
  // Calculate positive and negative power values
  const calculatePower = (flag: number) => {
    const filteredComments = comments.filter(comment => comment.flag === flag)
    const commentPower = filteredComments.length // Each comment counts as 1 power value
    const likesPower = filteredComments.reduce((sum, comment) => sum + comment.likes, 0) // Each like counts as 1 power value
    return commentPower + likesPower
  }

  const positivePower = calculatePower(1) // Positive comment power
  const negativePower = calculatePower(2) // Negative comment power
  const totalPower = positivePower + negativePower

  // 调试信息
  console.log('PK Bar Debug:', {
    totalComments: comments.length,
    positivePower,
    negativePower,
    totalPower,
    comments: comments.map(c => ({ id: c.id, flag: c.flag, likes: c.likes }))
  })

  // 计算百分比
  const positivePercentage = totalPower > 0 ? (positivePower / totalPower) * 100 : 0
  const negativePercentage = totalPower > 0 ? (negativePower / totalPower) * 100 : 0

  return (
    <div className={cn("bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm h-[90px] flex flex-col justify-between", className)}>
      {/* Battle sides information */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-green-400 font-medium">Positive</span>
          <span className="text-gray-400">({positivePower})</span>
        </div>
        <div className="text-gray-500 font-mono text-lg">VS</div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">({negativePower})</span>
          <span className="text-red-400 font-medium">Negative</span>
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
        </div>
      </div>

      {/* 大型进度条容器 */}
      <div className="relative h-16 bg-slate-700 rounded-full overflow-hidden border-2 border-slate-600 shadow-inner">
        {/* 积极方进度条 - 从左边开始 */}
        {positivePower > 0 && (
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 via-green-500 to-green-400 transition-all duration-700 ease-out flex items-center justify-end pr-4 shadow-lg"
            style={{ width: `${positivePercentage}%` }}
          >
            {positivePercentage > 12 && (
              <span className="text-lg font-bold text-white drop-shadow-lg">
                {positivePercentage.toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* Negative side progress bar - starts from right */}
        {negativePower > 0 && (
          <div 
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 via-red-500 to-red-400 transition-all duration-700 ease-out flex items-center justify-start pl-4 shadow-lg"
            style={{ width: `${negativePercentage}%` }}
          >
            {negativePercentage > 12 && (
              <span className="text-lg font-bold text-white drop-shadow-lg">
                {negativePercentage.toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* If no data, show placeholder */}
        {totalPower === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400">No PK data yet</span>
          </div>
        )}
      </div>
    </div>
  )
} 