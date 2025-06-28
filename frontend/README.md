# CoinReal Web Application

Coin Circle Dianping - The first decentralized content community that realizes "comments equal income, likes equal coins" through an innovative Campaign reward mechanism

## 🎯 Core Features

### 💰 Campaign Reward Mechanism
- **Project-Campaign separation**: The project focuses on the comment and like system, while the campaign manages the reward distribution
- **Independent CRT Token**: Each Campaign issues independent CRT tokens ("Project Name-Campaign Number")
- **Comment Reward**: Post a comment to get 5 CRTs in all active campaigns
- **Like Reward**: The person who clicks the like button and the person who is liked will each receive 1 CRT
- **Reward pool distribution**: 60% comment reward + 25% like reward + 15% elite reward
- **Soulbound Features**: CRT tokens are not transferable and represent real contribution

### 🚀 Campaign system advantages
- **Flexible rewards**: Anyone can create a campaign and customize reward tokens and amounts
- **Multiple Campaigns in Parallel**: A project can have multiple active Campaigns, and users can receive rewards at the same time
- **Time control**: Campaign has a clear start and end time
- **Smart extension**: Automatically extend for 7 days when there are no participants to avoid wasting resources
- **Minimum Proxy Mode**: Save 95%+ of deployment costs

## 📁 Project Structure

```
frontend/
├── app/ # Next.js App Router page
│ ├── create-project/ # Create a project page
│ ├── docs/ # Help documentation page
│ ├── leaderboard/ # Leaderboard page
│ ├── pools/ # Campaign prize pool page ✨
│ ├── projects/ # Project list and details page
│ │ └── [id]/ # Dynamic project details page
│ ├── project-admin/ # Project management page
│ ├── user/ # User center page
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page
├── components/ # Reusable components
│ ├── ui/ # UI component library (shadcn/ui)
│ ├── campaign-list.tsx # Campaign list component ✨
│ ├── comment-section.tsx # Comment section component
│ ├── navigation.tsx # Navigation component
│ ├── network-status.tsx # Network status component ✨
│ ├── project-info.tsx # Project information component
│ ├── project-layout.tsx # Project layout component
│ ├── providers.tsx # Application-level Providers
│ ├── sponsor-dialog.tsx # Create a campaign dialog ✨
│ ├── table.tsx # Table component
│ ├── wagmi-sync-provider.tsx # Wagmi Sync Provider ✨
│ └── wallet-status.tsx # Wallet status component ✨
├── hooks/ # Custom React Hooks
│ ├── use-contract-api.ts # Contract API Hook ✨
│ ├── use-project.ts # Project related operations
│ ├── use-wagmi-sync.ts # Wagmi Sync Hook ✨
│ └── use-wallet.ts # Wallet related operations ✨
├── lib/ # Tool library and configuration
│ ├── contract-api.ts # Basic contract API implementation ✨
│ ├── wagmi-contract-api.ts # Wagmi contract API implementation ✨
│ ├── wagmi-provider.tsx # Wagmi Provider ✨
│ ├── wagmi.ts # Wagmi configuration ✨
│ └── utils.ts # General utility functions
├── config/ # Configuration files ✨
│ └── networks.ts # Network configuration
├── constants/ # Constant definition
│ └── chains.ts # Blockchain configuration ✨
├── types/ # TypeScript type definitions
│ └── index.ts # Global types (enhanced)
├── utils/ # Business tool functions
│ ├── contract-helpers.ts # Contract data conversion tool ✨
│ └── format.ts #Formatting function
├── public/ # Static resources
│ ├── abi-json/ # Contract ABI file ✨
│ │ ├── CoinRealPlatform.json
│ │ ├── Project.json
│ │ ├── Campaign.json ✨
│ │ ├── CampaignFactory.json ✨
│ │ ├── ProjectFactory.json ✨
│ │ ├── MockPriceOracle.json
│ │ └── MockERC20.json
│ ├── deployments.json # Contract deployment information ✨
│ └── ...
└── package.json # Project dependencies

✨ = Files that were added or significantly modified after Campaign system integration
```

## 🚀 Technology Stack

### Front-end framework
- **Next.js 15.2.4** - React framework (App Router)
- **React 19.0.0** - UI library
- **TypeScript 5** - Type support
- **Tailwind CSS 4.0** - Style framework

### Web3 Technology Stack ✨
- **Wagmi 2.15.6** - React Hooks for Ethereum
- **Viem 2.x** - Low-level Ethereum library
- **@tanstack/react-query 5.81.2** - Asynchronous state management

