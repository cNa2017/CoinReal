# CoinReal Web Project API Documentation

Campaign Rewards System API Interface Specification for the Cryptocurrency Dianping Web Application

🔧 Technology Stack

- **Data Management**: TanStack Query (React Query)
- **Web3 Integration**: Wagmi + Viem ✨
- **Smart Contract**: Campaign Reward System (Solidity) ✨
- **Type definitions**: TypeScript (strict mode)
- **State Management**: React Hooks + Campaign state synchronization ✨
- **Data conversion**: Campaign data ↔ front-end data format conversion ✨

## 📋 API Overview

This project has been fully integrated with the real Campaign smart contract, realizing the innovative "commenting means earning, liking means earning coins" reward mechanism.

### 🎯 Campaign system core concepts

#### Campaign Reward Mechanism✨

```TypeScript
const CampaignSystem = {
// 📍 Project-Campaign separation architecture
architecture:
project: "Focus on comment and like system, manage content interaction",
campaign: "Manage reward distribution and issue independent CRT tokens",
separation: "Separation of responsibilities, easy to expand and maintain",
},

// 🎁 Independent CRT Token
crtTokens: {
naming: "Project name-Campaign number (eg: Bitcoin-Campaign1)",
symbol: "CRT (fixed)",
feature: "Soulbound - cannot be transferred, represents real contribution",
precision: "18 decimal places, displayed as integers at the front end",
},

// 💰 Rewards
rewards:
comment: "5 CRT (earned in all active campaigns)",
like: "The person who likes the post and the person who is liked will each receive 1 CRT",
distribution: {
comment: "60% - distributed to all participants according to CRT proportion",
like: "25% - distributed according to the percentage of likes CRT",
elite: "15% - equally shared among the reviewers who get the most CRTs",
},
},

// ⏰ Campaign life cycle
lifecycle:
creation: "Anyone can create and customize reward tokens and amounts",
active: "Users comment and like, and receive CRT rewards in real time",
ended: "Campaign ended, real token rewards distributed",
extension: "Automatically extend for 7 days if there are no participants",
},
};
```

### 🔄 Dual mode support

- **Contract mode**: Real Campaign system interaction (`wagmi-contract-api.ts`)
- **Mock mode**: mock data development (`mock-data.ts`)

### 🎯 Unified interface design

The two modes provide exactly the same API interface and support seamless switching:

```TypeScript
// Contract API mode
import { api } from "@/lib/wagmi-contract-api";

//Mock API mode
import { api } from "@/lib/mock-data";

// Used in exactly the same way
const campaigns = await api.getProjectCampaigns(projectAddress);
```

## 🔗 Web3 Identity Authentication

### Wallet connection status ✨

```TypeScript
interface WalletState {
isConnected: boolean; // Is the wallet connected?
isConnecting: boolean; // Is it connecting?
address?: string; // wallet address
chainId: number; // Current chain ID
isOnContractNetwork: boolean; // Is it on the contract network?
canWrite: boolean; // Whether the write operation can be performed
canRead: boolean; // Whether the read operation can be performed
}

// Hook usage
const { isConnected, address, canWrite } = useContractApi();
```

### Network Architecture Management ✨

```TypeScript
// Contract network configuration (developer controlled, fixed configuration)
const CONTRACT_NETWORK = anvil; // Current: Local development
// const CONTRACT_NETWORK = sepolia // Deployable to: testnet

// Networks supported by the wallet (users can switch)
const SUPPORTED_WALLET_NETWORKS = {
anvil: { id: 31337, name: "Anvil Local Network" },
sepolia: { id: 11155111, name: "Sepolia Testnet" },
mainnet: { id: 1, name: "Ethereum Mainnet" },
};

// Network status detection
const {
isOnContractNetwork, // Whether the wallet network matches the contract network
switchNetwork, // Switch wallet network
contractNetwork, //Contract network information (read-only)
walletNetwork, // Wallet network information
} = useContractApi();
```

## ⚡ Operation type distinction ✨

### Contract related operations (fixed contract network)

- **Read operation**: `getProjects`, `getProjectCampaigns`, `getCampaignDetails`, etc.
- Always read data from the configured contract network
- No wallet network matching required
- Can be executed even if the wallet is not connected
- **Write operations**: `postComment`, `likeComment`, `createCampaign`, etc.
- Write to the configured contract network
- **Required**: Wallet Network = Contract Network
- User wallet signature confirmation is required

### Wallet related operations (user wallet network)

- **Balance query**: ETH balance, Token balance, CRT balance, etc.
- **Asset information**: All assets of the user in the current wallet network
- **Network Switch**: Help users switch wallet networks to match contract networks

## 🚀 Project related interfaces

