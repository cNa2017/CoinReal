"use client"

import { ProjectLayout } from "@/components/project-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    ChevronDown,
    ChevronRight,
    Coins,
    Globe,
    HelpCircle,
    MessageSquare,
    Search,
    Shield,
    Star,
    Users,
    Zap
} from "lucide-react"
import React, { useState } from "react"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface GuideSection {
  id: string
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
  steps: string[]
}

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")

  const faqData: FAQItem[] = [
    {
      id: "1",
      question: "如何开始使用CoinReal？",
      answer: "首先连接您的Web3钱包，然后浏览项目页面。持有相应代币即可参与评论，钱包资产达到$100 USDC即可点赞。每次评论自动获得5个评论Token，点赞获得点赞Token。",
      category: "getting-started"
    },
    {
      id: "2",
      question: "评论和点赞有什么要求？",
      answer: "评论要求：需要持有对应项目的代币（如BTC项目需要持有BTC）。点赞要求：钱包总资产等值≥$100 USDC。评论字数限制在10-500字符之间。",
      category: "participation"
    },
    {
      id: "3",
      question: "Token奖励是如何分配的？",
      answer: "奖池按60%评论者奖励、25%点赞者奖励、15%精英奖励分配。每7-30天开奖一次，根据您持有的Token数量按比例分配奖励。早期参与者享有时间加权优势。",
      category: "rewards"
    },
    {
      id: "4",
      question: "什么是精英奖励？",
      answer: "精英奖励专门奖励获得高赞的优质评论。系统会根据评论质量、点赞数、参与时间等因素筛选出精英评论，这些评论的作者可以获得额外的精英奖励。",
      category: "rewards"
    },
    {
      id: "5",
      question: "支持哪些区块链网络？",
      answer: "目前支持以太坊主网、Polygon、BSC、Arbitrum等主流网络。您可以在钱包连接后切换网络，不同网络的项目和奖池相互独立。",
      category: "technical"
    },
    {
      id: "6",
      question: "如何防止刷票和机器人？",
      answer: "我们使用多重防护：1）钱包资产门槛验证，2）Chainlink预言机实时验证持币状态，3）AI内容质量检测，4）链上行为分析，5）声誉系统积累。",
      category: "security"
    },
    {
      id: "7",
      question: "项目方如何创建新的项目栏目？",
      answer: "访问'创建项目'页面，填写项目信息（名称、代币符号、描述、官网等），提交合约地址验证，设置初始奖池金额，选择开奖周期。审核通过后即可上线。",
      category: "project-creation"
    },
    {
      id: "8",
      question: "奖励什么时候发放？",
      answer: "每个项目都有固定的开奖周期（7-30天）。开奖时间到达后，系统会自动计算Token分配比例，在24小时内完成奖励发放到您的钱包地址。",
      category: "rewards"
    }
  ]

  const guideData: GuideSection[] = [
    {
      id: "getting-started",
      title: "新手入门",
      icon: Star,
      description: "了解CoinReal基本功能和使用流程",
      steps: [
        "连接Web3钱包（MetaMask、WalletConnect等）",
        "浏览项目列表，选择感兴趣的加密货币项目",
        "确保钱包中持有对应项目的代币",
        "发表评论获得5个评论Token",
        "为优质评论点赞获得点赞Token",
        "等待开奖周期结束，获得奖励分配"
      ]
    },
    {
      id: "earning-rewards",
      title: "获得奖励",
      icon: Coins,
      description: "掌握各种获得Token和奖励的方法",
      steps: [
        "评论奖励：每条评论自动获得5个评论Token",
        "点赞奖励：为评论点赞获得点赞Token",
        "质量奖励：高质量评论获得更多点赞，增加Token数量",
        "精英奖励：优质评论有机会获得15%的精英奖池",
        "早期奖励：早期参与者享有时间加权优势",
        "活跃奖励：持续参与提升声誉，获得更多机会"
      ]
    },
    {
      id: "security-tips",
      title: "安全须知",
      icon: Shield,
      description: "保护您的资产和账户安全",
      steps: [
        "只在官方网站连接钱包，警惕钓鱼网站",
        "定期检查钱包授权，撤销不必要的合约权限",
        "不要分享私钥或助记词给任何人",
        "使用硬件钱包存储大额资产",
        "开启钱包的交易确认功能",
        "关注官方公告，了解最新安全信息"
      ]
    },
    {
      id: "project-management",
      title: "项目管理",
      icon: Users,
      description: "项目方如何管理自己的社区",
      steps: [
        "创建项目：提交项目信息和合约地址",
        "设置奖池：添加初始奖池资金激励用户",
        "管理周期：设置合适的开奖周期（7-30天）",
        "监控数据：查看参与用户、评论数据、奖池使用情况",
        "社区互动：关注用户反馈，维护项目声誉",
        "持续运营：定期添加奖池资金保持活跃度"
      ]
    }
  ]

  const categories = [
    { id: "all", name: "全部", count: faqData.length },
    { id: "getting-started", name: "入门指南", count: faqData.filter(item => item.category === "getting-started").length },
    { id: "participation", name: "参与规则", count: faqData.filter(item => item.category === "participation").length },
    { id: "rewards", name: "奖励机制", count: faqData.filter(item => item.category === "rewards").length },
    { id: "technical", name: "技术问题", count: faqData.filter(item => item.category === "technical").length },
    { id: "security", name: "安全相关", count: faqData.filter(item => item.category === "security").length },
    { id: "project-creation", name: "项目创建", count: faqData.filter(item => item.category === "project-creation").length }
  ]

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <ProjectLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            帮助中心
          </h1>
          <p className="text-gray-400 text-lg">了解CoinReal的使用方法、规则说明和常见问题</p>
        </div>

        {/* 搜索框 */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="搜索帮助内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* 快速入门指南 */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">快速入门指南</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {guideData.map((guide) => {
              const IconComponent = guide.icon
              return (
                <Card key={guide.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-cyan-400" />
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {guide.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {guide.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-gray-300 text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* FAQ部分 */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">常见问题</h2>
          
          {/* 分类筛选 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className={
                      activeCategory === category.id
                        ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                        : "border-slate-600 text-gray-300 hover:bg-slate-700"
                    }
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-2 bg-slate-600 text-gray-300">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ列表 */}
          <div className="space-y-4">
            {filteredFAQ.map((faq) => (
              <Card key={faq.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white text-lg">{faq.question}</CardTitle>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                {expandedFAQ === faq.id && (
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}

            {filteredFAQ.length === 0 && (
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">没有找到相关问题，请尝试其他关键词</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 功能特色 */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">平台特色</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">AI智能标签</h3>
                <p className="text-gray-400 text-sm">
                  利用人工智能技术自动分析评论内容，进行主题分类和情感分析，提高信息检索准确度
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Chainlink预言机</h3>
                <p className="text-gray-400 text-sm">
                  实时获取链上数据并验证用户资产，保证奖金分发的透明性和公正性
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">开源透明</h3>
                <p className="text-gray-400 text-sm">
                  所有智能合约代码完全开源，奖池资金和分发逻辑公开可查，确保用户信任
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 联系支持 */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">还有其他问题？</h3>
            <p className="text-gray-300 mb-4">
              如果您在使用过程中遇到任何问题，或者需要进一步的帮助，请随时联系我们的支持团队
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                联系客服
              </Button>
              <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                加入社群
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProjectLayout>
  )
} 