### UI Component Library
- **@radix-ui/*** - Accessibility component primitives
- **shadcn/ui** - Component system
- **lucide-react** - Icon library
- **class-variance-authority** - Style variant management

Development Tools
- **ESLint 9** - Code linting
- **pnpm** - Package Manager

## 🔗 Smart Contract Integration

### Campaign system architecture ✨
The project integrates a complete Campaign reward system:

- **CoinRealPlatform** - Platform main contract, managing projects and campaigns
- **Project** - Project Contract (Comment and Like System)
- **ProjectFactory** - Project factory contract (minimal proxy mode)
- **Campaign** - Campaign contract (independent CRT token + reward distribution)
- **CampaignFactory** - Campaign factory contract (minimal proxy mode)
- **MockPriceOracle** - Price Oracle Contract
- **MockERC20** - Test token contract

### Campaign workflow ✨
```
1. Project creation → Project contract deployment → Start receiving comments and likes
2. Create a Campaign → Deploy the Campaign Contract → Start Minting CRT Rewards
3. User participation → Comment/Like → Earn CRT in all active campaigns
4. Campaign ends → Rewards are distributed → Users receive real token rewards
```

### Rewards ✨
- **Comment Reward**: 5 CRT (in all active campaigns)
- **Like Reward**: The person who likes and the person who is liked will each receive 1 CRT
- **Prize Pool Distribution**:
- 60% distributed to all participants according to their CRT ratio
- 25% is distributed to active users who like according to the CRT ratio of likes
- 15% elite reward (split equally among the reviewers who receive the most CRT)

### Technical Advantages✨
- **Minimum Proxy Mode**: Save 95%+ of deployment costs
- **Soulbound CRT**: Tokens are not transferable and represent real contributions
- **Multiple Campaigns in Parallel**: Users can receive rewards in multiple Campaigns at the same time
- **Automatic extension mechanism**: Avoid wasting resources on invalid campaigns

## 📦 Dependency Management

The project uses pnpm for dependency management. The main dependencies include:

### Core Dependencies
```json
{
"next": "15.2.4",
"react": "^19.0.0",
"typescript": "^5",
"wagmi": "^2.15.6",
"viem": "2.x",
"@tanstack/react-query": "^5.81.2"
}
```

### UI component dependencies
```json
{
"@radix-ui/react-*": "^1.x",
"lucide-react": "^0.513.0",
"tailwindcss": "^4",
"class-variance-authority": "^0.7.1"
}
```

## 🛠️ Development Guidelines

### File naming
- Component file: `kebab-case.tsx` (such as `wallet-status.tsx`)
- Hook files: `use-*.ts` (e.g. `use-contract-api.ts`)
- Configuration file: `kebab-case.ts` (such as `networks.ts`)
- File type: `index.ts`

### Code Organization
- **Contract integration layer** (`lib/wagmi-contract-api.ts`)
- **State management layer** (`hooks/use-*.ts`)
- **Component presentation layer** (`components/*.tsx`)
- **Type definition layer** (`types/index.ts`)
- **Configuration management layer** (`config/*.ts`)

### Component design principles
- TypeScript strict mode
- Separation of contract status and UI status
- Error boundary and loading state handling
- Responsive design first

### Campaign system integration ✨
- **Campaign list**: Displays all active campaigns of the project
- **CRT balance display**: the user's CRT token balance in each campaign
- **Reward Collection**: Reward collection function after the campaign ends
- **Campaign creation**: Anyone can create a new campaign for a project

### Data conversion layer ✨
- **CRT precision conversion**: 18 decimal places → integer display
- **Prize pool value calculation**: Calculate USD value through price oracle
- **Time processing**: Unix timestamp → remaining time display
- **Address formatting**: Full address → Shortened display

## 🎯 Deployment Guide

### Local Development Environment
```bash
# Install dependencies
pnpm install

# Start the development server
pnpm-dev

# Build production version
pnpm build
```

### Contract network configuration
```TypeScript
// config/networks.ts
export const CONTRACT_NETWORK = anvil // Current: local development network
// export const CONTRACT_NETWORK = sepolia // Can switch to: test network
```

### Environment variables
```env
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_NETWORK=anvil
```

## 🔄 Data Flow Architecture

### Read operation flow
```
User request → useContractApi Hook → Wagmi readContract → Contract call → Data conversion → Front-end display
```

### Write operation process
```
User operation → Permission check → Wagmi writeContract → Wallet confirmation → Transaction send → Status update → UI refresh
```

### Campaign Status Synchronization
```
Campaign event → Wagmi event listener → React Query cache update → component state refresh
```

## 🌐 Network architecture and maintenance

### Dual configuration system architecture ✨
The project adopts a dual Wagmi configuration architecture to achieve separation of responsibilities:

```TypeScript
// lib/wagmi.ts
export const contractConfig = createConfig({
chains: [CONTRACT_NETWORK], // Fixed single network
connectors: [injected()],
transports: { [CONTRACT_NETWORK.id]: http() }
})

export const userConfig = createConfig({
chains: [mainnet, sepolia, anvil], // Support multiple networks
connectors: [injected()],
transports:
[mainnet.id]: http(),
[sepolia.id]: http(),
[anvil.id]: http()
}
})
```

### Configure usage scenarios
| Operation Type | Usage Configuration | Description |
|----------|----------|------|
| **Contract read and write operations** | `contractConfig` | Fixed use of `CONTRACT_NETWORK` to ensure stable contract interaction |
| **Wallet connection** | `userConfig` | Support multiple networks, follow the user wallet network |
| **Balance query** | `userConfig` | Get the user's token balance in each network |
| **Network switching** | `userConfig` | Users can switch between supported networks |

### Network Configuration Maintenance

#### 1. Modify the contract deployment network
```TypeScript
// config/networks.ts
export const CONTRACT_NETWORK = sepolia // Switch from anvil to sepolia
```
**Area of ​​impact:**
- All contract read and write operations automatically switch to the new network
- Need to update deployment configuration files and redeploy contracts

#### 2. Add new supported networks
```TypeScript
// constants/chains.ts - Add new networks to the supported list
export const SUPPORTED_CHAINS: SupportedChain[] = [
// ... existing network
{
id: newChain.id,
name: "New network name",
symbol: "TOKEN",
color: "bg-green-500",
chain: newChain,
},
]

// lib/wagmi.ts - Update userConfig
export const userConfig = createConfig({
chains: [mainnet, sepolia, anvil, newChain], // Add a new chain
transports:
// ... existing transport configuration
[newChain.id]: http(), // Add RPC configuration of new chain
},
})
```

### New Interface Development Guide

#### Interface type judgment decision tree
```
New interface requirements
├── Is contract interaction required?
│ ├── Yes → Contract read and write operations all use contractConfig
│ └── No→ Use userConfig to obtain user information
```

#### Interface development template
```TypeScript
// Contract interaction interface (both read and write operations use contractConfig)
async function newContractMethod(params: any) {
await ensureInitialized()
  
// Read operation
const result = await readContract(contractConfig, {
address: deploymentsInfo.platform,
abi: CoinRealPlatformABI,
functionName: 'yourFunction',
args: [params]
})
  
// Write operation (using retry mechanism)
const hash = await writeContractWithRetry({
address: deploymentsInfo.platform,
abi: CoinRealPlatformABI,
functionName: 'yourFunction',
args: [params]
})
  
return result
}

// User information interface (using userConfig)
function useUserBalance() {
const { address } = useAccount() // Automatically use userConfig
const chainId = useChainId() // Get the user's current network
  
const { data: balance } = useBalance({
address,
chainId
})
  
return balance
}
```

### State synchronization mechanism ✨
The project implements a complete state synchronization mechanism to solve the connector error after page refresh:

#### Core Components
- **`useWagmiSync`** - Connection status synchronization Hook to ensure the connection is fully ready
- **`WagmiSyncProvider`** - Application-level synchronization provider
- **`writeContractWithRetry`** - write contract function with retry mechanism

#### Issues Resolved
- Connector status is inconsistent after page refresh
- `getChainId is not a function` error
- React SSR hydration issue
- Dual configuration architecture synchronization issue

### Environment deployment configuration

#### Local Development Environment
```bash
# Start the local blockchain
anvil

# Deploy the contract
cd ../background && forge script script/Deploy.s.sol --broadcast

# Start the frontend
pnpm-dev
```

#### Testnet deployment
```TypeScript
// 1. Modify network configuration
export const CONTRACT_NETWORK = sepolia

// 2. Update environment variables
NEXT_PUBLIC_CONTRACT_NETWORK=sepolia

// 3. Redeploy the contract to the test network
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

### Common Problems Troubleshooting

#### Wallet connection issue
- **Error after page refresh**: Solved by state synchronization mechanism
- **Network switch failed**: Check if it is in the `SUPPORTED_CHAINS` list
- **Contract call failed**: Confirm that the user is in the correct contract network

#### Development and debugging steps
1. Check the browser console log
2. Verify contract deployment status and address
3. Confirm that the network configuration is correct
4. Check wallet connection status and network

## 📊 Monitoring and analytics

### Contract event monitoring
- `ProjectCreated` - Project creation event
- `CampaignCreated` - Campaign created event
- `CommentPosted` - comment posted event
- `CommentLiked` - Comment like event
- `CRTMinted` - CRT token minting event
- `RewardsDistributed` - Rewards distribution event

### Performance Optimization
- React Query caching strategy
- Batch processing of contract calls
- Component lazy loading
- Image optimization

## 🚀 Future plans

### Functions to be implemented
- **Elite Review System**: Automatically identify high-quality reviews
- **Platform authentication mechanism**: Verify user identity
- **Downvote function**: Negative feedback mechanism
- **Multi-language support**: international expansion
- **Mobile adaptation**: Responsive optimization

### Technology Upgrade
- **Layer 2 Integration**: Reduce Gas Fees
- **IPFS storage**: decentralized content storage
- **GraphQL API**: More efficient data query
- **PWA support**: offline functionality
- **Chainlink CCIP**:Multi-chain payment

---