### 1. Get the project list ✨

**Interface name**: `getProjects`
**Purpose**: Get the list information of all cryptocurrency projects from the smart contract
**Contract call**: `CoinRealPlatform.getProjects(offset, limit)`

**Request Parameters**:

- `offset` (number, optional): paging offset, default 0
- `limit` (number, optional): number of pages per page, default is 50

**Return data type**: `Promise<Project[]> `

**Contract data conversion** ✨:

```TypeScript
// The original data returned by the contract
interface ContractProjectData {
projectAddress: string; // Contract address
name: string; // Project name
symbol: string; // Token symbol
totalParticipants: bigint; // Number of participants
totalComments: bigint; // Total number of comments
totalLikes: bigint; // Total number of likes
lastActivityTime: bigint; // Last activity time
isActive: boolean; // Is it active?
// ... other fields
}

//Convert to front-end data format
const frontendProject = convertContractProjectToFrontend(contractData);
```

**Return data structure**:

```TypeScript
interface Project {
projectAddress: string; // Contract address as unique identifier✨
name: string; // Project name
symbol: string; // Token symbol
description: string; // Project description
category: string; //Project category
totalParticipants: number; // Total number of participants
totalComments: number; // Number of comments
totalLikes: number; // Total number of likes
lastActivityTime: number; // Last activity timestamp✨
isActive: boolean; // Is it active?
creator: string; // creator address✨
status: "Active" | "New" | "Paused" | "Ended"; // Project status
colorIndex?: number; // UI color index (0-9)
}
```

**React Hook call**:

```TypeScript
const {
data: projects,
isLoading,
error,
} = useQuery({
queryKey: ["projects"],
queryFn: () => api.getProjects(),
});
```

---

### 2. Get details of a single project ✨

**Interface name**: `getProject`
**Purpose**: Get detailed information of the specified project
**Contract call**: `Project.getProjectStats()` + basic information query

**Request Parameters**:

- `projectAddress` (string): project contract address

**Return data type**: `Promise<Project | null> `

**React Hook call**:

```TypeScript
const { data: project, isLoading } = useQuery({
queryKey: ["project", projectAddress],
queryFn: () => api.getProject(projectAddress),
enabled: !!projectAddress,
});
```

## 🎯 Campaign related interfaces✨

### 3. Get the project campaign list

**Interface name**: `getProjectCampaigns`
**Purpose**: Get a list of all Campaigns for a specified project
**Contract call**: `Project.getCampaigns()` + batch query of Campaign details

**Request Parameters**:

- `projectAddress` (string): project contract address

**Return data structure**:

```TypeScript
interface Campaign {
address: string; // Campaign contract address
projectAddress: string; // Associated project address
sponsor: string; // sponsor address
sponsorName: string; // sponsor name
startTime: number; // start timestamp
endTime: number; // end timestamp
isActive: boolean; // Is it active?
rewardsDistributed: boolean; // Whether the reward has been distributed
rewardToken: string; // Reward token address
totalRewardPool: number; //Total reward pool amount (wei format)
totalComments: number; // Number of comments during the event
totalLikes: number; // Number of likes during the event
totalParticipants: number; // Number of participants

// ERC20 token information
name: string; // CRT token name, such as "Bitcoin-Campaign1"
symbol: string; // CRT token symbol, fixed as "CRT"
totalSupply: number; // Total CRT supply

// Front-end display fields
remainingTime?: number; // Remaining time (seconds)
poolValueUSD?: number; // USD value of the prize pool
tokenIcon?: string; // Reward token icon
}
```

**React Hook call**:

```TypeScript
const { data: campaigns, isLoading } = useQuery({
queryKey: ["campaigns", projectAddress],
queryFn: () => api.getProjectCampaigns(projectAddress),
enabled: !!projectAddress,
});
```

---

### 4. Create a new campaign

**Interface name**: `createCampaign`
**Purpose**: Create a new Campaign for a specified project
**Contract call**: `CampaignFactory.createCampaign()`

**Request Parameters**:

```TypeScript
interface CreateCampaignParams {
projectAddress: string; // target project address
sponsorName: string; // sponsor name
duration: number; // duration (minutes)
rewardToken: string; // Reward token address
rewardAmount: string; // Reward token amount (string in wei format)
}
```

**Business Process**:

1. User authorizes CampaignFactory to transfer tokens
2. Call createCampaign to create a Campaign contract
3. Tokens are automatically transferred to the Campaign contract
4. Campaign is automatically added to the active list of the project

**React Hook call**:

```TypeScript
const createCampaignMutation = useMutation({
mutationFn: (params: CreateCampaignParams) => api.createCampaign(params),
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ["campaigns"] });
toast.success("Campaign created successfully!");
},
});
```

