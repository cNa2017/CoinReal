"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useContractApi } from "@/hooks/use-contract-api"
import { AlertCircle, Trophy, Zap } from "lucide-react"
import { useEffect, useState } from "react"

// 代币静态信息映射
const TOKEN_INFO: Record<string, { name: string; icon: string }> = {
  usdc: { name: "USD Coin", icon: "💵" },
  usdt: { name: "Tether", icon: "₮" },
  dai: { name: "Dai Stablecoin", icon: "🏦" },
  weth: { name: "Wrapped Ether", icon: "⚡" },
  bnb: { name: "BNB", icon: "🟡" },
}

interface TokenOption {
  symbol: string
  name: string
  icon: string
  address: string
}

const durationOptions = [
  { value: "7", label: "7天" },
  { value: "14", label: "14天" },
  { value: "30", label: "30天" },
  { value: "60", label: "60天" },
  { value: "90", label: "90天" },
]

interface CampaignDialogProps {
  projectName: string
  projectAddress: string
}

export function CampaignDialog({ projectName, projectAddress }: CampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState("")
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [sponsorName, setSponsorName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [supportedTokens, setSupportedTokens] = useState<TokenOption[]>([])
  const [tokensLoading, setTokensLoading] = useState(true)
  const api = useContractApi()

  // 动态加载代币信息
  useEffect(() => {
    const loadTokens = async () => {
      try {
        setTokensLoading(true)
        const response = await fetch('/deployments.json')
        const deployments = await response.json()
        
        if (deployments.tokens) {
          const tokens: TokenOption[] = Object.entries(deployments.tokens).map(([key, address]) => {
            const tokenInfo = TOKEN_INFO[key] || { name: key.toUpperCase(), icon: "🪙" }
            return {
              symbol: key.toUpperCase(),
              name: tokenInfo.name,
              icon: tokenInfo.icon,
              address: address as string
            }
          })
          setSupportedTokens(tokens)
        }
      } catch (error) {
        console.error('Failed to load token information:', error)
        setError('无法加载代币信息')
      } finally {
        setTokensLoading(false)
      }
    }

    loadTokens()
  }, [])

  const handleSubmit = async () => {
    if (!selectedToken || !amount || !duration || !sponsorName || !api?.isConnected) {
      setError("请连接钱包并填写所有字段")
      return
    }

    const tokenData = supportedTokens.find(t => t.symbol === selectedToken)
    if (!tokenData) {
      setError("无效的代币选择")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await api.contractApi.createCampaign({
        projectAddress,
        sponsorName,
        duration: parseInt(duration),
        rewardToken: tokenData.address,
        rewardAmount: amount
      })
      
      console.log("成功创建Campaign:", projectName, "奖池:", amount, selectedToken, "持续:", duration, "天")
      
      // 重置表单并关闭对话框
      setSelectedToken("")
      setAmount("")
      setDuration("")
      setSponsorName("")
      setOpen(false)
      
      // TODO: 显示成功提示
    } catch (error) {
      console.error("创建Campaign失败:", error)
      setError(`创建Campaign失败: ${(error as Error).message}`)
    } finally {
      setIsSubmitting(false)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        >
          <Trophy className="w-4 h-4 mr-1" />
          创建Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            为 {projectName} 创建Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-slate-700/50 to-purple-700/50 border border-slate-600/50">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-300 text-sm">
              创建奖励活动，激励用户参与 {projectName} 社区讨论
            </p>
            <p className="text-gray-400 text-xs mt-1">
              评论即获得CRT代币，活动结束后瓜分奖池
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
                <span className="text-sm">无法加载代币信息，请刷新页面重试</span>
              </div>
            </div>
          )}

          {!api?.isConnected && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">请连接钱包以创建Campaign</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorName" className="text-gray-300">
                赞助者名称
              </Label>
              <Input
                id="sponsorName"
                type="text"
                placeholder="输入您的名称或机构名称"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                disabled={isSubmitting}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-gray-300">
                  奖励代币
                </Label>
                <Select 
                  value={selectedToken} 
                  onValueChange={setSelectedToken} 
                  disabled={isSubmitting || tokensLoading}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder={tokensLoading ? "加载代币中..." : "选择代币"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {tokensLoading ? (
                      <SelectItem value="loading" disabled className="text-gray-400">
                        正在加载代币信息...
                      </SelectItem>
                    ) : supportedTokens.length === 0 ? (
                      <SelectItem value="no-tokens" disabled className="text-gray-400">
                        暂无可用代币
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
                  奖池数量
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

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-300">
                活动时长
              </Label>
              <Select value={duration} onValueChange={setDuration} disabled={isSubmitting}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="选择时长" />
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
                  <span>Campaign创建者:</span>
                  <span className="font-medium text-white">{sponsorName}</span>
                </div>
                <div className="flex justify-between">
                  <span>奖池金额:</span>
                  <span className="font-medium text-white">{amount} {selectedToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>活动时长:</span>
                  <span className="font-medium text-white">{duration} 天</span>
                </div>
                <div className="flex justify-between">
                  <span>代币类型:</span>
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
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedToken || !amount || !duration || !sponsorName || !api?.isConnected || isSubmitting || tokensLoading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {isSubmitting ? "创建中..." : tokensLoading ? "加载中..." : "创建Campaign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
