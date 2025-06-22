"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Coins } from "lucide-react"

const supportedTokens = [
  { symbol: "USDC", name: "USD Coin", icon: "💵" },
  { symbol: "ETH", name: "Ethereum", icon: "⟠" },
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "USDT", name: "Tether", icon: "₮" },
]

interface SponsorDialogProps {
  projectName: string
}

export function SponsorDialog({ projectName }: SponsorDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState("")
  const [amount, setAmount] = useState("")

  const handleSubmit = () => {
    // Mock submission
    console.log("Sponsoring", projectName, "with", amount, selectedToken)
    setOpen(false)
    setSelectedToken("")
    setAmount("")
  }

  const handleCancel = () => {
    setOpen(false)
    setSelectedToken("")
    setAmount("")
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-gray-300">
                Token
              </Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
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
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedToken || !amount}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              Submit Sponsorship
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
