# CoinReal Frontend term mapping document

## Overview
This document describes the term mapping relationship between the CoinReal Frontend and Backend Campaign systems to ensure consistency in frontend and backend data interaction.

## 🔗 Core mapping relationship

### 1. Project related

| Frontend Fields | Backend Contract Fields | Type | Description |
|--------------|-----------------|------|------|
| `projectAddress` | `projectAddress` | string | Contract address as unique identifier |
| `name` | `name()` | string | Project name |
| `symbol` | `symbol()` | string | Project token symbol |
| `description` | `description()` | string | Project description |
| `category` | `category()` | string | Project category |
| `totalParticipants` | `getProjectStats().totalParticipants` | number | Number of participants |
| `totalComments` | `totalComments()` | number | Total number of comments |
| `totalLikes` | `getProjectStats().totalLikes` | number | Total number of likes |
| `lastActivityTime` | `getProjectStats().lastActivityTime` | number | Last activity time |
| `isActive` | `isActive()` | boolean | Is the project active |
| `creator` | `creator()` | string | Project creator address |

**Front-end specific fields (non-on-chain data):**
- `website` - The official website of the project, currently empty
- `whitepaper` - Whitepaper link, currently empty
- `colorIndex` - color index, used for UI display
- `status` - Status calculated based on `isActive`

**Removed fields (Campaign system replacement):**
- `poolValueUSD` - replaced by the prize pool value of each Campaign
- `nextDrawTime` - replaced by the end time of the Campaign

### 2. User related

| Frontend Fields | Backend Contract Fields | Type | Description |
|--------------|-----------------|------|------|
| `address` | Contract caller address | string | Wallet address as unique identifier |
| `totalRewards` | Aggregate all campaigns' received rewards | string | Total amount of received rewards (display format) |
| `commentTokens` | Aggregate all campaign's comment CRT | number | CRT Token - the part obtained by comment |
| `likeTokens` | Aggregate all campaign's likes CRT | number | CRT Token - the part obtained by likes |
| `totalCRT` | Aggregate the CRT balance of all campaigns | number | Total CRT quantity |
| `totalComments` | Aggregate the number of comments for all projects | number | Total number of comments |
| `totalLikes` | Aggregate likes for all projects | number | Total likes |

**Front-end specific fields (non-on-chain data):**
- `username` - username, shortened by default
- `avatar` - avatar, automatically generated
- `joinDate` - Join date, front-end record
- `status` - User status:
- `"Verified"` - Platform verification (not implemented in the contract)
- `"Elite"` - elite users (based on the number of CRTs)
- `"Active"` - Regular active users
- `badge` - User badge, for front-end display

### 3. Comments

| Frontend Fields | Backend Contract Fields | Type | Description |
|--------------|-----------------|------|------|
| `id` | `Comment.id` | number | Comment ID |
| `author` | `Comment.author` | string | Author wallet address |
| `content` | `Comment.content` | string | Comment content |
| `likes` | `Comment.likes` | number | Likes |
| `timestamp` | `Comment.timestamp` | number | Comment time (Unix timestamp) |
| `crtReward` | `Comment.crtReward` | number | CRT Token reward (deprecated, displayed as 0) |
| `isElite` | `Comment.isElite` | boolean | Whether it is an elite comment (determined by Campaign) |

**Front-end specific fields (non-on-chain data):**
- `avatar` - commenter avatar, automatically generated
- `verified` - Platform verification status (not yet implemented)
- `dislikes` - the number of dislikes, keep mock data (not implemented yet)

**Campaign System Description:**
- The actual CRT reward for comments is managed by the Campaign system and is no longer stored in the Comment structure
- The user's CRT balance needs to be obtained through `getUserCampaignCRTDetails`
- Elite reviews are determined by the number of CRTs obtained at the end of the campaign.

### 4. Campaign related

| Frontend Fields | Backend Contract Fields | Type | Description |
|--------------|-----------------|------|------|
| `address` | Campaign contract address | string | Campaign contract address as unique identifier |
| `projectAddress` | `projectAddress()` | string | The associated project address |
| `sponsor` | `sponsor()` | string | sponsor address |
| `sponsorName` | `sponsorName()` | string | sponsor name |
| `startTime` | `startTime()` | number | start timestamp |
| `endTime` | `endTime()` | number | end timestamp |
| `isActive` | `isCurrentlyActive()` | boolean | Is it active |
| `rewardsDistributed` | `rewardsDistributed()` | boolean | Whether rewards have been distributed |
| `rewardToken` | `rewardToken()` | string | Reward token address |
| `totalRewardPool` | `totalRewardPool()` | number | Total reward pool amount (wei format) |
| `totalComments` | `totalComments()` | number | Number of comments during the event |
| `totalLikes` | `totalLikes()` | number | Number of likes during the event |
| `totalParticipants` | `participants.length` | number | Number of participants |
| `name` | `name()` | string | CRT token name |
| `symbol` | `symbol()` | string | CRT token symbol (fixed to "CRT") |
| `totalSupply` | `totalSupply()` | number | Total CRT supply (converted to integer) |

**Front-end specific fields (non-on-chain data):**
- `remainingTime` - remaining time (seconds), calculated from endTime
- `poolValueUSD` - the USD value of the prize pool, calculated by the price oracle
- `tokenIcon` - Reward token icon, for front-end display

### 5. User Campaign CRT Details

