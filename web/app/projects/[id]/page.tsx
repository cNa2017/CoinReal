import { ProjectLayout } from "@/components/project-layout"
import { CommentSection } from "@/components/comment-section"
import { ProjectInfo } from "@/components/project-info"
import { Badge } from "@/components/ui/badge"

const projectData = {
  bitcoin: {
    name: "Bitcoin",
    symbol: "BTC",
    description:
      "The original cryptocurrency and digital gold standard. Bitcoin is a decentralized digital currency that enables peer-to-peer transactions without the need for intermediaries.",
    color: "from-orange-500 to-yellow-500",
    pool: "$12,450",
    timeLeft: "5 days",
    participants: 1247,
    website: "https://bitcoin.org",
    whitepaper: "https://bitcoin.org/bitcoin.pdf",
  },
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    description:
      "Smart contract platform powering DeFi and NFTs. Ethereum is a decentralized platform that runs smart contracts and enables developers to build decentralized applications.",
    color: "from-blue-500 to-purple-500",
    pool: "$8,920",
    timeLeft: "3 days",
    participants: 892,
    website: "https://ethereum.org",
    whitepaper: "https://ethereum.org/en/whitepaper/",
  },
  solana: {
    name: "Solana",
    symbol: "SOL",
    description:
      "High-performance blockchain for decentralized applications. Solana is designed to facilitate decentralized app (DApp) creation with fast transaction speeds and low costs.",
    color: "from-purple-500 to-pink-500",
    pool: "$5,680",
    timeLeft: "7 days",
    participants: 634,
    website: "https://solana.com",
    whitepaper: "https://solana.com/solana-whitepaper.pdf",
  },
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = projectData[params.id as keyof typeof projectData]

  if (!project) {
    return (
      <ProjectLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-gray-400">The project you're looking for doesn't exist.</p>
        </div>
      </ProjectLayout>
    )
  }

  return (
    <ProjectLayout>
      <div className="grid grid-cols-5 gap-6 h-full">
        {/* Main Content - Comments (3/5) */}
        <div className="col-span-3">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center text-white font-bold text-xl`}
              >
                {project.symbol.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active
                  </Badge>
                  <span className="text-gray-400">{project.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          <CommentSection projectId={params.id} />
        </div>

        {/* Right Sidebar - Project Info (1/5) */}
        <div className="col-span-2">
          <ProjectInfo project={project} />
        </div>
      </div>
    </ProjectLayout>
  )
}
