# CoinReal platform interface documentation

## Overview

CoinReal is an innovative decentralized content community platform that uses blockchain technology and Campaign reward mechanism to achieve the business model of "comments equal income, likes equal coins". This document describes in detail the design and implementation of all smart contract interfaces of the platform.

## Core design concept

### Campaign Reward Mechanism
- **Project-Campaign separation**: The project focuses on the comment and like system, while the campaign manages the reward distribution
- **Independent CRT Token**: Each Campaign issues independent CRT tokens ("Project Name-Campaign Number")
- **Comment Reward**: Post a comment to get 5 CRTs in all active campaigns
- **Like Reward**: Get 1 CRT for liking, and the person being liked gets 1 CRT
- **Reward pool distribution**: 60% comment reward + 25% like reward + 15% elite reward (under development)
- **Soulbound Features**: CRT tokens are not transferable and represent real contribution

### Technical Architecture
- **Minimum Agency Mode**: Save 95% of project and campaign creation costs
- **Modular design**: separation of responsibilities, easy to upgrade and maintain
- **Price Oracle**: Supports USD value calculation of multiple tokens
- **Batch Operation**: Optimize Gas consumption and user experience
- **Time control**: Campaign has a clear activity time window

---

## 1. ICoinRealPlatform - Platform main contract interface

### Scope of Responsibilities
The platform's main contract is responsible for core businesses such as overall project management, campaign management, user statistics, and ranking functions.

### Core Features

#### 1.1 Project creation
```Solidity
function createProject(
string calldata name, // Project name (1-100 characters)
string calldata symbol, // bullet symbol (1-20 characters)
string calldata description, // Project description (maximum 1000 characters)
string calldata category, // Project category (Layer1/DeFi/NFT, etc.)
uint16 drawPeriod // compatibility parameter (reserved)
) external returns (address projectAddress);
```

**Business Process:**
1. Verify the caller's permissions (owner only)
2. Create a project proxy contract through ProjectFactory
3. Register projects on the platform and store them by category
4. Trigger the ProjectCreated event

#### 1.2 Campaign Management
```Solidity
function addCampaignToProject(
address project,
address campaign
) external;
```

**Business Process:**
1. Verify the validity of the Campaign contract
2. Add the Campaign to the Project's active list
3. Update platform statistics

#### 1.3 Project Query
```Solidity
// Get the list of items by page
function getProjects(uint256 offset, uint256 limit) external view returns (
ProjectInfo[] memory projects,
uint256 total
);

// Get items by category
function getProjectsByCategory(string calldata category) external view returns (address[] memory);

// Get the projects the user participated in
function getUserProjects(address user) external view returns (address[] memory);
```

#### 1.4 Statistics and Rankings
```Solidity
// Platform statistics
function getPlatformStats() external view returns (
uint256 totalProjects, // total number of projects
uint256 totalUsers, //Total number of users
uint256 totalComments, //Total number of comments
uint256 totalCampaigns // Total number of Campaigns
);

// Project Ranking
function getProjectLeaderboard(
uint8 sortBy, // Sorting method: 0-number of participants, 1-number of comments, 2-number of campaigns, 3-latest activities
uint256 offset, // starting position
uint256 limit // Return quantity
) external view returns (
address[] memory projects,
uint256[] memory stats
);
```

---

## 2. IProject - Project Contract Interface

### Scope of Responsibilities
Manage the comment and like system for a single project, and coordinate reward distribution with multiple campaigns.

### Core Features

#### 2.1 Comment System
```Solidity
function postComment(string calldata content) external returns (uint256 commentId);
```

**Business Rules:**
- Content length limit: 1-1000 characters
- Notify all active campaigns to mint 5 CRT rewards
- Comment IDs are automatically incremented to ensure chronological order
- Update user statistics

#### 2.2 Like System
```Solidity
function likeComment(uint256 commentId) external;
```

