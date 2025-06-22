"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useContractApi } from "@/hooks/use-contract-api"
import { AlertTriangle, CheckCircle, Wifi } from "lucide-react"
import { useSwitchChain } from "wagmi"

interface NetworkStatusProps {
  showFullCard?: boolean
}

export function NetworkStatus({ showFullCard = false }: NetworkStatusProps) {
  const api = useContractApi()
  const { switchChain } = useSwitchChain()

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: api.contractChainId })
    }
  }

  if (showFullCard) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Network Status</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Contract Network:</span>
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                {api.contractNetwork}
              </Badge>
            </div>

            {api.isConnected && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Your Wallet:</span>
                <Badge 
                  variant="outline" 
                  className={`${
                    api.isOnContractNetwork 
                      ? "border-green-500/50 text-green-400" 
                      : "border-yellow-500/50 text-yellow-400"
                  }`}
                >
                  Chain {api.userChainId}
                </Badge>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Read Access:</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Available</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Write Access:</span>
              <div className="flex items-center gap-2">
                {api.canWrite ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Available</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">
                      {!api.isConnected ? "Connect Wallet" : "Switch Network"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {api.isConnected && !api.isOnContractNetwork && (
              <Button 
                onClick={handleSwitchNetwork}
                size="sm"
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Switch to {api.contractNetwork}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Simple badge view
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
        {api.contractNetwork}
      </Badge>
      
      {api.isConnected && !api.isOnContractNetwork && (
        <Badge 
          variant="outline" 
          className="border-yellow-500/50 text-yellow-400 cursor-pointer hover:bg-yellow-500/10"
          onClick={handleSwitchNetwork}
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Switch Network
        </Badge>
      )}
    </div>
  )
} 