# Chainlink Automation Contract System

## Project Overview

This project contains two core Chainlink automation smart contracts:

- **AutoTag** - Automated comment sentiment analysis contract based on Chainlink Functions
- **AutoVRF** - Automated random number generation and lottery contract based on Chainlink VRF

Both contracts integrate Chainlink Automation services to achieve fully automated workflows without manual intervention for complex on-chain operations.

## Contract Architecture

### AutoTag Contract Architecture

The AutoTag contract implements a complete automated comment sentiment analysis workflow:

1. **Request Phase**: Receives comment content and calls Chainlink Functions for AI sentiment analysis
2. **Analysis Phase**: Uses Google Gemini API to analyze comment sentiment (positive/negative/neutral)
3. **Callback Phase**: Receives AI analysis results and stores them in a pending queue
4. **Automation Phase**: Chainlink Automation automatically detects and processes completed analysis requests
5. **Update Phase**: Automatically calls project contract to update comment flags

**Core Components**:

- `FunctionsClient` - Handles Chainlink Functions requests
- `AutomationCompatibleInterface` - Implements automation detection and execution
- `RequestInfo` struct - Manages request state and data
- AI source code - Embedded JavaScript code calling Google Gemini API

### AutoVRF Contract Architecture

The AutoVRF contract implements an efficient random number generation and automatic distribution system:

1. **Request Phase**: Receives random number requirements (range and quantity)
2. **VRF Phase**: Calls Chainlink VRF to obtain true random seed
3. **Generation Phase**: Generates multiple non-duplicate random numbers based on VRF seed
4. **Automation Phase**: Chainlink Automation detects and processes completed VRF requests
5. **Distribution Phase**: Automatically calls campaign contract to distribute lottery results

**Core Components**:

- `VRFConsumerBaseV2Plus` - Handles Chainlink VRF requests
- `AutomationCompatibleInterface` - Implements automation detection and execution
- `VRFRequest` struct - Manages VRF request state
- Random number generation algorithm - Generates multiple non-duplicate random numbers based on single VRF seed

## Usage Instructions

### AutoTag Usage Steps

1. **Deploy AutoTag Contract**

```solidity
// subscriptionId can be set to 0 initially during deployment
AutoTag autoTag = new AutoTag(0);
```

2. **Register Chainlink Services**

