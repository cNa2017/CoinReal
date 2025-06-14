# CoinReal 后端智能合约开发规范

## 项目概述

CoinReal 是一个去中心化的"币圈大众点评"平台，基于智能合约实现评论奖励、点赞收益和奖池分配机制。后端采用 Foundry 框架开发，部署在以太坊及其兼容链上。

## 技术架构

### 开发环境
- **框架**: Foundry (Forge, Cast, Anvil)
- **开发网络**: Anvil 本地测试网
- **编程语言**: Solidity ^0.8.19
- **测试框架**: Foundry Test
- **部署工具**: Forge Script

### 依赖集成
- **Chainlink Oracle**: 获取实时代币价格和持仓验证
- **OpenZeppelin**: 安全合约库（ERC20, Access Control, Pausable等）
- **多链支持**: Ethereum, Polygon, BSC, Arbitrum

## 核心合约架构

### 1. 项目管理合约 (ProjectManager.sol)

**功能职责**:
- 项目注册和管理
- 项目验证和状态控制
- 项目方权限管理

**主要功能**:
```solidity
// 项目注册
function registerProject(
    string memory name,
    string memory symbol,
    address tokenAddress,
    string memory description,
    string memory website,
    string memory whitepaper
) external returns (uint256 projectId);

// 项目信息更新
function updateProjectInfo(uint256 projectId, ProjectInfo memory info) external;

// 项目状态管理
function setProjectStatus(uint256 projectId, ProjectStatus status) external;

// 获取项目信息
function getProject(uint256 projectId) external view returns (Project memory);
```

**数据结构**:
```solidity
struct Project {
    uint256 id;
    string name;
    string symbol;
    address tokenAddress;
    address owner;
    string description;
    string website;
    string whitepaper;
    uint256 createdAt;
    ProjectStatus status;
    uint256 totalPool;
    uint256 totalParticipants;
    uint256 totalComments;
}

enum ProjectStatus {
    Pending,
    Active,
    Paused,
    Ended
}
```

### 2. 评论系统合约 (CommentSystem.sol)

**功能职责**:
- 评论发布和管理
- 评论Token发放
- 评论验证和审核

**主要功能**:
```solidity
// 发布评论
function postComment(
    uint256 projectId,
    string memory content,
    bytes32 contentHash
) external returns (uint256 commentId);

// 获取评论
function getComment(uint256 commentId) external view returns (Comment memory);

// 获取项目评论列表
function getProjectComments(
    uint256 projectId,
    uint256 offset,
    uint256 limit
) external view returns (Comment[] memory);

// 验证持币资格
function verifyTokenHolding(address user, uint256 projectId) external view returns (bool);
```

**数据结构**:
```solidity
struct Comment {
    uint256 id;
    uint256 projectId;
    address author;
    string content;
    bytes32 contentHash;
    uint256 timestamp;
    uint256 likes;
    uint256 dislikes;
    uint256 tokenReward;
    bool isElite;
    CommentStatus status;
}

enum CommentStatus {
    Active,
    Hidden,
    Deleted
}
```

### 3. 点赞系统合约 (LikeSystem.sol)

**功能职责**:
- 点赞/踩操作
- 点赞Token发放
- 点赞权限验证

**主要功能**:
```solidity
// 点赞评论
function likeComment(uint256 commentId) external;

// 踩评论
function dislikeComment(uint256 commentId) external;

// 获取用户点赞记录
function getUserLikes(address user, uint256 projectId) external view returns (uint256[] memory);

// 验证点赞资格（钱包余额 >= $100）
function verifyLikeEligibility(address user) external view returns (bool);
```

**数据结构**:
```solidity
struct LikeRecord {
    address user;
    uint256 commentId;
    uint256 timestamp;
    LikeType likeType;
    uint256 tokenReward;
}

enum LikeType {
    Like,
    Dislike
}
```

### 4. 奖池管理合约 (RewardPool.sol)

**功能职责**:
- 奖池创建和管理
- 奖励分配规则
- 奖励提取功能

**主要功能**:
```solidity
// 创建奖池
function createRewardPool(
    uint256 projectId,
    uint256 totalAmount,
    uint256 duration,
    DistributionRules memory rules
) external returns (uint256 poolId);

// 添加奖池资金
function addPoolFunding(uint256 poolId, uint256 amount) external;

// 计算用户奖励
function calculateUserReward(address user, uint256 poolId) external view returns (uint256);

// 提取奖励
function claimReward(uint256 poolId) external;

// 奖池结算
function finalizePool(uint256 poolId) external;
```

**数据结构**:
```solidity
struct RewardPool {
    uint256 id;
    uint256 projectId;
    address sponsor;
    uint256 totalAmount;
    uint256 remainingAmount;
    uint256 startTime;
    uint256 endTime;
    DistributionRules rules;
    PoolStatus status;
}

struct DistributionRules {
    uint256 commentRewardPercent;      // 60%
    uint256 eliteCommentPercent;       // 25%
    uint256 likeRewardPercent;         // 15%
    uint256 earlyBonusMultiplier;      // 早期参与加权
}

enum PoolStatus {
    Active,
    Ended,
    Distributed
}
```