**Business Rules:**
- Each user can only like the same comment once
- Notify all active campaigns to mint 1 CRT reward for each liker and like recipient
- Update comment like count

#### 2.3 Campaign Management
```Solidity
// Add Campaign to the project
function addCampaign(address campaign) external; // Only available on the platform

// Get all Campaigns of the project
function getCampaigns() external view returns (address[] memory);

// Get the total number of CRTs for the user in all Campaigns
function getUserTotalCRT(address user) external view returns (uint256 totalCRT);

// Get the user's detailed CRT information in all Campaigns
function getUserCampaignCRTDetails(address user) external view returns (
address[] memory campaignAddresses,
uint256[] memory commentCRTs,
uint256[] memory likeCRTs,
uint256[] memory totalCRTs,
uint256[] memory pendingRewards
);
```

#### 2.4 Data Query
```Solidity
// Get comment details
function getComment(uint256 commentId) external view returns (Comment memory);

// Get the comment list by page
function getComments(uint256 offset, uint256 limit) external view returns (
Comment[] memory comments,
uint256 total
);

// Get project statistics
function getProjectStats() external view returns (
uint256 totalParticipants,
uint256 totalLikes,
uint256 lastActivityTime,
uint256 currentPoolUSD // Reserved for compatibility, returns 0
);

// Get user activity
function getUserActivity(address user, uint256 offset, uint256 limit) external view returns (
uint256[] memory commentIds,
uint256[] memory likedCommentIds
);
```

Data Structure

#### Comment structure
```Solidity
struct Comment {
uint256 id; //Comment unique ID (auto-increment)
address author; // Comment author address
string content; // Comment content
uint256 likes; // Number of likes
uint256 crtReward; // Reserved for compatibility (not used)
bool isElite; // Elite status is determined by Campaign
uint32 timestamp; // Release timestamp
}
```

---

## 3. ICampaign - Campaign contract interface

### Scope of Responsibilities
Manages CRT token minting, prize pool management, and reward distribution for a single Campaign. Each Campaign is an independent ERC20 token contract.

### Core Features

#### 3.1 Campaign Information
```Solidity
// Basic information
function projectAddress() external view returns (address);
function sponsor() external view returns (address);
function sponsorName() external view returns (string memory);
function startTime() external view returns (uint256);
function endTime() external view returns (uint256);
function rewardToken() external view returns (address);
function totalRewardPool() external view returns (uint256);

// Status query
function isCurrentlyActive() external view returns (bool);
function rewardsDistributed() external view returns (bool);
```

#### 3.2 CRT token function (inherited from ERC20)
```Solidity
// ERC20 basic functions
function name() external view returns (string memory); // "Project Name-Campaign Number"
function symbol() external view returns (string memory); // "CRT"
function balanceOf(address account) external view returns (uint256);
function totalSupply() external view returns (uint256);

// Soulbound feature - The following function will revert
function transfer(address to, uint256 amount) external returns (bool);
function transferFrom(address from, address to, uint256 amount) external returns (bool);
function approve(address spender, uint256 amount) external returns (bool);
```

#### 3.3 Project callback function
```Solidity
// Called by the Project contract when a user leaves a comment
function onCommentPosted(address user, uint256 commentId) external; // Casting 5 CRT

// Called by the Project contract when a user likes a comment
function onCommentLiked(address liker, address author, uint256 commentId) external; // cast 1 CRT each
```

#### 3.4 Reward Distribution
```Solidity
// Allocate rewards - only available on the platform
function distributeRewards() external;

// User receives reward
function claimRewards() external;

// Extend the Campaign time - only available on the platform
function extendEndTime(uint256 additionalDays) external;
```

**Allocation rules:**
- **60%**: distributed to all participants according to their CRT ratio
- **25%**: The proportion of CRT obtained by likes is distributed to the liker
- **15%**: Elite Reward (under development)

