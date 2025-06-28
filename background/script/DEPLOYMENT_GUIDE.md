# CoinReal Multi-step Deployment Guide

SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

## 📋 Overview

AVALANCHE_FUJI_URL=https://api.avax-test.network/ext/bc/C/rpc

This guide describes how to deploy the CoinReal platform on different networks using the multi-step deployment system. The multi-step deployment system splits the original one-time deployment into 5 independent steps, solving problems such as gas limits, contract size limits, and transaction fees.
AVALANCHE_FUJI_PRIVATE_KEY=YOUR_PRIVATE_KEY
## 🎯 Supported Networks

- **anvil** - Local test network

- **sepolia** - Ethereum Testnet

- **avalanche_fuji** - Avalanche Fuji Testnet

## 🔧 Environment Preparation
### 1. Environment variable configuration
Configure the following environment variables in the `background/.env` file:
```bash

# Anvil Local Network
anvil_url=http://localhost:8545
anvil_private_key=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Sepolia Testnet
sepolia_private_key=YOUR_PRIVATE_KEY
# Avalanche Fuji Testnet

# Optional Configuration
NETWORK=anvil #Default network
SKIP_DATA_INIT=false # Whether to skip test data initialization
```

### 2. Tool Installation

Make sure Foundry is installed:

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
```

## 🚀 Deployment steps

### Step 1: Deploy the core contract

Deploy the core smart contract of the platform:

```bash
# Set network environment variables
export NETWORK=anvil # or sepolia, avalanche_fuji

# Get configuration from .env file
source .env
RPC_URL=${anvil_url} # or ${sepolia_url}, ${avalanche_fuji_url}
PRIVATE_KEY=${anvil_private_key} # or ${sepolia_private_key}, ${avalanche_fuji_private_key}

# Deploy core contracts
forge script script/multi_deploy/Step1_DeployCore.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast

# Verify deployment
ls deployments-$NETWORK.json
```

**Deployment content:**
- MockPriceOracle (price oracle)
- CoinRealPlatform (Platform Main Contract)
- Project implementation contract
- ProjectFactory
- Campaign implementation contract
- CampaignFactory

### Step 2: Deploy the test token

Deploy a test ERC20 token and set the price:

```bash
forge script script/multi_deploy/Step2_DeployTokens.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

**Deployment content:**
- USDC (10M supply, $1.00)
- WETH (100K supply, $2500.00)
- DAI (10M supply, $1.00)
- USDT (10M supply, $1.00)
- BNB (1M supply, $300.00)

### Step 3: Create a sample project

Create 9 sample projects:

```bash
forge script script/multi_deploy/Step3_CreateProjects.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

**Create a project:**
- Bitcoin (BTC) - Layer1
- Ethereum (ETH) - Layer1
- Solana (SOL) - Layer1
- Polygon (MATIC) - Layer2
- Arbitrum (ARB) - Layer2
- Uniswap (UNI) - DeFi
- Aave (AAVE) - DeFi
- OpenSea (OS) - NFT
- Axie Infinity (AXS) - GameFi

### Step 4: Create a sample campaign

Create a Campaign reward pool for your project:

```bash
forge script script/multi_deploy/Step4_CreateCampaigns.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

**Create a Campaign:**
- 9 USDC Campaigns (1000 USDC each, 30 days)
- 2 WETH Campaigns (1 WETH each, 60 days)

### Step 5: Initialize test data (optional)

Assign tokens to test users and simulate user interactions:

```bash
# Test environment (including test data)
forge script script/multi_deploy/Step5_InitializeData.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast

# Production environment (skipping test data)
export SKIP_DATA_INIT=true
forge script script/multi_deploy/Step5_InitializeData.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

**Initialization content:**
- Allocate test tokens to 4 sample users
- Simulate user comments and likes interactions
- Update configuration files

## 📁 Configuration Files

The deployment information of each network is saved in the `deployments-{network}.json` file:

```json
{
  "network": "anvil",
  "timestamp": "1750771331",
  "platform": "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  "priceOracle": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  "projectFactory": "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
  "campaignFactory": "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707",
  "tokens": {
  "usdc": "0x8a791620dd6260079bf849dc5567adc3f2fdc318",
  "weth": "0x610178da211fef7d417bc0e6fed39f05609ad788"
  },
  "projects": {
  "btc": {
  "name": "Bitcoin",
  "symbol": "BTC",
  "address": "0xd8058efe0198ae9dd7d563e1b4938dcbc86a1f81"
  }
  },
  "sampleUsers": {
  "alice": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "bob": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
  }
}
```

## 🔍 Verify deployment

### Check contract status

```bash
# Check platform statistics
forge script script/multi_deploy/utils/VerifyDeployment.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY"

