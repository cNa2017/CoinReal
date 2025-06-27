"use client"

import { ProjectLayout } from "@/components/project-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useContractApi } from "@/hooks/use-contract-api"
import { AlertCircle, CheckCircle, Coins, FileText, Globe, Wallet } from "lucide-react"
import { useState } from "react"

interface FormData {
  name: string
  symbol: string
  description: string
  category: string
  website: string
  whitepaper: string
  contractAddress: string
  initialPool: string
  drawPeriod: string
  logoUrl: string
}

export default function CreateProjectPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    symbol: "",
    description: "",
    category: "",
    website: "",
    whitepaper: "",
    contractAddress: "",
    initialPool: "",
    drawPeriod: "7",
    logoUrl: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const api = useContractApi()

  const projectCategories = [
    "DeFi", "NFT", "GameFi", "L1", "L2", "Infrastructure", 
    "Web3", "Metaverse", "AI", "Storage", "Oracle", "Privacy"
  ]

  const drawPeriods = [
    { value: "7", label: "7 days" },
    { value: "14", label: "14 days" },
    { value: "21", label: "21 days" },
    { value: "30", label: "30 days" }
  ]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) errors.name = "Project name cannot be empty"
    if (!formData.symbol.trim()) errors.symbol = "Token symbol cannot be empty"
    if (!formData.description.trim()) errors.description = "Project description cannot be empty"
    if (!formData.category) errors.category = "Please select project category"
    if (!formData.website.trim()) errors.website = "Website address cannot be empty"
    if (!formData.contractAddress.trim()) errors.contractAddress = "Contract address cannot be empty"
    if (!formData.initialPool || parseFloat(formData.initialPool) <= 0) {
      errors.initialPool = "Initial pool amount must be greater than 0"
    }

    // Simple URL validation
    const urlPattern = /^https?:\/\/.+/
    if (formData.website && !urlPattern.test(formData.website)) {
      errors.website = "Please enter a valid URL (starting with http:// or https://)"
    }
    if (formData.whitepaper && !urlPattern.test(formData.whitepaper)) {
      errors.whitepaper = "Please enter a valid whitepaper link"
    }

    // Simple contract address validation (Ethereum address format)
    const addressPattern = /^0x[a-fA-F0-9]{40}$/
    if (formData.contractAddress && !addressPattern.test(formData.contractAddress)) {
      errors.contractAddress = "Please enter a valid contract address (42-character hexadecimal)"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!api?.isConnected) {
      setValidationErrors({ general: "Please connect wallet first" })
      return
    }

    setIsSubmitting(true)
    
    try {
      const projectData = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        category: formData.category,
        website: formData.website,
        whitepaper: formData.whitepaper || "",
        logoUrl: formData.logoUrl || "",
        drawPeriodDays: parseInt(formData.drawPeriod)
      }

      await api.contractApi.createProject(projectData)
      
      console.log("Submitted project data:", projectData)
      setIsSuccess(true)
      
      // 3秒后重置表单
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({
          name: "",
          symbol: "",
          description: "",
          category: "",
          website: "",
          whitepaper: "",
          contractAddress: "",
          initialPool: "",
          drawPeriod: "7",
          logoUrl: ""
        })
      }, 3000)
      
    } catch (error) {
      console.error("Submission failed:", error)
      setValidationErrors({ general: "Submission failed, please try again" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <ProjectLayout>
        <div className="flex items-center justify-center py-20">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm max-w-md w-full">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Submission Successful!</h2>
              <p className="text-gray-400 mb-4">Your project has been successfully created and submitted to the blockchain.</p>
              <div className="text-sm text-gray-500">
                Page will refresh automatically...
              </div>
            </CardContent>
          </Card>
        </div>
      </ProjectLayout>
    )
  }

  return (
    <ProjectLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Create New Project
          </h1>
          <p className="text-gray-400 text-lg">Submit your cryptocurrency project and create a dedicated discussion community</p>
        </div>

        {validationErrors.general && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.general}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Basic Project Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="e.g. Bitcoin"
                  />
                  {validationErrors.name && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol" className="text-gray-300">Token Symbol *</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="e.g. BTC"
                    maxLength={10}
                  />
                  {validationErrors.symbol && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.symbol}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Project Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white min-h-[100px] resize-none"
                  placeholder="Describe your project features, use cases and value proposition in detail..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  {validationErrors.description && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm ml-auto">
                    {formData.description.length}/500
                  </p>
                </div>
              </div>

              {/* Category and Links */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Project Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select project category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {projectCategories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.category && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drawPeriod" className="text-gray-300">Lottery Cycle</Label>
                  <Select value={formData.drawPeriod} onValueChange={(value) => handleInputChange("drawPeriod", value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {drawPeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value} className="text-white">
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-gray-300 flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Website URL *
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="https://example.com"
                  />
                  {validationErrors.website && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.website}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whitepaper" className="text-gray-300 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Whitepaper Link
                  </Label>
                  <Input
                    id="whitepaper"
                    type="url"
                    value={formData.whitepaper}
                    onChange={(e) => handleInputChange("whitepaper", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="https://example.com/whitepaper.pdf"
                  />
                  {validationErrors.whitepaper && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.whitepaper}
                    </p>
                  )}
                </div>
              </div>

              {/* Technical Information */}
              <div className="space-y-2">
                <Label htmlFor="contractAddress" className="text-gray-300 flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  Contract Address *
                </Label>
                <Input
                  id="contractAddress"
                  value={formData.contractAddress}
                  onChange={(e) => handleInputChange("contractAddress", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white font-mono"
                  placeholder="0x..."
                />
                {validationErrors.contractAddress && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.contractAddress}
                  </p>
                )}
              </div>

              {/* Pool Settings */}
              <div className="space-y-2">
                <Label htmlFor="initialPool" className="text-gray-300">Initial Pool Amount (USDC) *</Label>
                <Input
                  id="initialPool"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.initialPool}
                  onChange={(e) => handleInputChange("initialPool", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="1000"
                />
                {validationErrors.initialPool && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.initialPool}
                  </p>
                )}
                <p className="text-gray-500 text-sm">
                  Recommended initial pool amount: $500 - $10,000, higher amounts attract more user participation
                </p>
              </div>

              {/* Pool Distribution Description */}
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <h3 className="text-white font-medium">Pool Distribution Mechanism</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      60%
                    </Badge>
                    <span className="text-gray-300">Commenter Rewards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      25%
                    </Badge>
                    <span className="text-gray-300">Liker Rewards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      15%
                    </Badge>
                    <span className="text-gray-300">Elite Rewards</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Project Application"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProjectLayout>
  )
} 