import { cn } from "@/lib/utils"
import type { Comment } from "@/types"

interface SentimentPKBarProps {
  comments: Comment[]
  className?: string
}

export function SentimentPKBar({ comments, className }: SentimentPKBarProps) {
  // 计算积极和消极的实力值
  const calculatePower = (flag: number) => {
    const filteredComments = comments.filter(comment => comment.flag === flag)
    const commentPower = filteredComments.length // 每个评论算1个实力值
    const likesPower = filteredComments.reduce((sum, comment) => sum + comment.likes, 0) // 每个点赞算1个实力值
    return commentPower + likesPower
  }

  const positivePower = calculatePower(1) // 积极评论实力
  const negativePower = calculatePower(2) // 消极评论实力
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
      {/* 对战双方信息 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-green-400 font-medium">积极</span>
          <span className="text-gray-400">({positivePower})</span>
        </div>
        <div className="text-gray-500 font-mono text-lg">VS</div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">({negativePower})</span>
          <span className="text-red-400 font-medium">消极</span>
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

        {/* 消极方进度条 - 从右边开始 */}
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

        {/* 如果没有数据，显示占位符 */}
        {totalPower === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400">暂无PK数据</span>
          </div>
        )}
      </div>
    </div>
  )
} 