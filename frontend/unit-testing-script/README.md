# CoinReal unit test script

This directory contains unit test scripts written in viem, which are used to view and test the status of various contracts on the CoinReal platform.

## 📋 Feature Overview

### 1. Platform Statistics (`platform-stats.ts`)
- View overall platform statistics
- Displays a list of items and basic information
- View the project rankings

### 2. Project details (`project-details.ts`)
- View project details and statistics
- Display a list of project comments
- View user activity in a project
- View user CRT reward details

### 3. Campaign Status (`campaign-status.ts`)
- View Campaign basic information and status
- Display the reward distribution ratio
- View the rewards of the user in the Campaign

## 🚀 How to use

### Environment Preparation

1. **Create an environment configuration file** (in the frontend root directory)
cp .env.example .env
2. **Edit the `.env` file**
# Private key configuration (for test scripts)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# RPC URL
RPC_URL=http://127.0.0.1:8545
3. **Install dependencies** (in the frontend root directory)
```
```bash
cd frontend
### Run the script

```
#### 1. View platform statistics
pnpm run test:platform
```bash
#### 2. View project details

# View all projects

pnpm run test:project
# View the specified project (using the project key, such as: btc, eth, sol)
```
pnpm run test:project btc

# View user activity
```bash
cd frontend
pnpm install

pnpm run test:project <project address> <user address>
#### 3. Check Campaign Status

# View all Campaigns
pnpm run test:campaign
# View the specified Campaign

```bash
pnpm run test:campaign<Campaign 地址>
```
# View user rewards

pnpm run test:campaign<Campaign 地址> <User Address>
```bash

#### 4. Run all tests
pnpm run test:all
### Run TypeScript files directly

# Run in the frontend root directory
pnpm exec tsx unit-testing-script/platform-stats.ts
pnpm exec tsx unit-testing-script/project-details.ts btc
pnpm exec tsx unit-testing-script/campaign-status.ts

## 📁 Documentation
```
├── package.json # Shared dependency configuration
├── tsconfig.json # Shared TypeScript configuration
```bash
├── .env # Environment variable configuration
└── unit-testing-script/
├── config.ts # Configuration file (network, private key, ABI loading)

├── platform-stats.ts # Platform statistics script

├── project-details.ts # Project details script
├── campaign-status.ts # Campaign status script
├── demo.ts #Demo script
└── README.md # Instructions
```
## 🔧 Configuration instructions
### Network Configuration
```bash
- Defaults to connecting to the local Anvil network (`http://127.0.0.1:8545`)
```
- Use Anvil default account private key for testing
- Customizable configuration via environment variables `PRIVATE_KEY` and `RPC_URL`
```bash

### Contract address

cd frontend
- Automatically read the deployed contract address from `public/deployments.json`
- Support viewing all projects and campaigns in deployment information
### ABI Files

```
- Automatically load contract ABI from `public/abi-json/` directory
- Supports all major contracts: Platform, Project, Campaign, etc.

### Shared Engineering
```
frontend/

- Use shared dependencies and TypeScript configuration of the frontend project
- No need to repeatedly install viem and other dependent packages
- Unified code style and build environment
## 📊 Output example

### Platform statistics output

🔧 Test configuration:
📍 Network: Anvil
🔗 RPC: http://127.0.0.1:8545
👤 Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
📊 === Platform Statistics ===
```

🏗️ Total items: 9
👥 Total users: 0
💬 Total comments: 0
💰 Total prize pool value: $0
📋 Project list (first 10):

1. Bitcoin (BTC)
Address: 0xd8058efe0198ae9dd7d563e1b4938dcbc86a1f81
Category: Layer1
Description: The first decentralized digital currency...
### Project details output
📝 === Project Details and Comments ===

🎯 Project: Bitcoin (BTC)
📍 Address: 0xd8058efe0198ae9dd7d563e1b4938dcbc86a1f81
👥 Number of participants: 0

👍 Total likes: 0
⏰ Last activity time: 1970-1-1 08:00:00
💰 Current prize pool USD: $0
🎪 Number of associated campaigns: 0
💬 Comment list (first 10):
no comments
## ⚠️ Notes

1. **Network connection**: Make sure the Anvil local network is running
2. **Contract deployment**: Make sure the contract is deployed correctly and the `deployments.json` file exists
3. **Private key security**: Do not use test private keys in production environments

```

4. **Error handling**: The script contains error handling and will display specific error messages
1. **Connection failed**
- Check if Anvil is running
- Confirm that the RPC URL is configured correctly

2. **Contract call failed**

- Check if the contract is deployed correctly

- Confirm whether the ABI file exists
3. **TypeScript Error**
- Make sure all dependencies are installed

- Check tsconfig.json configuration
### Debug Mode
Add more logging output to the script:

console.log('Debug information:', { address, abi, functionName, args })
```

```
## 🔍 Troubleshooting
### Frequently Asked Questions
```TypeScript