| Frontend Fields | Backend Contract Fields | Type | Description |
|--------------|-----------------|------|------|
| `campaignAddress` | Campaign contract address | string | Campaign address |
| `commentCRT` | `commentCRT[user]` | number | The CRT obtained by the comment (converted to integer) |
| `likeCRT` | `likeCRT[user]` | number | CRT obtained by liking (converted to integer) |
| `totalCRT` | `balanceOf(user)` | number | Total CRT balance (converted to integer) |
| `pendingReward` | `pendingRewards[user]` | number | Rewards to be claimed (wei format) |
| `crtBalance` | `balanceOf(user)` | number | CRT token balance (converted to integer) |

## 🔄 Data conversion tools

### Conversion function location
All data conversion functions are located in `frontend/utils/contract-helpers.ts`

### Main conversion function

1. **CRT precision conversion**
- `convertCRTReward(reward)` - 18 decimal places converted to integers for display
- `convertToCRTWei(amount)` - convert integer to 18 decimal places

2. **Time conversion**
- `calculateRemainingTime(endTime)` - Convert Unix timestamp to remaining time
- `formatRemainingTime(seconds)` - remaining time is displayed in a friendly way
- `formatTimestamp(timestamp)` - Convert Unix timestamp to relative time

3. **Conversion of amount**
- `calculatePoolValueUSD(token, amount)` - calculates the USD value via a price oracle
- `formatCRTAmount(amount)` - CRT amount format

4. **UI Assistance**
- `getProjectColor(projectAddress)` - Generates a color based on the address
- `generateDefaultAvatar(address)` - Generate a default avatar
- `shortenAddress(address)` - shorten the address display

5. **State Calculation**
- `calculateProjectStatus(isActive)` - Calculates the project status
- `checkIsEliteUser(totalCRT)` - Check if the user is an elite user
- `isCampaignActive(startTime, endTime)` - Determines whether the Campaign is active

6. Data Preparation
- `prepareProjectForDisplay(contractProject)` - prepare project display data
- `prepareCommentForDisplay(contractComment)` - prepare comment display data
- `prepareUserForDisplay(contractUser)` - prepare user display data
- `prepareCampaignForDisplay(contractCampaign)` - Prepare Campaign to display data

## 🎨 UI related configuration

### Color Configuration
The `PROJECT_COLORS` array in `frontend/types/index.ts`:
```TypeScript
export const PROJECT_COLORS = [
"from-orange-500 to-yellow-500", // Bitcoin style
"from-blue-500 to-purple-500", // Ethereum style
"from-purple-500 to-pink-500", // Solana style
// ... 10 colors in total
]
```

### Route Mapping
- Project details page: `/projects/[projectAddress]`
- User page: Use wallet address identification
- API calls: use `projectAddress` instead of simple ID

## 📋 Development Notes

### Principles that must be followed

1. **Unique Identifier**
- Project: use `projectAddress` (contract address)
- User: Use `address` (wallet address)
- Comments: Use `id` (numeric ID)
- Campaign: use `address` (Campaign contract address)

2. **Data Type**
- Time: Use Unix timestamp (number) uniformly
- CRT quantity: The contract returns 18 decimal places (bigint), and the front end displays an integer (number)
- Reward amount: The contract returns in wei format (bigint), and the front end converts according to the token precision
- Address: Use the full 42-bit hexadecimal address

3. **Front-end specific fields**
- All UI display related fields (such as color, avatar, user name) are generated by the front end
- If the contract does not return the field, use the default value

4. State Management
- `verified` status: platform certified, contract not yet implemented
- `isElite` status: determined based on the number of CRTs or when the campaign ends
- `status` status: calculated based on contract data

5. **Special processing of Campaign system**
- CRT reward data needs to be obtained from the Campaign contract and no longer depends on the Comment structure
- User data needs to be aggregated across all participating campaigns
- The value of the prize pool needs to be calculated in real time through a price oracle

### Functions to be implemented

1. **Platform authentication system** - Contract functions corresponding to the `verified` field
2. **Dislike function** - contract implementation related to `dislikes`
3. **Website and white paper** - Whether it needs to be stored on the chain is to be confirmed
4. **Automatic identification of elite reviews** - Optimization of the elite review algorithm at the end of the campaign

## 🔧 Usage examples

```TypeScript
// Get project data and convert it to front-end format
const contractProject = await contract.getProject(projectAddress)
const displayProject = prepareProjectForDisplay(contractProject)

// Get the Campaign list of the project
const campaigns = await api.getProjectCampaigns(projectAddress)
const activeCampaigns = campaigns.filter(c => c.isActive)

// Get the user's CRT details
const userCRTDetails = await api.getUserCampaignCRTDetails(projectAddress, userAddress)
const totalCRT = userCRTDetails.reduce((sum, detail) => sum + detail.totalCRT, 0)

// Use the converted data
console.log(displayProject.status) // "Active"
console.log(activeCampaigns.length) // 3
console.log(totalCRT) // 125 (integer display)
```

### Campaign system integration example

```TypeScript
// Create a new Campaign
const campaignParams = {
projectAddress: "0x...",
sponsorName: "Alice",
duration: 30, // 30 days
rewardToken: "0x...", // USDC address
rewardAmount: parseUnits("1000", 6).toString() // 1000 USDC
}

const campaignAddress = await api.createCampaign(campaignParams)

// Post a comment to get CRT reward
await api.postComment(projectAddress, "This project has great potential!")
// Automatically get 5 CRTs in all active campaigns

// Like the comment to get CRT reward
await api.likeComment(projectAddress, commentId)
// The person who clicks the like button and the person who is clicked gets 1 CRT each

// Receive rewards after the Campaign ends
await api.claimCampaignReward(campaignAddress)
// Get corresponding USDC rewards based on the CRT ratio
```

---
