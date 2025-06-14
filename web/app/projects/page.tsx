import { ProjectLayout } from "@/components/project-layout"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"

const projects = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    description: "The original cryptocurrency and digital gold standard",
    pool: "$12,450",
    comments: 1247,
    likes: 3421,
    color: "from-orange-500 to-yellow-500",
    status: "Active",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    description: "Smart contract platform powering DeFi and NFTs",
    pool: "$8,920",
    comments: 892,
    likes: 2156,
    color: "from-blue-500 to-purple-500",
    status: "Active",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    description: "High-performance blockchain for decentralized applications",
    pool: "$5,680",
    comments: 634,
    likes: 1789,
    color: "from-purple-500 to-pink-500",
    status: "Active",
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    description: "Research-driven blockchain platform with peer-reviewed development",
    pool: "$3,240",
    comments: 423,
    likes: 987,
    color: "from-blue-600 to-cyan-500",
    status: "Active",
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    description: "Multi-chain protocol enabling blockchain interoperability",
    pool: "$2,890",
    comments: 356,
    likes: 743,
    color: "from-pink-500 to-rose-500",
    status: "New",
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    description: "Decentralized oracle network connecting blockchains to real-world data",
    pool: "$4,120",
    comments: 567,
    likes: 1234,
    color: "from-blue-500 to-indigo-500",
    status: "Active",
  },
]

export default function ProjectsPage() {
  return (
    <ProjectLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Explore Projects
          </h1>
          <p className="text-gray-400 text-lg">Discover active crypto communities and start earning rewards</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center text-white font-bold`}
                      >
                        {project.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl">{project.name}</CardTitle>
                        <CardDescription className="text-gray-400 font-medium">{project.symbol}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${project.status === "New" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <CardDescription className="text-gray-300 text-sm leading-relaxed mb-4">
                    {project.description}
                  </CardDescription>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{project.comments} comments</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">{project.likes} likes</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                      <div className="text-cyan-400 font-semibold text-lg">{project.pool}</div>
                      <div className="text-gray-400 text-sm">Reward Pool</div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </ProjectLayout>
  )
}
