# CoinReal 平台接口文档

## 概述

CoinReal 是一个创新的去中心化内容社区平台，通过区块链技术和Campaign奖励机制实现"评论即收益、点赞即赚币"的商业模式。本文档详细描述了平台所有智能合约接口的设计和实现。

## 核心设计理念

### Campaign奖励机制
- **Project-Campaign分离**：项目专注评论点赞系统，Campaign管理奖励分配
- **独立CRT代币**：每个Campaign发行独立的CRT代币（"项目名-Campaign编号"）
- **评论奖励**：发表评论在所有活跃Campaign中获得5个CRT
- **点赞奖励**：点赞获得1个CRT，被点赞者获得1个CRT
- **奖池分配**：60%评论奖励 + 25%点赞奖励 + 15%精英奖励（开发中）
- **Soulbound特性**：CRT代币不可转移，代表真实贡献度

### 技术架构
- **最小代理模式**：节省95%项目和Campaign创建成本
- **模块化设计**：职责分离，便于升级维护
- **价格预言机**：支持多种代币的USD价值计算
- **批量操作**：优化Gas消耗和用户体验
- **时间控制**：Campaign有明确的活动时间窗口

---

## 1. ICoinRealPlatform - 平台主合约接口

### 职责范围
平台主合约负责整体项目管理、Campaign管理、用户统计、排行榜功能等核心业务。

### 核心功能

#### 1.1 项目创建
```solidity
function createProject(
    string calldata name,        // 项目名称 (1-100字符)
    string calldata symbol,      // 项目符号 (1-20字符)
    string calldata description, // 项目描述 (最大1000字符)
    string calldata category,    // 项目分类 (Layer1/DeFi/NFT等)
    uint16 drawPeriod           // 兼容性参数（保留）
) external returns (address projectAddress);
```

**业务流程：**
1. 验证调用者权限（仅owner）
2. 通过ProjectFactory创建项目代理合约
3. 注册项目到平台并分类存储
4. 触发ProjectCreated事件

#### 1.2 Campaign管理
```solidity
function addCampaignToProject(
    address project,
    address campaign
) external;
```

**业务流程：**
1. 验证Campaign合约有效性
2. 将Campaign添加到Project的活跃列表
3. 更新平台统计数据

#### 1.3 项目查询
```solidity
// 分页获取项目列表
function getProjects(uint256 offset, uint256 limit) external view returns (
    ProjectInfo[] memory projects,
    uint256 total
);

// 按分类获取项目
function getProjectsByCategory(string calldata category) external view returns (address[] memory);

// 获取用户参与的项目
function getUserProjects(address user) external view returns (address[] memory);
```

#### 1.4 统计和排行榜
```solidity
// 平台统计数据
function getPlatformStats() external view returns (
    uint256 totalProjects,    // 总项目数
    uint256 totalUsers,       // 总用户数
    uint256 totalComments,    // 总评论数
    uint256 totalCampaigns    // 总Campaign数
);

// 项目排行榜
function getProjectLeaderboard(
    uint8 sortBy,    // 排序方式: 0-参与人数, 1-评论数, 2-Campaign数, 3-最新活动
    uint256 offset,  // 起始位置
    uint256 limit    // 返回数量
) external view returns (
    address[] memory projects,
    uint256[] memory stats
);
```

---

## 2. IProject - 项目合约接口

### 职责范围
管理单个项目的评论、点赞系统，并与多个Campaign协调奖励分配。

### 核心功能

#### 2.1 评论系统
```solidity
function postComment(string calldata content) external returns (uint256 commentId);
```

**业务规则：**
- 内容长度限制：1-1000字符
- 通知所有活跃Campaign铸造5个CRT奖励
- 评论ID自增，保证时间顺序
- 更新用户统计数据

#### 2.2 点赞系统
```solidity
function likeComment(uint256 commentId) external;
```

**业务规则：**
- 每个用户只能对同一评论点赞一次
- 通知所有活跃Campaign为点赞者和被点赞者各铸造1个CRT奖励
- 更新评论点赞计数

#### 2.3 Campaign管理
```solidity
// 添加Campaign到项目
function addCampaign(address campaign) external; // 仅平台可调用

// 获取项目的所有Campaign
function getCampaigns() external view returns (address[] memory);

// 获取用户在所有Campaign中的CRT总数
function getUserTotalCRT(address user) external view returns (uint256 totalCRT);

// 获取用户在所有Campaign中的详细CRT信息
function getUserCampaignCRTDetails(address user) external view returns (
    address[] memory campaignAddresses,
    uint256[] memory commentCRTs,
    uint256[] memory likeCRTs,
    uint256[] memory totalCRTs,
    uint256[] memory pendingRewards
);
```

#### 2.4 数据查询
```solidity
// 获取评论详情
function getComment(uint256 commentId) external view returns (Comment memory);

// 分页获取评论列表
function getComments(uint256 offset, uint256 limit) external view returns (
    Comment[] memory comments,
    uint256 total
);

// 获取项目统计
function getProjectStats() external view returns (
    uint256 totalParticipants,
    uint256 totalLikes,
    uint256 lastActivityTime,
    uint256 currentPoolUSD // 兼容性保留，返回0
);

// 获取用户活动
function getUserActivity(address user, uint256 offset, uint256 limit) external view returns (
    uint256[] memory commentIds,
    uint256[] memory likedCommentIds
);
```

