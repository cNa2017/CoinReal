"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Wifi } from "lucide-react"

const networks = [
  { name: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
  { name: "Polygon", symbol: "MATIC", color: "bg-purple-500" },
  { name: "BSC", symbol: "BNB", color: "bg-yellow-500" },
  { name: "Arbitrum", symbol: "ARB", color: "bg-cyan-500" },
]

export function WalletConnection() {
  const [isConnected, setIsConnected] = useState(true) // Mock connected state
  const [currentNetwork, setCurrentNetwork] = useState(networks[0])

  const handleConnect = () => {
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
  }

  const handleNetworkChange = (network: (typeof networks)[0]) => {
    setCurrentNetwork(network)
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
        size="sm"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between border-slate-600 text-gray-300 hover:bg-slate-700/50"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentNetwork.color}`} />
              <span className="text-sm">{currentNetwork.name}</span>
            </div>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-slate-800 border-slate-700">
          {networks.map((network) => (
            <DropdownMenuItem
              key={network.name}
              onClick={() => handleNetworkChange(network)}
              className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${network.color}`} />
                <span>{network.name}</span>
                {network.name === currentNetwork.name && <Wifi className="w-3 h-3 ml-auto text-green-400" />}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          Connected
        </Badge>
        <Button
          onClick={handleDisconnect}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-red-400 text-xs p-1 h-auto"
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}
