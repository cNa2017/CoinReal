"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Coins, MessageSquare, Send, ThumbsDown, ThumbsUp } from "lucide-react"
import { useState } from "react"

interface CommentSectionProps {
  projectId: string
}

const mockComments = [
  {
    id: 1,
    author: "CryptoAnalyst",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto-analyst",
    content:
      "The recent price action shows strong bullish momentum. Technical indicators are aligning perfectly with the fundamental analysis. This could be the beginning of a major breakout.",
    likes: 23,
    dislikes: 2,
    timestamp: "2 hours ago",
    verified: true,
    tokens: 5,
  },
  {
    id: 2,
    author: "BlockchainExpert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blockchain-expert",
    content:
      "Great project with solid fundamentals. The team has been consistently delivering on their roadmap. Long-term outlook remains very positive despite short-term volatility.",
    likes: 15,
    dislikes: 1,
    timestamp: "4 hours ago",
    verified: true,
    tokens: 8,
  },
  {
    id: 3,
    author: "DeFiTrader",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=defi-trader",
    content:
      "Market sentiment is shifting. We're seeing increased institutional interest and adoption. The next few weeks will be crucial for price discovery.",
    likes: 31,
    dislikes: 3,
    timestamp: "6 hours ago",
    verified: false,
    tokens: 12,
  },
  {
    id: 4,
    author: "CryptoNewbie",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto-newbie",
    content:
      "Still learning about this project but the community seems very supportive. Can someone explain the tokenomics in simple terms?",
    likes: 7,
    dislikes: 0,
    timestamp: "8 hours ago",
    verified: false,
    tokens: 5,
  },
]

export function CommentSection({}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(mockComments)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: comments.length + 1,
      author: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto-analyst",
      content: newComment,
      likes: 0,
      dislikes: 0,
      timestamp: "Just now",
      verified: true,
      tokens: 5,
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleLike = (commentId: number) => {
    setComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
    )
  }

  const handleDislike = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, dislikes: (comment.dislikes || 0) + 1 } : comment,
      ),
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Share Your Thoughts
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="What's your take on this project? Share your analysis and earn tokens..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-gray-400 min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>Earn 5 Comment Tokens + bonus for likes</span>
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

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 border border-slate-600">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm">
                    {comment.author.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-white">{comment.author}</span>
                    {comment.verified && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        Verified Holder
                      </Badge>
                    )}
                    <span className="text-gray-400 text-sm">{comment.timestamp}</span>
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
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 gap-2"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        {comment.dislikes || 0}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-400 font-medium">+{comment.tokens} tokens</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
