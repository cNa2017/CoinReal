"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useContractApi } from "@/hooks/use-contract-api"
import { useCreateCampaign } from "@/hooks/use-project"
import { AlertCircle, Trophy, Zap } from "lucide-react"
import { useEffect, useState } from "react"

// Token static information mapping
const TOKEN_INFO: Record<string, { name: string; icon: string }> = {
  usdc: { name: "USD Coin", icon: "💵" },
  usdt: { name: "Tether", icon: "₮" },
  dai: { name: "Dai Stablecoin", icon: "🏦" },
  weth: { name: "Wrapped Ether", icon: "⚡" },
  bnb: { name: "BNB", icon: "🟡" },
}

interface Token {
  name: string
  symbol: string
  address: string
  decimals: number
  icon: string
}

const durationOptions = [
  { value: "2", label: "2 minutes (test)" },
  { value: "10080", label: "7 days" },    // 7 * 24 * 60 = 10080 minutes
  { value: "20160", label: "14 days" },   // 14 * 24 * 60 = 20160 minutes
  { value: "43200", label: "30 days" },   // 30 * 24 * 60 = 43200 minutes
  { value: "86400", label: "60 days" },   // 60 * 24 * 60 = 86400 minutes
  { value: "129600", label: "90 days" },  // 90 * 24 * 60 = 129600 minutes
]

interface CampaignDialogProps {
  projectName: string
  projectAddress: string
}

export function CampaignDialog({ projectName, projectAddress }: CampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [duration, setDuration] = useState<string>("")
  const [sponsorName, setSponsorName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [supportedTokens, setSupportedTokens] = useState<Token[]>([])
  const [tokensLoading, setTokensLoading] = useState(true)
  
  const api = useContractApi()
  const createCampaignMutation = useCreateCampaign()

  useEffect(() => {
    loadSupportedTokens()
  }, [])

  const loadSupportedTokens = async () => {
    setTokensLoading(true)
    try {
      // 从部署信息中加载真实的代币地址
      const response = await fetch('/deployments.json')
      const deployments = await response.json()
      
      if (deployments.tokens) {
        const tokens: Token[] = Object.entries(deployments.tokens).map(([key, address]) => {
          // 使用TOKEN_INFO中的信息，如果没有则使用默认值
          const tokenInfo = TOKEN_INFO[key] || { 
            name: key.toUpperCase(), 
            icon: "🪙" 
          }
          
          return {
            name: tokenInfo.name,
            symbol: key.toUpperCase(),
            address: address as string,
            decimals: key === 'usdc' || key === 'usdt' ? 6 : 18, // USDC和USDT通常是6位小数
            icon: tokenInfo.icon
          }
        })
        
        setSupportedTokens(tokens)
        console.log('加载的代币列表:', tokens)
      } else {
        throw new Error('部署信息中没有找到代币配置')
      }
    } catch (error) {
      console.error("Failed to load supported tokens:", error)
      setError('无法加载代币信息，请刷新页面重试')
    } finally {
      setTokensLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedToken || !amount || !duration || !sponsorName || !api?.isConnected) {
      setError("Please connect wallet and fill in all fields")
      return
    }

    const tokenData = supportedTokens.find(t => t.symbol === selectedToken)
    if (!tokenData) {
      setError("Invalid token selection")
      return
    }

    setError("")

    try {
      await createCampaignMutation.mutateAsync({
        projectAddress,
        sponsorName,
        duration: parseInt(duration),
        rewardToken: tokenData.address,
        rewardAmount: amount,
        rewardTokenDecimals: tokenData.decimals
      })
      
      console.log("成功创建Campaign:", projectName, "奖池:", amount, selectedToken, "持续:", duration, "分钟")
      
      // 重置表单并关闭对话框
      setSelectedToken("")
      setAmount("")
      setDuration("")
      setSponsorName("")
      setOpen(false)
      
      // 成功提示会通过mutation的成功回调处理
    } catch (error) {
      console.error("创建Campaign失败:", error)
      setError(`创建Campaign失败: ${(error as Error).message}`)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setSelectedToken("")
    setAmount("")
    setDuration("")
    setSponsorName("")
    setError("")
  }

  const getSelectedTokenData = () => {
    return supportedTokens.find(t => t.symbol === selectedToken)
  }

  // Format duration for display
  const formatDurationDisplay = (durationMinutes: string): string => {
    const minutes = parseInt(durationMinutes)
    if (minutes < 60) {
      return `${minutes} minutes`
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60)
      return `${hours} hours`
    } else {
      const days = Math.floor(minutes / 1440)
      return `${days} days`
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        >
          <Trophy className="w-4 h-4 mr-1" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Create Campaign for {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-slate-700/50 to-purple-700/50 border border-slate-600/50">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-300 text-sm">
              Create reward campaigns to incentivize users to participate in {projectName} community discussions
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Earn CRT tokens for comments, share the pool when campaign ends
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

          {!tokensLoading && supportedTokens.length === 0 && !error && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Unable to load token information, please refresh and try again</span>
              </div>
            </div>
          )}

          {!api?.isConnected && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Please connect wallet to create campaign</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorName" className="text-gray-300">
                Sponsor Name
              </Label>
              <Input
                id="sponsorName"
                type="text"
                placeholder="Enter your name or organization name"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                disabled={createCampaignMutation.isPending}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-gray-300">
                  Reward Token
                </Label>
                <Select 
                  value={selectedToken} 
                  onValueChange={setSelectedToken} 
                  disabled={createCampaignMutation.isPending || tokensLoading}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder={tokensLoading ? "Loading tokens..." : "Select token"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {tokensLoading ? (
                      <SelectItem value="loading" disabled className="text-gray-400">
                        Loading token information...
                      </SelectItem>
                    ) : supportedTokens.length === 0 ? (
                      <SelectItem value="no-tokens" disabled className="text-gray-400">
                        No available tokens
                      </SelectItem>
                    ) : (
                      supportedTokens.map((token) => (
                        <SelectItem
                          key={token.symbol}
                          value={token.symbol}
                          className="text-white hover:bg-slate-600 focus:bg-slate-600"
                        >
                          <div className="flex items-center gap-2">
                            <span>{token.icon}</span>
                            <span>{token.symbol}</span>
                            <span className="text-gray-400 text-xs">({token.name})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-300">
                  Pool Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={createCampaignMutation.isPending}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-300">
                Campaign Duration
              </Label>
              <Select value={duration} onValueChange={setDuration} disabled={createCampaignMutation.isPending}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {durationOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-slate-600 focus:bg-slate-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedToken && amount && duration && sponsorName && (
            <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600/50">
              <div className="text-sm text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>Campaign Creator:</span>
                  <span className="font-medium text-white">{sponsorName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pool Amount:</span>
                  <span className="font-medium text-white">{amount} {selectedToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium text-white">{formatDurationDisplay(duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token Type:</span>
                  <span className="font-medium text-white">{getSelectedTokenData()?.name}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={createCampaignMutation.isPending}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedToken || !amount || !duration || !sponsorName || !api?.isConnected || createCampaignMutation.isPending || tokensLoading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {createCampaignMutation.isPending ? "Creating..." : tokensLoading ? "Loading..." : "Create Campaign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
