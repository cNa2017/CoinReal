# CoinReal multi-step deployment system

ANVIL_URL=http://localhost:8545

## 📋 Overview

## 🚀 Quick Start
SEPOLIA_PRIVATE_KEY=YOUR_PRIVATE_KEY
### 1. Environment Configuration
```bash
# Configure environment variables in the .env file
anvil_url=http://localhost:8545
anvil_private_key=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
sepolia_url=https://sepolia.infura.io/v3/YOUR_KEY
sepolia_private_key=YOUR_PRIVATE_KEY
avalanche_fuji_url=https://avax-fuji.g.alchemy.com/v2/YOUR_KEY
avalanche_fuji_private_key=YOUR_PRIVATE_KEY
```

### 2. One-click deployment

```bash
# Local test network
./deploy_all.sh anvil

# Sepolia Testnet
./deploy_all.sh sepolia

# Avalanche Fuji Testnet
./deploy_all.sh avalanche_fuji
```

### 3. Verify the deployment

```bash
export NETWORK=anvil
source .env
RPC_URL=${anvil_url}
PRIVATE_KEY=${anvil_private_key}
forge script script/multi_deploy/utils/VerifyDeployment.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY"
```

## 📁 File structure

```
script/multi_deploy/
├── README.md # This file
├── Step1_DeployCore.s.sol # Step 1: Deploy the core contract
├── Step2_DeployTokens.s.sol # Step 2: Deploy test tokens
├── Step3_CreateProjects.s.sol # Step 3: Create a sample project
├── Step4_CreateCampaigns.s.sol # Step 4: Create Campaign
├── Step5_InitializeData.s.sol # Step 5: Initialize test data
├── config/
│ └── projects-data.json # Project data configuration
└── utils/
├── BaseMultiDeploy.sol # Basic deployment contract
└── VerifyDeployment.s.sol # Deployment verification script
```

## 🔧 Deployment steps

| Steps | Script | Function | Gas Estimation |
|------|------|------|----------|
| 1 | Step1_DeployCore | Deploy 6 core contracts | ~8M |
| 2 | Step2_DeployTokens | Deploy 5 test tokens | ~2M |
| 3 | Step3_CreateProjects | Create 9 sample projects | ~1.5M |
| 4 | Step4_CreateCampaigns | Create 11 Campaigns | ~2.5M |
| 5 | Step5_InitializeData | Initialize test data (optional) | ~1M |

## 🌐 Support Network

- **anvil**: local test network
- **sepolia**: Ethereum testnet
- **avalanche_fuji**: Avalanche Fuji testnet

## 📄 Configuration files

The deployment information of each network is saved in `deployments-{network}.json`:

```json
{
"network": "anvil",
"timestamp": "1750771331",
"platform": "0x...",
"tokens": { "usdc": "0x...", "weth": "0x..." },
"projects": { "btc": { "address": "0x..." } }
}
```

## 🛠️ Manual deployment

To perform a step individually:

```bash
export NETWORK=sepolia
source .env
RPC_URL=${sepolia_url}
PRIVATE_KEY=${sepolia_private_key}

# Step 1: Deploy the core contract
forge script script/multi_deploy/Step1_DeployCore.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast

# Step 2: Deploy the token
forge script script/multi_deploy/Step2_DeployTokens.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast

# Other steps...
```

## 🔍 Troubleshooting

### Frequently Asked Questions

1. **Environment variables not set**: Check the `.env` file
2. **Gas Insufficient**: Make sure your account has enough ETH
3. **Contract has been deployed**: Delete the configuration file and redeploy
4. **Network connection failed**: Check the RPC URL

### Redeploy

```bash
# Delete the configuration file
rm deployments-$NETWORK.json

# or remove specific parts (manually edit the JSON)
```

## 📚 Detailed documentation

- [Full Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Original deployment script](../Deploy.s.sol)
- [Interface Documentation](../../INTERFACE_DOCUMENTATION.md)

## 🎯 Features

- ✅ Support multi-network deployment
- ✅ Automated configuration management
- ✅ Gas cost optimization
- ✅ Error handling and validation
- ✅ Production environment adaptation
- ✅ One-click deployment script