**Automatic extension mechanism:**
- If there are no participants at the end of the campaign, it will be automatically extended for 7 days
- Avoid wasting reward resources

#### 3.5 Data Query
```Solidity
// Get the user's CRT details
function getUserCRTBreakdown(address user) external view returns (
uint256 commentTokens, // CRT obtained from comments
uint256 likeTokens, // CRT obtained by like
uint256 totalTokens, //Total number of CRTs
uint256 pendingReward // Reward to be received
);

// Get Campaign statistics
function getCampaignStats() external view returns (
uint256 totalParticipants,
uint256 totalComments,
uint256 totalLikes,
uint256 totalCRT,
uint256 remainingTime
);
```

---

## 4. ICampaignFactory - Campaign factory interface

### Scope of Responsibilities
Create a Campaign contract using the minimal proxy pattern to manage token transfers and Campaign registrations.

### Core Features

#### 4.1 Campaign Creation
```Solidity
function createCampaign(
address project, // target project address
string calldata sponsorName, // sponsor name
uint256 duration, // duration (days)
address rewardToken, // Reward token address
uint256 rewardAmount // Number of reward tokens
) external returns (address campaignAddress);
```

**Business Process:**
1. Verify parameter validity
2. Transfer reward tokens from the caller to the Factory
3. Create a Campaign contract using the minimal proxy model
4. Transfer tokens to the Campaign contract
5. Add the Campaign to the Project via the platform
6. Trigger the CampaignCreated event

#### 4.2 Campaign Verification
```Solidity
function isValidCampaign(address campaignAddress) external view returns (bool);
```

**Verification content:**
- Check if the contract exists
- Verify that the bytecode matches the minimal proxy mode
- Verify that the contract address is correct

Gas cost comparison

| Deployment method | Gas consumption | Cost savings |
|---------|---------|----------|
| Standard Campaign Deployment | ~1,500,000 | - |
| Clone mode deployment | ~40,000 | 97% |

---

## 5. IProjectFactory - Project factory interface

### Scope of Responsibilities
Use the minimal proxy mode (EIP-1167) to create project contracts and save deployment costs.

### Core Features

#### 5.1 Project Creation
```Solidity
function createProject(
string calldata name,
string calldata symbol,
string calldata description,
string calldata category,
uint16 drawPeriod,
address creator,
address priceOracle,
Address platform
) external returns (address projectAddress);
```

**Technical implementation:**
- Deploy using standard Clone mode
- Minimum proxy mode saves 95% of gas costs
- Automatically call the initialize function to initialize

#### 5.2 Contract Verification
```Solidity
function isValidProject(address projectAddress) external view returns (bool isValid);
```

---

## 6. IPriceOracle - Price Oracle Interface

### Scope of Responsibilities
Provides token USD value query service and supports batch query of multiple tokens.

### Core Features

#### 6.1 Value Calculation
```Solidity
function getUSDValue(address token, uint256 amount) external view returns (uint256 usdValue);
```

**Calculation formula:**
```
USD Value = (token_amount * token_price) / (10^token_decimals)
```

#### 6.2 Batch Query
```Solidity
function getBatchUSDValue(
address[] calldata tokens,
uint256[] calldata amounts
) external view returns (uint256 totalUSDValue);
```

### Price accuracy standard

All prices are in 8 decimal places (similar to Chainlink standard):
- $1.00 = 100,000,000 (1 * 10^8)
- $2000.50 = 200,050,000,000 (2000.5 * 10^8)

---

## 7. Complete user interaction process

### 7.1 Campaign creation process
1. **Select Project** → Browse the list of existing projects
2. **Set up your campaign** → Select reward tokens, amount, duration
3. **Approve Token** → Authorize CampaignFactory to transfer tokens
4. **Create Campaign** → Call createCampaign function
5. **Campaign Activation** → Automatically start receiving user activities and minting CRT

