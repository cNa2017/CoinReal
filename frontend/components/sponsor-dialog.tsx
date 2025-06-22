"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useContractApi } from "@/hooks/use-contract-api"
import { AlertCircle, Coins, Heart } from "lucide-react"
import { useState } from "react"

const supportedTokens = [
  { symbol: "USDC", name: "USD Coin", icon: "💵", address: "0xA0b86a33E6417AbCF4C53E47D0A47C9A36B88D4" },
  { symbol: "USDT", name: "Tether", icon: "₮", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { symbol: "DAI", name: "Dai Stablecoin", icon: "🏦", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
]

interface SponsorDialogProps {
  projectName: string
  projectAddress: string
}

export function SponsorDialog({ projectName, projectAddress }: SponsorDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const api = useContractApi()

  const handleSubmit = async () => {
    if (!selectedToken || !amount || !api?.isConnected) {
      setError("Please connect wallet and fill all fields")
      return
    }

    const tokenData = supportedTokens.find(t => t.symbol === selectedToken)
    if (!tokenData) {
      setError("Invalid token selected")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await api.contractApi.sponsorProject(projectAddress, tokenData.address, amount)
      
      console.log("Successfully sponsored project:", projectName, "with", amount, selectedToken)
      
      // Reset form and close dialog
      setSelectedToken("")
      setAmount("")
      setOpen(false)
      
      // TODO: Show success toast
    } catch (error) {
      console.error("Failed to sponsor project:", error)
      setError(`Failed to sponsor project: ${(error as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setSelectedToken("")
    setAmount("")
    setError("")
  }

  const getSelectedTokenData = () => {
    return supportedTokens.find(t => t.symbol === selectedToken)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
        >
          <Heart className="w-4 h-4 mr-1" />
          Sponsor
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Sponsor {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-slate-700/50 to-purple-700/50 border border-slate-600/50">
            <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-300 text-sm">
              Support the {projectName} community by contributing to the reward pool
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {!api?.isConnected && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Please connect your wallet to sponsor this project</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-gray-300">
                Token
              </Label>
              <Select value={selectedToken} onValueChange={setSelectedToken} disabled={isSubmitting}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {supportedTokens.map((token) => (
                    <SelectItem
                      key={token.symbol}
                      value={token.symbol}
                      className="text-white hover:bg-slate-600 focus:bg-slate-600"
                    >
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {selectedToken && amount && (
            <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600/50">
              <div className="text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>You will sponsor:</span>
                  <span className="font-medium text-white">{amount} {selectedToken}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Token:</span>
                  <span className="font-medium text-white">{getSelectedTokenData()?.name}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSubmitting}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedToken || !amount || !api?.isConnected || isSubmitting}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {isSubmitting ? "Processing..." : "Submit Sponsorship"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