# or manually verify
cast call $PLATFORM_ADDRESS "getPlatformStats()" --rpc-url "$RPC_URL"
```

### Test contract interaction

```bash
# Get the project list
cast call $PLATFORM_ADDRESS "getProjects(uint256,uint256)" 0 10 --rpc-url "$RPC_URL"

# Check token balance
cast call $USDC_ADDRESS "balanceOf(address)" $ALICE_ADDRESS --rpc-url "$RPC_URL"
```

## 🚨 Troubleshooting

### Frequently Asked Questions

#### 1. Environment variables are not set
```
Error: Missing environment variable: SEPOLIA_URL
```
**Solution:** Check the environment variable configuration in the `.env` file

#### 2. The private key format is incorrect
```
Error: Invalid private key format
```
**Solution:** Make sure the private key starts with `0x` and is 64 hexadecimal characters.

#### 3. RPC connection failed
```
Error: Failed to connect to RPC
```
**Solution:** Check the network connection and whether the RPC URL is correct

#### 4. Insufficient Gas
```
Error: Transaction failed due to insufficient gas
```
**Solution:** Make sure the deployment account has enough ETH to pay for the Gas fee

#### 5. The contract has been deployed
```
Core contracts already deployed!
```
**Solution:** Delete the corresponding configuration file or modify the configuration and redeploy

### Redeploy

To redeploy a step:

```bash
# Delete the configuration file
rm deployments-$NETWORK.json

# or delete specific sections (manually edit the JSON file)
# Delete the "tokens" section and redeploy tokens
# Delete the "projects" section and recreate the project
```

## 📊 Gas Cost Estimation

| Steps | Number of Operations | Estimated Gas | Sepolia Cost* |
|------|----------|----------|---------------|
| Step 1 | 6 contracts + configuration | ~8,000,000 | ~$20-40 |
| Step2 | 5 tokens + price setting | ~2,000,000 | ~$5-10 |
| Step3 | 9 projects created | ~1,500,000 | ~$4-8 |
| Step 4 | 11 Campaigns Created | ~2,500,000 | ~$6-12 |
| Step5 | User Funds + Interaction | ~1,000,000 | ~$3-6 |
| **Total** | - | **~15,000,000** | **~$38-76** |

*Estimated based on 20 Gwei Gas price and ETH = $2000

## 🔧 Advanced Configuration

### Custom Network

Add new network support:

1. Add network configuration in `BaseMultiDeploy.sol`:
```Solidity
rpcUrlKeys["your_network"] = "YOUR_NETWORK_URL";
privateKeyKeys["your_network"] = "YOUR_NETWORK_PRIVATE_KEY";
```

2. Add chain ID configuration:
```Solidity
} else if (keccak256(bytes(networkName)) == keccak256(bytes("your_network"))) {
currentNetwork.chainId = YOUR_CHAIN_ID;
currentNetwork.isTestnet = true; // or false
}
```

### Batch deployment script

Create an automated deployment script:

```bash
#!/bin/bash
# deploy_all.sh

NETWORK=${1:-anvil}
echo "Deploying to network: $NETWORK"

export NETWORK=$NETWORK

# Execute all steps
forge script script/multi_deploy/Step1_DeployCore.s.sol --network $NETWORK --broadcast
forge script script/multi_deploy/Step2_DeployTokens.s.sol --network $NETWORK --broadcast
forge script script/multi_deploy/Step3_CreateProjects.s.sol --network $NETWORK --broadcast
forge script script/multi_deploy/Step4_CreateCampaigns.s.sol --network $NETWORK --broadcast

# Skip test data in production environment
if [ "$NETWORK" != "anvil" ]; then
export SKIP_DATA_INIT=true
fi
forge script script/multi_deploy/Step5_InitializeData.s.sol --network $NETWORK --broadcast

echo "Deployment completed! Check deployments-$NETWORK.json"
```

Directions:
```bash
chmod +x deploy_all.sh
./deploy_all.sh sepolia
```

## 📚 Related Documents

- [Original deployment script](../Deploy.s.sol) - Single-step deployment reference
- [Interface Documentation](../../INTERFACE_DOCUMENTATION.md) - Detailed contract interface description
- [Test Guide](../../test/README.md) - Contract test instructions

## 🤝 Support

If you have problems:

1. Check the environment variable configuration
2. Verify network connectivity
3. Check whether the gas fee is sufficient
4. Check if the contract address is correct
5. View Foundry log output

---

**⚠️ Notes:**
- Ensure sufficient test tokens before testnet deployment
- It is recommended to set `SKIP_DATA_INIT=true` when deploying in production environment
- Save the configuration file, including all contract addresses
- Private key security: Do not use the sample private key in a production environment