---

### 5. Get user Campaign CRT details

**Interface name**: `getUserCampaignCRTDetails`
**Purpose**: Get the CRT token details of the user in all Campaigns of the project
**Contract call**: `Project.getUserCampaignCRTDetails()`

**Request Parameters**:

- `projectAddress` (string): project contract address
- `userAddress` (string, optional): User address, default current connection address

**Return data structure**:

```TypeScript
interface UserCampaignCRT {
campaignAddress: string; // Campaign address
commentCRT: number; // CRT obtained by comment
likeCRT: number; // CRT obtained by liking
totalCRT: number; // Total CRT
pendingReward: number; // Reward to be collected (wei format)
crtBalance: number; // CRT token balance
}
```

**React Hook call**:

```TypeScript
const { data: userCRTDetails, isLoading } = useQuery({
queryKey: ["userCRTDetails", projectAddress, userAddress],
queryFn: () => api.getUserCampaignCRTDetails(projectAddress, userAddress),
enabled: !!projectAddress && !!userAddress,
});
```

---

### 6. Receive Campaign Rewards

**Interface name**: `claimCampaignReward`
**Purpose**: Receive rewards from designated campaigns
**Contract call**: `Campaign.claimRewards()`

**Request Parameters**:

- `campaignAddress` (string): Campaign contract address

**Prerequisites**:

- The campaign must have ended and the rewards distributed
- User must be waiting to claim the reward

**React Hook call**:

```TypeScript
const claimRewardMutation = useMutation({
mutationFn: (campaignAddress: string) =>
api.claimCampaignReward(campaignAddress),
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ["userCRTDetails"] });
toast.success("Reward received successfully!");
},
});
```

## 💬 Comment related interface

### 7. Get project comment list

**Interface name**: `getProjectComments`
**Purpose**: Get the comment list of the specified project
**Contract call**: `Project.getComments(offset, limit)`

**Request Parameters**:

- `projectAddress` (string): project contract address
- `offset` (number, optional): paging offset, default 0
- `limit` (number, optional): number of pages per page, default is 20

**Return data structure**:

```TypeScript
interface Comment {
id: number; // Comment ID
author: string; // author address
content: string; // Comment content
likes: number; // number of likes
timestamp: number; // Release timestamp
crtReward: number; // CRT reward (converted to integer)
isElite: boolean; // Is it an elite comment?

// Front-end display fields
avatar?: string; // avatar URL
verified?: boolean; // Is it authenticated?
dislikes?: number; // dislike number (not implemented yet)
}
```

**React Hook call**:

```TypeScript
const { data: comments, isLoading } = useQuery({
queryKey: ["comments", projectAddress],
queryFn: () => api.getProjectComments(projectAddress),
enabled: !!projectAddress,
});
```

---

### 8. Post a comment

**Interface name**: `postComment`
**Purpose**: Post comments on a specific project
**Contract call**: `Project.postComment(content)`

**Request Parameters**:

- `projectAddress` (string): project contract address
- `content` (string): Comment content (1-1000 characters)

**Reward Mechanism** ✨:

- Automatically receive 5 CRTs in all active campaigns of the project
- Comment IDs are automatically incremented to ensure chronological order
- Update user statistics

**React Hook call**:

```TypeScript
const postCommentMutation = useMutation({
mutationFn: ({
projectAddress,
content,
}: {
projectAddress: string;
content: string;
}) => api.postComment(projectAddress, content),
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ["comments"] });
queryClient.invalidateQueries({ queryKey: ["userCRTDetails"] });
toast.success("Comment published successfully! Received 5 CRT rewards");
},
});
```

---

### 9. Like and comment

**Interface name**: `likeComment`
**Purpose**: Like a specified comment
**Contract call**: `Project.likeComment(commentId)`

**Request Parameters**:

- `projectAddress` (string): project contract address
- `commentId` (number): comment ID

**Reward Mechanism** ✨:

- Likers will receive 1 CRT in all active campaigns
- The liked user will receive 1 CRT in all active campaigns
- Each user can only like the same comment once

**React Hook call**:

```TypeScript
const likeCommentMutation = useMutation({
mutationFn: ({
projectAddress,
commentId,
}: {
projectAddress: string;
commentId: number;
}) => api.likeComment(projectAddress, commentId),
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ["comments"] });
queryClient.invalidateQueries({ queryKey: ["userCRTDetails"] });
toast.success("Like successful! You and the author each get 1 CRT");
},
});
```

## 👤 User related interfaces

### 10. Get user information

**Interface name**: `getUser`
**Purpose**: Get user statistics and asset details
**Contract call**: Aggregate user data of multiple contracts

**Request Parameters**:

