import { createConfig, http } from 'wagmi'
import { anvil, arbitrum, bsc, mainnet, polygon, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [anvil, mainnet, sepolia, polygon, bsc, arbitrum],
  connectors: [
    injected(),
  ],
  transports: {
    [anvil.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
} 