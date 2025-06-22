"use client"

import { Button } from "@/components/ui/button"
import { WalletStatus } from "@/components/wallet-status"
import { cn } from "@/lib/utils"
import { Coins, Home, Rocket, Settings, TrendingUp, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"


const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Projects", href: "/projects", icon: Rocket },
  { name: "Profile", href: "/user", icon: User },
  { name: "Leaderboard", href: "/leaderboard", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
]

const quickLinks = [
  { name: "Bitcoin", href: "/projects/0xdec0b45cd042aabe94be7a484b300b0d09bbc72a", symbol: "BTC", color: "text-orange-400" },
  { name: "Ethereum", href: "/projects/0x8d2d84edff317afa23323f13cf9edb8fd9cb4b62", symbol: "ETH", color: "text-blue-400" },
  { name: "Solana", href: "/projects/0x7e643d5c8b6c8f9d784ae4249c45aa757166bdec", symbol: "SOL", color: "text-purple-400" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            CoinReal
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Navigation</div>

        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-slate-800/50",
                  isActive && "bg-slate-800/50 text-white border border-slate-700/50",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}

        {/* Quick Access */}
        <div className="pt-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Access</div>

          {quickLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-slate-800/50",
                  pathname === link.href && "bg-slate-800/50 text-white border border-slate-700/50",
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", link.color)} />
                <span className="text-sm">{link.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{link.symbol}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-700/50 space-y-3">
        <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 rounded-lg p-3 text-center">
          <div className="text-sm font-medium text-white mb-1">Your Balance</div>
          <div className="text-lg font-bold text-cyan-400">$1,572.30</div>
          <div className="text-xs text-gray-400">USDC Equivalent</div>
        </div>

        <WalletStatus />
      </div>
    </div>
  )
}
