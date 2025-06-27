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
      question: "How to start using CoinReal?",
      answer: "First connect your Web3 wallet, then browse project pages. Hold corresponding tokens to participate in comments, wallet assets worth ≥$100 USDC to like. Each comment automatically earns 5 comment tokens, likes earn like tokens.",
      category: "getting-started"
    },
    {
      id: "2",
      question: "What are the requirements for commenting and liking?",
      answer: "Comment requirements: Need to hold corresponding project tokens (e.g., BTC project requires holding BTC). Like requirements: Total wallet assets equivalent ≥$100 USDC. Comment length limited to 10-500 characters.",
      category: "participation"
    },
    {
      id: "3",
      question: "How are token rewards distributed?",
      answer: "Pool distributed as 60% commenter rewards, 25% liker rewards, 15% elite rewards. Lottery every 7-30 days, rewards distributed proportionally based on your token holdings. Early participants enjoy time-weighted advantages.",
      category: "rewards"
    },
    {
      id: "4",
      question: "What are elite rewards?",
      answer: "Elite rewards specifically reward high-quality comments that receive many likes. The system filters elite comments based on comment quality, like count, participation time and other factors, and their authors receive additional elite rewards.",
      category: "rewards"
    },
    {
      id: "5",
      question: "Which blockchain networks are supported?",
      answer: "Currently supports Ethereum mainnet, Polygon, BSC, Arbitrum and other mainstream networks. You can switch networks after wallet connection, projects and pools on different networks are independent.",
      category: "technical"
    },
    {
      id: "6",
      question: "How to prevent vote manipulation and bots?",
      answer: "We use multiple protections: 1) Wallet asset threshold verification, 2) Chainlink oracle real-time token holding verification, 3) AI content quality detection, 4) On-chain behavior analysis, 5) Reputation system accumulation.",
      category: "security"
    },
    {
      id: "7",
      question: "How do project teams create new project sections?",
      answer: "Visit the 'Create Project' page, fill in project information (name, token symbol, description, website, etc.), submit contract address verification, set initial pool amount, choose lottery cycle. Goes live after approval.",
      category: "project-creation"
    },
    {
      id: "8",
      question: "When are rewards distributed?",
      answer: "Each project has a fixed lottery cycle (7-30 days). When lottery time arrives, the system automatically calculates token distribution ratios and completes reward distribution to your wallet address within 24 hours.",
      category: "rewards"
    }
  ]

  const guideData: GuideSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Star,
      description: "Learn CoinReal basic functions and usage flow",
      steps: [
        "Connect Web3 wallet (MetaMask, WalletConnect, etc.)",
        "Browse project list, select cryptocurrency projects of interest",
        "Ensure wallet holds corresponding project tokens",
        "Post comments to earn 5 comment tokens",
        "Like quality comments to earn like tokens",
        "Wait for lottery cycle to end and receive reward distribution"
      ]
    },
    {
      id: "earning-rewards",
      title: "Earning Rewards",
      icon: Coins,
      description: "Master various methods to earn tokens and rewards",
      steps: [
        "Comment rewards: Each comment automatically earns 5 comment tokens",
        "Like rewards: Liking comments earns like tokens",
        "Quality rewards: High-quality comments get more likes, increasing token count",
        "Elite rewards: Quality comments have chance to earn 15% of elite pool",
        "Early rewards: Early participants enjoy time-weighted advantages",
        "Activity rewards: Continuous participation improves reputation, more opportunities"
      ]
    },
    {
      id: "security-tips",
      title: "Security Tips",
      icon: Shield,
      description: "Protect your assets and account security",
      steps: [
        "Only connect wallet on official website, beware of phishing sites",
        "Regularly check wallet authorizations, revoke unnecessary contract permissions",
        "Never share private keys or seed phrases with anyone",
        "Use hardware wallets to store large amounts",
        "Enable wallet transaction confirmation features",
        "Follow official announcements for latest security information"
      ]
    },
    {
      id: "project-management",
      title: "Project Management",
      icon: Users,
      description: "How project teams manage their communities",
      steps: [
        "Create project: Submit project information and contract address",
        "Set up pool: Add initial pool funds to incentivize users",
        "Manage cycles: Set appropriate lottery cycles (7-30 days)",
        "Monitor data: View participating users, comment data, pool usage",
        "Community interaction: Pay attention to user feedback, maintain project reputation",
        "Continuous operation: Regularly add pool funds to maintain activity"
      ]
    }
  ]

  const categories = [
    { id: "all", name: "All", count: faqData.length },
    { id: "getting-started", name: "Getting Started", count: faqData.filter(item => item.category === "getting-started").length },
    { id: "participation", name: "Participation Rules", count: faqData.filter(item => item.category === "participation").length },
    { id: "rewards", name: "Reward System", count: faqData.filter(item => item.category === "rewards").length },
    { id: "technical", name: "Technical Issues", count: faqData.filter(item => item.category === "technical").length },
    { id: "security", name: "Security", count: faqData.filter(item => item.category === "security").length },
    { id: "project-creation", name: "Project Creation", count: faqData.filter(item => item.category === "project-creation").length }
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
            Help Center
          </h1>
          <p className="text-gray-400 text-lg">Learn about CoinReal usage, rules and frequently asked questions</p>
        </div>

        {/* 搜索框 */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search help content..."
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
                  <p className="text-gray-400">No relevant questions found, please try other keywords</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 功能特色 */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">AI Smart Tags</h3>
                <p className="text-gray-400 text-sm">
                  Utilize artificial intelligence to automatically analyze comment content, perform topic classification and sentiment analysis, improving information retrieval accuracy
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Chainlink Oracle</h3>
                <p className="text-gray-400 text-sm">
                  Real-time on-chain data retrieval and user asset verification, ensuring transparency and fairness in reward distribution
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Open Source Transparency</h3>
                <p className="text-gray-400 text-sm">
                  All smart contract code is completely open source, pool funds and distribution logic are publicly verifiable, ensuring user trust
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