- Register Functions service at [Chainlink Functions](https://functions.chain.link/fuji)
- Register Automation service at [Chainlink Automation](https://automation.chain.link/fuji)

3. **Configure Contract**

```solidity
// Update Functions subscription ID
autoTag.updateSubscriptionId(YOUR_SUBSCRIPTION_ID);

// Set project contract address
autoTag.updateProjectContract(YOUR_PROJECT_CONTRACT_ADDRESS);
```

4. **Integration in Project Contract**

```solidity
interface AutoTagInterface {
    function getCommentFlag(uint commentId, string calldata comment) external returns (bytes32 requestId);
    function tagToFlag(string memory tag) external pure returns (uint);
}

contract YourProject {
    AutoTagInterface autoTag = AutoTagInterface(0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9);

    function analyzeComment(uint commentId, string memory comment) public {
        autoTag.getCommentFlag(commentId, comment);
    }

    // Must implement this function to receive automated results
    function updateCommentFlag(uint commentId, uint flag) public {
        // flag: 1=positive, 2=negative, 3=neutral, 0=unknown
        // Process analysis results
    }
}
```

### AutoVRF Usage Steps

1. **Deploy AutoVRF Contract**

```solidity
// subscriptionId can be set to 0 initially during deployment
AutoVRF autoVRF = new AutoVRF(0);
```

2. **Register Chainlink Services**

- Register VRF service at [Chainlink VRF](https://vrf.chain.link/fuji)
- Register Automation service at [Chainlink Automation](https://automation.chain.link/fuji)

3. **Configure Contract**

```solidity
// Update VRF subscription ID
autoVRF.setSubscriptionId(YOUR_SUBSCRIPTION_ID);

// Set campaign contract address
autoVRF.setCampaignAddr(YOUR_CAMPAIGN_CONTRACT_ADDRESS);
```

4. **Integration in Campaign Contract**

```solidity
interface AutoVRFInterface {
    function getVRF(uint256 range, uint256 n) external returns (uint256 requestId);
    function getCampaignLuckers(uint256 likeIndex, uint256 luckyLikeCount) external returns (uint256 requestId);
}

contract YourCampaign {
    AutoVRFInterface autoVRF = AutoVRFInterface(0x7593F3782435ceab38e9cBA065AB6233244EDD9C);

    function startLottery(uint256 totalParticipants, uint256 winnerCount) public {
        autoVRF.getVRF(totalParticipants, winnerCount);
    }

    // Must implement this function to receive automated results
    function rewardsLikeCRT(uint256[] calldata luckyNumbers) external {
        // Process winning numbers
    }
}
```

## Deployment Instructions

### Network Configuration

- **Testnet**: Avalanche Fuji
- **Mainnet**: Avalanche Mainnet

### Deployed Contract Addresses (Fuji Testnet)

- **AutoTag Contract**: `0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9`
- **AutoVRF Contract**: `0x7593F3782435ceab38e9cBA065AB6233244EDD9C`
- **Test Project Contract**: `0x42D555CAC4bA948A73D25DD54EbD8c4477accbd8`
- **Test Campaign Contract**: `0x6AAEA242531A0a233BD9c9473DebB39b49417841`

### Deployment Requirements

Due to Chainlink subscription service requirements, it's recommended to use Remix IDE for deployment:

1. **Deploy with Remix**

   - Copy contract code to Remix
   - Connect to Avalanche Fuji testnet
   - Deploy contract and obtain address

2. **Subscription Service Configuration**

   - Functions subscription requires LINK tokens
   - VRF subscription requires LINK tokens
   - Automation registration requires LINK tokens

3. **Gas Configuration**
   - AutoTag: Recommended gas limit 300,000
   - AutoVRF: Recommended callback gas limit 500,000

## Technical Implementation

### Chainlink Functions Integration

AutoTag contract uses embedded JavaScript code to call Google Gemini API:

```javascript
// AI analysis source code snippet
const promptText = args[0];
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=API_KEY`;
// Send request and return sentiment analysis result: POS/NEG/NEU
```

### Chainlink VRF Integration

AutoVRF contract optimizes random number generation strategy:

- **Single VRF Request**: Only requests 1 true random seed to reduce costs
- **Multiple Number Generation Algorithm**: Uses keccak256 to generate multiple random numbers based on VRF seed
- **Deduplication Mechanism**: Ensures generated random numbers are non-duplicate

### Chainlink Automation Integration

Both contracts implement automated detection and execution:

```solidity
function checkUpkeep(bytes calldata) external view override
    returns (bool upkeepNeeded, bytes memory performData) {
    // Check if there are pending requests to process
}

function performUpkeep(bytes calldata performData) external override {
    // Automatically execute processing logic
}
```

## File Structure

```
chainlink_auto/
├── antoTag.sol          # AutoTag main contract - Comment sentiment analysis automation
├── autoVRF.sol          # AutoVRF main contract - Random number generation automation
├── counterAuto.sol      # Counter example contract - Basic Automation example
├── README.md           # English documentation (this document)
└── README_zh.md        # Chinese documentation
```

### File Descriptions

- **antoTag.sol**: Complete comment sentiment analysis automation contract, including test project contract
- **autoVRF.sol**: Complete random number generation automation contract, including test campaign contract
- **counterAuto.sol**: Simple counter automation example for learning basic Automation concepts
- **README.md**: English version documentation
- **README_zh.md**: Chinese version documentation

## Tag Descriptions

### AutoTag Sentiment Flags

- **POS**: Positive/bullish sentiment → Flag value 1
- **NEG**: Negative/bearish sentiment → Flag value 2
- **NEU**: Neutral sentiment → Flag value 3
- **Unknown/Error** → Flag value 0

### Workflow Timing

- **AutoTag**: Results automatically updated approximately 1-2 minutes after analysis completion
- **AutoVRF**: Results automatically distributed approximately 1-2 minutes after VRF completion

## Important Notes

1. **Subscription Management**: Ensure sufficient LINK token balance
2. **Gas Optimization**: Adjust gas limits according to network conditions
3. **Error Handling**: Contracts include comprehensive error handling and retry mechanisms
4. **Security**: All external calls have appropriate validation and protection
5. **Scalability**: Supports batch processing and manual intervention functions