- `userAddress` (string, optional): User address, default current connection address

**Return data structure**:

```TypeScript
interface User {
address: string; // wallet address
username?: string; // Display name (address abbreviation)
avatar?: string; // avatar URL
totalRewards: string; // Total amount of rewards received
commentTokens: number; // Total number of CRTs obtained by comment
likeTokens: number; // Total number of CRTs obtained by likes
totalComments: number; // Total number of comments
totalLikes: number; // Total number of likes
totalCRT: number; //Total number of CRTs
joinDate: string; // Join date
status: "Active" | "Verified" | "Elite"; // User status
badge?: string; // User badge
}
```

**React Hook call**:

```TypeScript
const { data: user, isLoading } = useQuery({
queryKey: ["user", userAddress],
queryFn: () => api.getUser(userAddress),
enabled: !!userAddress,
});
```

---

### 11. Get user activity records

**Interface name**: `getUserActivity`
**Purpose**: Get the user's activity history
**Contract call**: Aggregate user activity data in various projects

**Request Parameters**:

- `userAddress` (string, optional): user address
- `offset` (number, optional): paging offset
- `limit` (number, optional): number of pages per page

**Return data structure**:

```TypeScript
interface UserActivity {
id: string; // Activity ID
type: "comment" | "like" | "sponsor" | "reward" | "achievement"; // activity type
action: string; //activity description
target: string; // target object
reward: string; //Get reward
timestamp: string; // timestamp
description: string; //Detailed description
}
```

## 🔧 Data conversion tools

### CRT precision conversion ✨

```TypeScript
// 18 decimal places → integer display
const convertCRTReward = (reward: bigint): number => {
return parseInt(formatUnits(reward, 18));
};

// integer → 18 decimal places
const convertToCRTWei = (amount: number): bigint => {
return parseUnits(amount.toString(), 18);
};
```

### Time Processing ✨

```TypeScript
//Unix timestamp → remaining time
const calculateRemainingTime = (endTime: number): number => {
return Math.max(0, endTime - Math.floor(Date.now() / 1000));
};

// Remaining time → Friendly display
const formatRemainingTime = (seconds: number): string => {
const days = Math.floor(seconds / 86400);
const hours = Math.floor((seconds % 86400) / 3600);
if (days > 0) return `${days} days ${hours} hours`;
if (hours > 0) return `${hours} hours`;
return `${Math.floor(seconds / 60)}minutes`;
};
```

### Prize Pool Value Calculation ✨

```TypeScript
// Calculate USD value through price oracle
const calculatePoolValueUSD = async (
token: string,
amount: bigint
): Promise<number> => {
const usdValue = await priceOracle.getUSDValue(token, amount);
return Number(usdValue) / 1e8; // 8 decimal places → USD
};
```

## 🚨 Error handling

### Contract Error Types ✨

```TypeScript
interface ContractError {
code: string; // error code
message: string; // error message
data?: any; // Additional data
}

// Common error handling
const handleContractError = (error: any) => {
if (error.code === "USER_REJECTED_REQUEST") {
toast.error("The user canceled the transaction");
} else if (error.message.includes("insufficient funds")) {
toast.error("Insufficient balance");
} else if (error.message.includes("Campaign not active")) {
toast.error("Campaign is not activated");
} else {
toast.error("Transaction failed, please try again");
}
};
```

### Network Error Handling ✨

```TypeScript
const { isOnContractNetwork, switchNetwork } = useContractApi();

if (!isOnContractNetwork) {
return (
<div className="text-center p-4">
<p>Please switch to the correct network</p>
<button onClick={() =>switchNetwork()}>Switch network</button>
</div>
);
}
```

## 🎨 React Hooks Integration

### Complete component example ✨

```TypeScript
function ProjectCampaigns({ projectAddress }: { projectAddress: string }) {
const { data: campaigns, isLoading } = useQuery({
queryKey: ["campaigns", projectAddress],
queryFn: () => api.getProjectCampaigns(projectAddress),
});

const { data: userCRTDetails } = useQuery({
queryKey: ["userCRTDetails", projectAddress],
queryFn: () => api.getUserCampaignCRTDetails(projectAddress),
});

const createCampaignMutation = useMutation({
mutationFn: api.createCampaign,
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ["campaigns"] });
},
});

if (isLoading) return<div> loading...</div> ;

return (
<div>
<h2>Active Campaign</h2>
{campaigns?.map((campaign) => (
<CampaignCard
key={campaign.address}
campaign={campaign}
userCRT={userCRTDetails?.find(
(c) => c.campaignAddress === campaign.address
)}
/>
))}
<CreateCampaignButton onSubmit={createCampaignMutation.mutate} />
</div>
);
}
```

---

