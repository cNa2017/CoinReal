# CoinReal Background - Smart Contract Backend

## 📋 Overview

CoinReal's backend is a decentralized content community platform smart contract system built on Solidity. Through blockchain technology and innovative Campaign reward mechanism, it realizes the business model of "comments equal income, likes equal coins".

## 🏗️ Project Structure

```
background/
├── src/ # Smart contract source code
│ ├── CoinRealPlatform.sol # Platform main contract
│ ├── Project.sol # Project contract (comment and like system)
│ ├── ProjectFactory.sol # Project factory contract
│ ├── Campaign.sol # Campaign contract (reward system)
│ ├── CampaignFactory.sol # Campaign factory contract
│ ├── interfaces/ # Interface definition
│ │ ├── ICoinRealPlatform.sol
│ │ ├── IProject.sol
│ │ ├── IProjectFactory.sol
│ │ ├── ICampaign.sol
│ │ ├── ICampaignFactory.sol
│ │ └── IPriceOracle.sol
│ └── mocks/ #Test mock contract
├── test/ # Contract test file
├── script/ # Deployment script
├── INTERFACE_DOCUMENTATION.md # 📚 Detailed interface documentation
└── README.md # Project description
```

## 🚀 Core Features

### 💰 Campaign Reward Mechanism
- **Project-Campaign separation**: Project focuses on comments and likes, while Campaign manages reward distribution
- **Independent CRT Token**: Each Campaign issues independent CRT tokens ("Project Name-Campaign Number")
- **Comment Reward**: Get 5 CRT for commenting
- **Like Reward**: 1 CRT is awarded for liking, and the person being liked gets 1 CRT
- **Reward pool distribution**: 60% comment reward + 25% like reward + 15% elite reward
- **Soulbound Features**: CRT tokens are not transferable and represent real contribution

### 🎯 Campaign system advantages
- **Flexible rewards**: Anyone can create a campaign and customize reward tokens and amounts
- **Multiple Campaigns in Parallel**: A project can have multiple active Campaigns, and users can receive rewards at the same time
- **Time control**: Campaign has a clear start and end time
- **Smart extension**: Automatically extend for 7 days when there are no participants to avoid wasting resources
- **Platform management**: Reward allocation and time extension are managed by the platform

### ⚡ Technical Advantages
- **Minimum Agency Mode**: Save 95% of project and campaign creation costs
- **Batch Operation**: Optimize Gas consumption and user experience
- **Modular design**: separation of responsibilities, easy to upgrade and maintain
- **Multi-token support**: Price oracle supports any ERC20 token

## 📚 Detailed documentation