### 5. Token管理合约 (TokenManager.sol)

**功能职责**:
- 评论Token和点赞Token管理
- Token铸造和销毁
- Token余额查询

**主要功能**:
```solidity
// 铸造评论Token
function mintCommentTokens(address to, uint256 amount, uint256 projectId) external;

// 铸造点赞Token
function mintLikeTokens(address to, uint256 amount, uint256 projectId) external;

// 获取用户Token余额
function getUserTokenBalance(address user, uint256 projectId) external view returns (
    uint256 commentTokens,
    uint256 likeTokens
);

// Token兑换奖励
function exchangeTokensForReward(
    uint256 projectId,
    uint256 commentTokens,
    uint256 likeTokens
) external returns (uint256 rewardAmount);
```

### 6. 预言机集成合约 (PriceOracle.sol)

**功能职责**:
- 集成Chainlink价格预言机
- 实时获取代币价格
- 验证用户资产价值

**主要功能**:
```solidity
// 获取代币价格
function getTokenPrice(address tokenAddress) external view returns (uint256);

// 计算用户资产价值
function getUserAssetValue(address user) external view returns (uint256);

// 验证最低资产要求
function verifyMinimumAssetValue(address user, uint256 minimumUSD) external view returns (bool);

// 更新价格数据源
function updatePriceFeed(address token, address priceFeed) external;
```

### 7. 访问控制合约 (AccessControl.sol)

**功能职责**:
- 角色权限管理
- 多重签名管理
- 紧急暂停功能

**主要功能**:
```solidity
// 角色管理
function grantRole(bytes32 role, address account) external;
function revokeRole(bytes32 role, address account) external;

// 紧急暂停
function pause() external;
function unpause() external;

// 多签管理
function submitTransaction(address to, uint256 value, bytes memory data) external;
function confirmTransaction(uint256 txIndex) external;
function executeTransaction(uint256 txIndex) external;
```

## 安全考虑

### 1. 防刷机制
- **持币验证**: 评论需持有对应项目代币
- **资产门槛**: 点赞需钱包资产 ≥ $100 USDC
- **时间限制**: 防止同一用户短时间内重复操作
- **内容哈希**: 防止重复内容和垃圾评论

### 2. 经济模型安全
- **通胀控制**: Token发放有上限和衰减机制
- **奖池保护**: 多重签名和时间锁保护大额资金
- **价格操控**: 使用多个价格数据源进行验证

### 3. 合约安全
- **重入攻击**: 使用 ReentrancyGuard
- **整数溢出**: 使用 SafeMath 或 Solidity 0.8+
- **权限控制**: 基于角色的访问控制
- **升级机制**: 使用代理模式支持合约升级

## 部署计划

### 1. 测试阶段
- **单元测试**: 每个合约的独立功能测试
- **集成测试**: 合约间交互测试
- **压力测试**: 高并发场景测试
- **安全审计**: 专业安全公司审计

### 2. 部署顺序
1. AccessControl 合约
2. PriceOracle 合约
3. TokenManager 合约
4. ProjectManager 合约
5. CommentSystem 合约
6. LikeSystem 合约
7. RewardPool 合约

### 3. 部署网络
- **测试网**: Goerli, Mumbai, BSC Testnet
- **主网**: Ethereum, Polygon, BSC, Arbitrum

## 开发规范

### 1. 代码规范
- 遵循 Solidity Style Guide
- 使用 Natspec 注释规范
- 统一的错误处理机制
- 完整的事件记录

### 2. 测试规范
- 100% 代码覆盖率
- 边界条件测试
- 失败场景测试
- Gas 消耗优化

### 3. 文档规范
- 详细的 API 文档
- 部署和使用指南
- 故障排除文档
- 升级指南

## 监控和维护

### 1. 监控指标
- 合约调用频率
- Gas 消耗统计
- 错误率监控
- 用户活跃度

### 2. 应急响应
- 紧急暂停机制
- 资金提取限制
- 问题修复流程
- 用户通知机制

## 开发里程碑

### Phase 1: 核心合约开发 (2周)
- [ ] ProjectManager 合约
- [ ] CommentSystem 合约
- [ ] LikeSystem 合约
- [ ] 基础测试用例

### Phase 2: 代币和奖励系统 (2周)
- [ ] TokenManager 合约
- [ ] RewardPool 合约
- [ ] 奖励分配算法
- [ ] 集成测试

### Phase 3: 预言机和安全 (1周)
- [ ] PriceOracle 合约
- [ ] AccessControl 合约
- [ ] 安全测试
- [ ] Gas 优化

### Phase 4: 部署和上线 (1周)
- [ ] 测试网部署
- [ ] 安全审计
- [ ] 主网部署
- [ ] 监控系统

## 技术栈总结

- **智能合约**: Solidity ^0.8.19
- **开发框架**: Foundry
- **测试网络**: Anvil
- **预言机**: Chainlink
- **安全库**: OpenZeppelin
- **多签钱包**: Gnosis Safe
- **监控**: Tenderly, Etherscan
- **部署**: Forge Scripts

通过以上架构设计，CoinReal 后端将提供安全、高效、可扩展的去中心化评论奖励系统。
