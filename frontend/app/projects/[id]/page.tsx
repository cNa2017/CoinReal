import { CommentSection } from "@/components/comment-section"
import { ProjectInfo } from "@/components/project-info"
import { ProjectLayout } from "@/components/project-layout"
import { Badge } from "@/components/ui/badge"

const projectData = {
  bitcoin: {
    name: "Bitcoin",
    symbol: "BTC",
    description:
      "The original cryptocurrency and digital gold standard. Bitcoin is a decentralized digital currency that enables peer-to-peer transactions without the need for intermediaries.",
    color: "from-orange-500 to-yellow-500",
    pool: "$45,230",
    timeLeft: "5 days",
    participants: 15420,
    website: "https://bitcoin.org",
    whitepaper: "https://bitcoin.org/bitcoin.pdf",
  },
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    description:
      "Smart contract platform powering DeFi and NFTs. Ethereum is a decentralized platform that runs smart contracts and enables developers to build decentralized applications.",
    color: "from-blue-500 to-purple-500",
    pool: "$32,450",
    timeLeft: "3 days",
    participants: 12890,
    website: "https://ethereum.org",
    whitepaper: "https://ethereum.org/en/whitepaper/",
  },
  solana: {
    name: "Solana",
    symbol: "SOL",
    description:
      "High-performance blockchain for decentralized applications. Solana is designed to facilitate decentralized app (DApp) creation with fast transaction speeds and low costs.",
    color: "from-purple-500 to-pink-500",
    pool: "$18,920",
    timeLeft: "7 days",
    participants: 8934,
    website: "https://solana.com",
    whitepaper: "https://solana.com/solana-whitepaper.pdf",
  },
  cardano: {
    name: "Cardano",
    symbol: "ADA",
    description:
      "Research-driven blockchain platform with peer-reviewed development approach. Focuses on sustainability, interoperability, and scalability.",
    color: "from-blue-600 to-cyan-500",
    pool: "$12,340",
    timeLeft: "4 days",
    participants: 6234,
    website: "https://cardano.org",
    whitepaper: "https://cardano.org/whitepaper",
  },
  polkadot: {
    name: "Polkadot",
    symbol: "DOT",
    description:
      "Multi-chain protocol enabling blockchain interoperability. Allows different blockchains to transfer messages and value in a trust-free fashion.",
    color: "from-pink-500 to-rose-500",
    pool: "$9,870",
    timeLeft: "6 days",
    participants: 4567,
    website: "https://polkadot.network",
    whitepaper: "https://polkadot.network/whitepaper-v1",
  },
  chainlink: {
    name: "Chainlink",
    symbol: "LINK",
    description:
      "Decentralized oracle network connecting blockchains to real-world data. Enables smart contracts to securely interact with external data sources.",
    color: "from-blue-500 to-indigo-500",
    pool: "$8,450",
    timeLeft: "8 days",
    participants: 3890,
    website: "https://chain.link",
    whitepaper: "https://link.smartcontract.com/whitepaper",
  },
  avalanche: {
    name: "Avalanche",
    symbol: "AVAX",
    description:
      "Platform for decentralized applications and custom blockchain networks. Designed to be fast, low-cost, and environmentally friendly.",
    color: "from-red-500 to-pink-500",
    pool: "$7,230",
    timeLeft: "5 days",
    participants: 3456,
    website: "https://avax.network",
    whitepaper: "https://avalanche.network/whitepapers",
  },
  polygon: {
    name: "Polygon",
    symbol: "MATIC",
    description:
      "Ethereum scaling solution providing faster and cheaper transactions. Offers Layer 2 scaling solutions for Ethereum.",
    color: "from-purple-600 to-indigo-500",
    pool: "$5,890",
    timeLeft: "9 days",
    participants: 2890,
    website: "https://polygon.technology",
    whitepaper: "https://polygon.technology/lightpaper-polygon.pdf",
  },
  dogecoin: {
    name: "Dogecoin",
    symbol: "DOGE",
    description:
      "Meme-based cryptocurrency that has become a community-driven digital asset. Originally created as a joke, now has a large and loyal community.",
    color: "from-yellow-400 to-orange-400",
    pool: "$4,560",
    timeLeft: "12 days",
    participants: 2134,
    website: "https://dogecoin.com",
    whitepaper: "https://dogecoin.com/whitepaper",
  },
  cosmos: {
    name: "Cosmos",
    symbol: "ATOM",
    description:
      "Internet of blockchains enabling independent blockchains to communicate with each other. Provides tools for scalable and interoperable blockchain ecosystem.",
    color: "from-purple-600 to-blue-500",
    pool: "$3,890",
    timeLeft: "6 days",
    participants: 1876,
    website: "https://cosmos.network",
    whitepaper: "https://cosmos.network/whitepaper",
  },
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = projectData[id as keyof typeof projectData]

  if (!project) {
    return (
      <ProjectLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-gray-400">The project you&apos;re looking for doesn&apos;t exist.</p>
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

          <CommentSection projectId={id} />
        </div>

        {/* Right Sidebar - Project Info (1/5) */}
        <div className="col-span-2">
          <ProjectInfo project={project} />
        </div>
      </div>
    </ProjectLayout>
  )
}