### 🔗 Quick Navigation
- **[Complete interface documentation](./INTERFACE_DOCUMENTATION.md)** - Detailed interface description and usage guide
- **[Test documentation](./test/README.md)** - Test cases and test guide
- **[Deployment Guide](#DeploymentGuide)** - Contract deployment and configuration instructions

### 🎯 Core API Overview

| Contract | Responsibilities | Core Functions |
|------|------|----------|
| **ICoinRealPlatform** | Platform management | Project creation, Campaign management, statistics |
| **IProject** | Project management | Comment system, like mechanism, Campaign association |
| **IProjectFactory** | Project factory | Minimal proxy creation, address prediction |
| **ICampaign** | Reward management | CRT casting, prize pool allocation, reward collection |
| **ICampaignFactory** | Campaign factory | Campaign creation, token management |
| **IPriceOracle** | Price service | USD value calculation, multi-token support |

> 📖 For detailed interface description, parameter definition, and business logic, please refer to **[INTERFACE_DOCUMENTATION.md](./INTERFACE_DOCUMENTATION.md)**

## 🛠️ Quick Start

### Environmental Requirements
- [Foundry](https://getfoundry.sh/) - Solidity development toolchain
- Node.js 18+ - for script execution
- Git - Version Control

### Installation dependencies
```bash
# Clone the project
git clone<repository-url>
cd background

# Install Foundry dependencies
forge install

# Verify installation
forge --version
```

### Compile the contract
```bash
# Compile all contracts
forge build

# Check the contract size
forge build --sizes
```

### Running the tests
```bash
# Run all tests
forge test

# Run Campaign system tests
forge test --match-contract CampaignSystemTest

# Verbose output
forge test -vvv

# Generate coverage report
forge coverage
```

## 🚀 Deployment Guide

### Local deployment
```bash
# Start a local node (new terminal)
anvil

# Deploy to local network
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast

# View the deployment results
cat deployments.json
```

### Testnet deployment
```bash
# Setting environment variables
export PRIVATE_KEY="your_private_key"
export RPC_URL="https://sepolia.infura.io/v3/your_key"

# Deploy to Sepolia
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### Deployment Verification
After successful deployment, a `deployments.json` file will be generated, containing all contract addresses:

```json
{
"platform": "0x...",
"priceOracle": "0x...",
"projectFactory": "0x...",
"campaignFactory": "0x...",
"tokens": {
"usdc": "0x...",
"weth": "0x...",
"dai": "0x..."
},
"projects": {
"bitcoin": "0x...",
"ethereum": "0x...",
"solana": "0x..."
},
"campaigns": {
"btc_campaign_1": "0x...",
"btc_campaign_2": "0x...",
"eth_campaign_1": "0x..."
}
}
```

### Contract ABI generation
Generate the ABI file in the `background/abi-json` folder:
```bash
forge inspect src/CoinRealPlatform.sol:CoinRealPlatform abi --json > abi-json/CoinRealPlatform.json
forge inspect src/Project.sol:Project abi --json > abi-json/Project.json
forge inspect src/ProjectFactory.sol:ProjectFactory abi --json > abi-json/ProjectFactory.json
forge inspect src/Campaign.sol:Campaign abi --json > abi-json/Campaign.json
forge inspect src/CampaignFactory.sol:CampaignFactory abi --json > abi-json/CampaignFactory.json
forge inspect src/mocks/MockPriceOracle.sol:MockPriceOracle abi --json > abi-json/MockPriceOracle.json
forge inspect src/mocks/MockERC20.sol:MockERC20 abi --json > abi-json/MockERC20.json
```

## 📊 Gas cost optimization

### Contract creation cost comparison
| Solution | Gas consumption | Cost savings |
|------|----------|----------|
| Standard Project Deployment | ~2,000,000 | - |
| Clone project deployment | ~50,000 | **95%** |
| Standard Campaign Deployment | ~1,500,000 | - |
| Clone Campaign Deployment | ~40,000 | **97%** |

### Key Operation Costs
| Operation | Estimated Gas | Optimization Measures |
|------|-----------|----------|
| Post a comment | ~120,000 | Multiple campaigns casting CRT in parallel |
| Likes and Comments | ~80,000 | Simple Status Update |
| Create Campaign | ~150,000 | Minimum Agent + Token Transfer |
| Get Rewards | ~50,000/token | Batch Operations |

## 🔒 Safety Mechanism

### Smart Contract Security
- ✅ **Reentrancy Attack Protection** - ReentrancyGuard
- ✅ **Permission control** - Key function permission verification
- ✅ **Overflow checks** - built-in in Solidity 0.8+
- ✅ **Secure transfer** - SafeERC20 library

### Business Logic Security
- ✅ **Anti-duplicate likes** - mapping records
- ✅ **Minimum Sponsorship Limit** - Oracle Value Verification
- ✅ **CRT LOCK** - Soulbound Token
- ✅ **Campaign permissions** - unified management on the platform
- ✅ **Time control** - Strict activity time verification

## 📈 Project Status

Development Progress
- ✅ Core contract development completed
- ✅ Campaign system reconstruction completed
- ✅ Complete interface documentation
- ✅ Adequate test coverage
- ✅ Deployment scripts ready
- ⏳ Elite reward algorithm is under development
- ⏳ Security audit in progress
- ⏳ Mainnet deployment is in preparation

### Technology Stack
- **Solidity** ^0.8.19 - Smart contract language
- **Foundry** - Development and testing framework
- **OpenZeppelin** - secure contract library
- **Chainlink** - Price Oracle (optional)

## 🎯 Campaign system workflow

### 1. Project creation process
1. **Platform creation project** → Project contract deployment
2. **Set project information** → name, description, category, etc.
3. **Project activation** → Start receiving comments and likes

### 2. Campaign creation process
1. **Anyone can create a Campaign** → Select a project and set rewards
2. **Token transfer** → Reward tokens are transferred to the Campaign contract
3. **Campaign Activation** → Start minting CRT rewards
4. **Automatically associate** → Campaign is added to the active list of the Project

### 3. User participation process
1. **Post a comment** → Earn 5 CRT in all active campaigns
2. **Like Interaction** → The liker and the liked person each receive 1 CRT
3. **Multi-Campaign Accumulation** → Get rewards from multiple campaigns at the same time
4. **Wait for distribution** → Distribute the bonus pool rewards at the end of the campaign

### 4. Reward Distribution Process
1. **Campaign ends** → reaches the end time
2. **Platform allocation** → The bonus pool will be allocated according to the 60%-25%-15% rule
3. **User receives** → Call claimRewards to receive the reward
4. **Extension of empty campaign** → Automatically extended for 7 days when there are no participants

## 🤝 Contribution Guidelines

Development Process
1. Fork the project and create a feature branch
2. Write code and add corresponding tests
3. Run the full test suite to ensure it passes
4. Submit a Pull Request and describe the changes

### Coding Standards
- Follow the Solidity style guide
- Added detailed NatSpec annotations
- Ensure test coverage > 90%
- Verified via the Security Check tool

**🎯 Next step: Check out the [detailed interface documentation](./INTERFACE_DOCUMENTATION.md) to learn about the complete Campaign system design and usage! **