### 数据结构

#### Comment 结构
```solidity
struct Comment {
    uint256 id;          // 评论唯一ID（自增）
    address author;      // 评论作者地址
    string content;      // 评论内容
    uint256 likes;       // 点赞数量
    uint256 crtReward;   // 兼容性保留（不使用）
    bool isElite;        // 精英状态由Campaign决定
    uint32 timestamp;    // 发布时间戳
}
```

---

## 3. ICampaign - Campaign合约接口

### 职责范围
管理单个Campaign的CRT代币铸造、奖池管理和奖励分配。每个Campaign是一个独立的ERC20代币合约。

### 核心功能

#### 3.1 Campaign信息
```solidity
// 基本信息
function projectAddress() external view returns (address);
function sponsor() external view returns (address);
function sponsorName() external view returns (string memory);
function startTime() external view returns (uint256);
function endTime() external view returns (uint256);
function rewardToken() external view returns (address);
function totalRewardPool() external view returns (uint256);

// 状态查询
function isCurrentlyActive() external view returns (bool);
function rewardsDistributed() external view returns (bool);
```

#### 3.2 CRT代币功能（继承ERC20）
```solidity
// ERC20基础功能
function name() external view returns (string memory); // "项目名-Campaign编号"
function symbol() external view returns (string memory); // "CRT"
function balanceOf(address account) external view returns (uint256);
function totalSupply() external view returns (uint256);

// Soulbound特性 - 以下函数会revert
function transfer(address to, uint256 amount) external returns (bool);
function transferFrom(address from, address to, uint256 amount) external returns (bool);
function approve(address spender, uint256 amount) external returns (bool);
```

#### 3.3 Project回调函数
```solidity
// 当用户发表评论时由Project合约调用
function onCommentPosted(address user, uint256 commentId) external; // 铸造5 CRT

// 当用户点赞评论时由Project合约调用
function onCommentLiked(address liker, address author, uint256 commentId) external; // 各铸造1 CRT
```

#### 3.4 奖励分配
```solidity
// 分配奖励 - 仅平台可调用
function distributeRewards() external;

// 用户领取奖励
function claimRewards() external;

// 延长Campaign时间 - 仅平台可调用
function extendEndTime(uint256 additionalDays) external;
```

**分配规则：**
- **60%**：按CRT占比分配给所有参与者
- **25%**：按点赞获得的CRT占比分配给点赞者
- **15%**：精英奖励（开发中）

**自动延期机制：**
- 如果Campaign结束时没有参与者，自动延长7天
- 避免奖励资源浪费

#### 3.5 数据查询
```solidity
// 获取用户的CRT详情
function getUserCRTBreakdown(address user) external view returns (
    uint256 commentTokens,   // 评论获得的CRT
    uint256 likeTokens,      // 点赞获得的CRT
    uint256 totalTokens,     // 总CRT数量
    uint256 pendingReward    // 待领取奖励
);

// 获取Campaign统计信息
function getCampaignStats() external view returns (
    uint256 totalParticipants,
    uint256 totalComments,
    uint256 totalLikes,
    uint256 totalCRT,
    uint256 remainingTime
);
```

---

## 4. ICampaignFactory - Campaign工厂接口

### 职责范围
使用最小代理模式创建Campaign合约，管理代币转移和Campaign注册。

### 核心功能

#### 4.1 Campaign创建
```solidity
function createCampaign(
    address project,         // 目标项目地址
    string calldata sponsorName,  // 赞助者名称
    uint256 duration,        // 持续时间（天）
    address rewardToken,     // 奖励代币地址
    uint256 rewardAmount     // 奖励代币数量
) external returns (address campaignAddress);
```

**业务流程：**
1. 验证参数有效性
2. 从调用者转移奖励代币到Factory
3. 使用最小代理模式创建Campaign合约
4. 将代币转移到Campaign合约
5. 通过平台将Campaign添加到Project
6. 触发CampaignCreated事件

#### 4.2 Campaign验证
```solidity
function isValidCampaign(address campaignAddress) external view returns (bool);
```

**验证内容：**
- 检查合约是否存在
- 验证字节码是否匹配最小代理模式
- 验证实现合约地址是否正确

### Gas成本对比

| 部署方式 | Gas消耗 | 成本节省 |
|---------|---------|----------|
| 标准Campaign部署 | ~1,500,000 | - |
| Clone模式部署 | ~40,000 | 97% |

---

## 5. IProjectFactory - 项目工厂接口

### 职责范围
使用最小代理模式（EIP-1167）创建项目合约，节省部署成本。

### 核心功能

#### 5.1 项目创建
```solidity
function createProject(
    string calldata name,
    string calldata symbol,
    string calldata description,
    string calldata category,
    uint16 drawPeriod,
    address creator,
    address priceOracle,
    address platform
) external returns (address projectAddress);
```

