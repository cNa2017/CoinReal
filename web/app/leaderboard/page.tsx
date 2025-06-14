import { ProjectLayout } from "@/components/project-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, ExternalLink, Users, MessageSquare } from "lucide-react"

const leaderboardData = [
  {
    rank: 1,
    name: "Bitcoin",
    symbol: "BTC",
    color: "from-orange-500 to-yellow-500",
    tvl: "$847.2B",
    change24h: 2.34,
    participants: 15420,
    comments: 8934,
    rewardPool: "$45,230",
    category: "Store of Value",
  },
  {
    rank: 2,
    name: "Ethereum",
    symbol: "ETH",
    color: "from-blue-500 to-purple-500",
    tvl: "$423.8B",
    change24h: -1.23,
    participants: 12890,
    comments: 7234,
    rewardPool: "$32,450",
    category: "Smart Contracts",
  },
  {
    rank: 3,
    name: "Solana",
    symbol: "SOL",
    color: "from-purple-500 to-pink-500",
    tvl: "$89.4B",
    change24h: 5.67,
    participants: 8934,
    comments: 4567,
    rewardPool: "$18,920",
    category: "Layer 1",
  },
  {
    rank: 4,
    name: "Cardano",
    symbol: "ADA",
    color: "from-blue-600 to-cyan-500",
    tvl: "$45.2B",
    change24h: 1.89,
    participants: 6234,
    comments: 3421,
    rewardPool: "$12,340",
    category: "Layer 1",
  },
  {
    rank: 5,
    name: "Polkadot",
    symbol: "DOT",
    color: "from-pink-500 to-rose-500",
    tvl: "$32.1B",
    change24h: -0.45,
    participants: 4567,
    comments: 2890,
    rewardPool: "$9,870",
    category: "Interoperability",
  },
  {
    rank: 6,
    name: "Chainlink",
    symbol: "LINK",
    color: "from-blue-500 to-indigo-500",
    tvl: "$28.9B",
    change24h: 3.21,
    participants: 3890,
    comments: 2345,
    rewardPool: "$8,450",
    category: "Oracle",
  },
  {
    rank: 7,
    name: "Avalanche",
    symbol: "AVAX",
    color: "from-red-500 to-pink-500",
    tvl: "$24.7B",
    change24h: 2.78,
    participants: 3456,
    comments: 1987,
    rewardPool: "$7,230",
    category: "Layer 1",
  },
  {
    rank: 8,
    name: "Polygon",
    symbol: "MATIC",
    color: "from-purple-600 to-indigo-500",
    tvl: "$19.3B",
    change24h: -2.14,
    participants: 2890,
    comments: 1654,
    rewardPool: "$5,890",
    category: "Layer 2",
  },
]

export default function LeaderboardPage() {
  return (
    <ProjectLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Project Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Top performing crypto projects by community engagement and rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-2">$1.2T</div>
              <div className="text-gray-400 text-sm">Total Value Locked</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">58,234</div>
              <div className="text-gray-400 text-sm">Active Participants</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">31,567</div>
              <div className="text-gray-400 text-sm">Total Comments</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">$140,380</div>
              <div className="text-gray-400 text-sm">Total Rewards</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Top Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/30">
                  <TableHead className="text-gray-400">#</TableHead>
                  <TableHead className="text-gray-400">Project</TableHead>
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400">TVL</TableHead>
                  <TableHead className="text-gray-400">24h Change</TableHead>
                  <TableHead className="text-gray-400">Participants</TableHead>
                  <TableHead className="text-gray-400">Comments</TableHead>
                  <TableHead className="text-gray-400">Reward Pool</TableHead>
                  <TableHead className="text-gray-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((project) => (
                  <TableRow key={project.rank} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell className="text-white font-medium">#{project.rank}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {project.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{project.name}</div>
                          <div className="text-gray-400 text-sm">{project.symbol}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-700 text-gray-300 border-slate-600">
                        {project.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-white font-medium">{project.tvl}</TableCell>

                    <TableCell>
                      <div
                        className={`flex items-center gap-1 ${project.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {project.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {project.change24h >= 0 ? "+" : ""}
                          {project.change24h}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>{project.participants.toLocaleString()}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-300">
                        <MessageSquare className="w-4 h-4" />
                        <span>{project.comments.toLocaleString()}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-cyan-400 font-medium">{project.rewardPool}</TableCell>

                    <TableCell>
                      <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProjectLayout>
  )
}
