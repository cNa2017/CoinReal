"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getChainById, SUPPORTED_CHAINS, SupportedChain } from "@/constants/chains"
import { useWallet } from "@/hooks/use-wallet"
import { ChevronDown, Copy, LogOut, Wallet, Wifi } from "lucide-react"
import { useEffect, useState } from "react"

export function WalletStatus() {
  const {
    address,
    isConnected,
    isConnecting,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    formatAddress,
  } = useWallet()
  
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const currentNetwork = getChainById(chainId) || SUPPORTED_CHAINS[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleNetworkChange = (network: SupportedChain) => {
    switchNetwork(network.id)
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Avoid hydration errors
  if (!mounted) {
    return (
      <Button
        disabled={false}
        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
        size="sm"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
        size="sm"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Network Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between border-slate-600 text-gray-300 hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentNetwork.color}`} />
              <span className="text-sm">{currentNetwork.name}</span>
            </div>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-slate-800 border-slate-700">
          {SUPPORTED_CHAINS.map((network) => (
            <DropdownMenuItem
              key={network.id}
              onClick={() => handleNetworkChange(network)}
              className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`w-2 h-2 rounded-full ${network.color}`} />
                <span>{network.name}</span>
                {network.id === currentNetwork.id && (
                  <Wifi className="w-3 h-3 ml-auto text-green-400" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Information and Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm font-mono">{formatAddress(address)}</span>
            </div>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-slate-800 border-slate-700">
          <DropdownMenuItem
            onClick={copyAddress}
            className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={disconnectWallet}
            className="text-red-400 hover:bg-slate-700 focus:bg-slate-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 