**技术实现：**
- 使用标准Clone模式部署
- 最小代理模式节省95% Gas成本
- 自动调用initialize函数初始化

#### 5.2 合约验证
```solidity
function isValidProject(address projectAddress) external view returns (bool isValid);
```

---

## 6. IPriceOracle - 价格预言机接口

### 职责范围
提供代币USD价值查询服务，支持多代币批量查询。

### 核心功能

#### 6.1 价值计算
```solidity
function getUSDValue(address token, uint256 amount) external view returns (uint256 usdValue);
```

**计算公式：**
```
USD Value = (token_amount * token_price) / (10^token_decimals)
```

#### 6.2 批量查询
```solidity
function getBatchUSDValue(
    address[] calldata tokens,
    uint256[] calldata amounts
) external view returns (uint256 totalUSDValue);
```

### 价格精度标准

所有价格采用8位小数精度（类似Chainlink标准）：
- $1.00 = 100,000,000 (1 * 10^8)
- $2000.50 = 200,050,000,000 (2000.5 * 10^8)

---

## 7. 完整的用户交互流程

### 7.1 Campaign创建流程
1. **选择项目** → 浏览现有项目列表
2. **设置Campaign** → 选择奖励代币、金额、持续时间
3. **批准代币** → 授权CampaignFactory转移代币
4. **创建Campaign** → 调用createCampaign函数
5. **Campaign激活** → 自动开始接收用户活动并铸造CRT

### 7.2 用户参与流程
1. **连接钱包** → 检测资产情况
2. **选择项目** → 浏览项目列表，查看活跃Campaign
3. **发表评论** → 在所有活跃Campaign中获得5个CRT奖励
4. **点赞互动** → 点赞他人评论，双方都获得奖励
5. **查看收益** → 实时查看在各Campaign中的CRT余额

### 7.3 奖励领取流程
1. **Campaign结束** → 到达设定的结束时间
2. **平台分配** → 平台按规则计算并分配奖池奖励
3. **查看待领取** → 用户查看各Campaign中的待领取奖励
4. **领取奖励** → 调用claimRewards领取具体代币奖励

---

## 8. 安全机制

### 8.1 智能合约安全
- **重入攻击防护**：使用ReentrancyGuard
- **权限控制**：关键函数仅平台可调用
- **数值溢出检查**：Solidity 0.8+内置检查
- **安全代币转移**：使用SafeERC20

### 8.2 Campaign安全
- **时间控制**：严格的活动时间窗口验证
- **代币锁定**：CRT代币不可转移（Soulbound）
- **权限分离**：Campaign管理权限归平台所有
- **防重复奖励**：确保同一活动不会重复获得奖励

### 8.3 经济模型安全
- **最低赞助限制**：通过预言机验证USD价值
- **奖励分配透明**：固定的60%-25%-15%分配比例
- **自动延期机制**：避免无效Campaign浪费资源

---

## 9. Gas优化策略

### 9.1 合约层面优化
- **最小代理模式**：节省95%+部署成本
- **批量操作**：支持批量查询和批量领取
- **事件存储**：评论内容通过事件存储
- **紧凑数据结构**：合理安排struct字段顺序

### 9.2 前端优化建议
- **批量RPC调用**：使用multicall合并查询
- **Campaign数据缓存**：缓存Campaign基础信息
- **分页加载**：避免一次加载大量数据
- **智能预加载**：根据用户行为优化数据获取

---

## 10. 扩展性设计

### 10.1 模块化架构
- **职责分离**：Project专注内容，Campaign专注奖励
- **接口抽象**：核心功能抽象为接口
- **代理模式**：支持逻辑升级
- **事件驱动**：完整的事件系统

### 10.2 未来扩展方向
- **精英奖励算法**：基于机器学习的内容质量评估
- **跨链Campaign**：多链部署和资产跨链
- **NFT奖励**：引入NFT奖励机制
- **DAO治理**：社区治理Campaign参数

---

## 11. 开发指南

### 11.1 本地开发环境
```bash
# 安装依赖
forge install

# 编译合约
forge build

# 运行测试
forge test --match-contract CampaignSystemTest

# 部署到本地网络
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast
```

### 11.2 测试覆盖率
```bash
# 生成测试覆盖率报告
forge coverage

# 查看详细报告
forge coverage --report lcov
```

---

## 12. 总结

CoinReal平台通过创新的Campaign系统架构，实现了：

✅ **灵活的奖励机制** - 任何人可创建Campaign，自定义奖励  
✅ **多Campaign并行** - 用户同时在多个Campaign中获得奖励  
✅ **高效的Gas优化** - 最小代理模式节省97%成本  
✅ **强大的安全机制** - 多层次安全防护和权限控制  
✅ **优秀的扩展性** - 模块化设计便于功能扩展  
✅ **流畅的用户体验** - 批量操作和智能查询优化  

Campaign系统为Web3内容社区提供了一个更加灵活、可持续的技术基础，真正实现了"评论即收益、点赞即赚币"的愿景，并为未来的功能扩展预留了充足的空间。 