### 7.2 User Participation Process
1. **Connect to wallet** → Check asset status
2. **Select a project** → Browse the project list and view active campaigns
3. **Post a comment** → Get 5 CRT rewards in all active campaigns
4. **Like Interaction** → Like other people’s comments and both parties will get rewards
5. **View Revenue** → View the CRT balance in each Campaign in real time

### 7.3 Reward Collection Process
1. **Campaign ends** → reaches the set end time
2. **Platform Allocation** → The platform calculates and distributes the prize pool rewards according to the rules
3. **View pending rewards** → Users can view pending rewards in each Campaign
4. **Get rewards** → Call claimRewards to get specific token rewards

---

## 8. Security Mechanism

### 8.1 Smart Contract Security
- **Reentrancy attack protection**: Use ReentrancyGuard
- **Permission control**: Key functions can only be called by the platform
- **Numerical overflow check**: Built-in check in Solidity 0.8+
- **Secure Token Transfer**: Using SafeERC20

### 8.2 Campaign Security
- **Time control**: Strict activity time window verification
- **Token Lock**: CRT tokens are not transferable (Soulbound)
- **Separation of permissions**: Campaign management permissions belong to the platform
- **Anti-duplicate rewards**: Ensure that rewards are not received repeatedly for the same activity

### 8.3 Economic Model Security
- **Minimum Sponsorship Limit**: Verify USD value through Oracle
- **Transparent reward distribution**: Fixed 60%-25%-15% distribution ratio
- **Automatic extension mechanism**: Avoid wasting resources on invalid campaigns

---

## 9. Gas Optimization Strategy

### 9.1 Contract-level optimization
- **Minimum Proxy Mode**: Save 95%+ of deployment costs
- **Batch operation**: support batch query and batch collection
- **Event storage**: Comment content is stored through events
- **Compact data structure**: Arrange the order of struct fields reasonably

### 9.2 Front-end optimization suggestions
- **Batch RPC calls**: Use multicall to merge queries
- **Campaign data cache**: cache basic Campaign information
- **Paged loading**: Avoid loading large amounts of data at once
- **Smart preloading**: optimize data acquisition based on user behavior

---

## 10. Scalability design

### 10.1 Modular Architecture
- **Separation of responsibilities**: Project focuses on content, Campaign focuses on rewards
- **Interface abstraction**: core functions are abstracted into interfaces
- **Proxy mode**: supports logical upgrades
- **Event-driven**: Complete event system

### 10.2 Future expansion direction
- **Elite Reward Algorithm**: Content quality assessment based on machine learning
- **Cross-chain Campaign**: Multi-chain deployment and cross-chain assets
- **NFT Rewards**: Introducing NFT Rewards Mechanism
- **DAO Governance**: Community Governance Campaign Parameters

---

## 11. Development Guide

### 11.1 Local Development Environment
```bash
# Install dependencies
forge install

# Compile the contract
forge build

# Run the tests
forge test --match-contract CampaignSystemTest

# Deploy to local network
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast
```

### 11.2 Test Coverage
```bash
# Generate test coverage report
forge coverage

# View detailed report
forge coverage --report lcov
```

---

## 12. Conclusion

Through the innovative Campaign system architecture, the CoinReal platform achieves:

✅ **Flexible reward mechanism** - Anyone can create a campaign and customize rewards
✅ **Multiple Campaigns in Parallel** - Users can receive rewards in multiple Campaigns at the same time
✅ **Efficient Gas Optimization** - Minimum Proxy Mode saves 97% of costs
✅ **Powerful security mechanism** - Multi-level security protection and permission control
✅ **Excellent scalability** - Modular design facilitates functional expansion
✅ **Smooth user experience** - batch operations and smart query optimization

The Campaign system provides a more flexible and sustainable technical foundation for the Web3 content community, truly realizing the vision of "comments equal income, likes equal coins", and leaving ample room for future functional expansion.