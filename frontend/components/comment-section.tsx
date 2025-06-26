"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CommentFilter } from "@/components/ui/comment-filter"
import { CommentTag } from "@/components/ui/comment-tag"
import { SentimentPKBar } from "@/components/ui/sentiment-pk-bar"
import { Textarea } from "@/components/ui/textarea"
import { useContractApi } from "@/hooks/use-contract-api"
import { useLikeComment, usePostComment, useProjectComments } from "@/hooks/use-project"
import { formatTimestamp, shortenAddress } from "@/utils/contract-helpers"
import { Coins, MessageSquare, Send, ThumbsDown, ThumbsUp } from "lucide-react"
import { useMemo, useState } from "react"

interface CommentSectionProps {
  projectId: string
}

export function CommentSection({ projectId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null)
  
  // 使用hooks获取数据和操作
  useContractApi() // 自动连接钱包和合约
  const { data: commentsData, isLoading: loading } = useProjectComments(projectId)
  const postCommentMutation = usePostComment()
  const likeCommentMutation = useLikeComment(projectId)
  
  const comments = commentsData?.comments || []

  // 计算各类评论数量
  const commentCounts = useMemo(() => {
    const total = comments.length
    const positive = comments.filter(c => c.flag === 1).length
    const negative = comments.filter(c => c.flag === 2).length
    const neutral = comments.filter(c => c.flag === 3).length
    const untagged = comments.filter(c => c.flag === 0).length
    
    return { total, positive, negative, neutral, untagged }
  }, [comments])

  // 筛选评论
  const filteredComments = useMemo(() => {
    if (selectedFilter === null) {
      return comments
    }
    return comments.filter(comment => comment.flag === selectedFilter)
  }, [comments, selectedFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await postCommentMutation.mutateAsync({ projectId, content: newComment })
      setNewComment("")
    } catch (error) {
      console.error("Failed to post comment:", error)
    }
  }

  const handleLike = async (commentId: number) => {
    try {
      await likeCommentMutation.mutateAsync(commentId)
    } catch (error) {
      console.error("Failed to like comment:", error)
    }
  }

  const handleDislike = (commentId: number) => {
    // 功能开发中，暂不可用
    console.log('Dislike feature is under development:', commentId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="What's your take on this project? Share your analysis and earn CRT tokens..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-gray-400 min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Share Your Thoughts
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>Earn CRT tokens + bonus for likes</span>
              </div>
              <Button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sentiment PK Bar */}
      <SentimentPKBar comments={comments} />

      {/* Comment Filter */}
      <CommentFilter 
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        commentCounts={commentCounts}
      />

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {selectedFilter !== null ? "没有找到相关评论" : "No comments yet"}
              </h3>
              <p className="text-gray-400">
                {selectedFilter !== null 
                  ? "尝试切换其他筛选条件或清除筛选查看所有评论" 
                  : "Be the first to share your thoughts and earn CRT tokens!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 border border-slate-600">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm">
                      {shortenAddress(comment.author).slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-white">{shortenAddress(comment.author)}</span>
                      {comment.verified && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Verified
                        </Badge>
                      )}
                      {comment.isElite && (
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          Elite
                        </Badge>
                      )}
                      <CommentTag flag={comment.flag} />
                      <span className="text-gray-400 text-sm">{formatTimestamp(comment.timestamp)}</span>
                    </div>

                    <p className="text-gray-300 leading-relaxed mb-4">{comment.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(comment.id)}
                          className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 gap-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {comment.likes}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDislike(comment.id)}
                          disabled
                          className="text-gray-500 cursor-not-allowed gap-2"
                          title="功能开发中"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          {comment.dislikes || 0}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-400 font-medium">+{comment.crtReward} CRT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
