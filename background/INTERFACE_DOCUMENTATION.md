# CoinReal 平台接口文档

## 概述

CoinReal 是一个创新的去中心化内容社区平台，通过区块链技术实现"评论即收益、点赞即赚币"的商业模式。本文档详细描述了平台所有智能合约接口的设计和实现。

## 核心设计理念

### 代币经济模型
- **CRT代币**：非转让代币（Soulbound Token），代表用户贡献度
- **评论奖励**：发表评论获得5个CRT
- **点赞奖励**：点赞获得1个CRT，被点赞者获得1个CRT
- **奖池分配**：60%评论奖励 + 25%点赞奖励 + 15%精英奖励

### 技术架构
- **最小代理模式**：节省95%项目创建成本
- **模块化设计**：职责分离，便于升级维护
- **价格预言机**：支持多种代币的USD价值计算
- **批量操作**：优化Gas消耗和用户体验

---

## 1. ICoinRealPlatform - 平台主合约接口

### 职责范围
平台主合约负责整体项目管理、用户统计、排行榜功能等核心业务。

### 核心功能

#### 1.1 项目创建
```solidity
function createProject(
    string calldata name,        // 项目名称 (1-100字符)
    string calldata symbol,      // 项目符号 (1-20字符)
    string calldata description, // 项目描述 (最大1000字符)
    string calldata category,    // 项目分类 (Layer1/DeFi/NFT等)
    uint16 drawPeriod           // 开奖周期 (1-30天)
) external returns (address projectAddress);
```

**业务流程：**
1. 验证调用者权限（仅owner）
2. 通过ProjectFactory创建项目代理合约
3. 为项目设置CRT代币铸造权限
4. 注册项目到平台并分类存储
5. 触发ProjectCreated事件

#### 1.2 项目查询
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

#### 1.3 统计和排行榜
```solidity
// 平台统计数据
function getPlatformStats() external view returns (
    uint256 totalProjects,    // 总项目数
    uint256 totalUsers,       // 总用户数
    uint256 totalComments,    // 总评论数
    uint256 totalPoolValue    // 总奖池价值(USD)
);

// 项目排行榜
function getProjectLeaderboard(
    uint8 sortBy,    // 排序方式: 0-参与人数, 1-评论数, 2-奖池金额, 3-最新活动
    uint256 offset,  // 起始位置
    uint256 limit    // 返回数量
) external view returns (
    address[] memory projects,
    uint256[] memory stats
);
```

#### 1.4 批量数据获取
```solidity
function batchGetProjectsData(
    address[] calldata projectAddresses
) external view returns (ProjectDetailedData[] memory projectsData);
```

**优化目的：**
- 减少RPC调用次数
- 提升前端加载速度
- 降低Gas消耗

---

## 2. IProject - 项目合约接口

### 职责范围
管理单个项目的评论、点赞、奖池和奖励分配系统。

### 核心功能

#### 2.1 评论系统
```solidity
function postComment(string calldata content) external returns (uint256 commentId);
```

**业务规则：**
- 内容长度限制：10-1000字符
- 自动获得5个CRT基础奖励
- 评论ID自增，保证时间顺序
- 更新用户统计数据

#### 2.2 点赞系统
```solidity
function likeComment(uint256 commentId) external;
```

**业务规则：**
- 每个用户只能对同一评论点赞一次
- 点赞者获得1个CRT奖励
- 被点赞者获得1个CRT奖励
- 可能更新精英评论排名（前10名）

#### 2.3 赞助系统
```solidity
function sponsor(address token, uint256 amount) external;
```

**业务规则：**
- 最低赞助金额100 USD（通过预言机验证）
- 支持任何ERC20代币
- 记录赞助历史，更新奖池余额

#### 2.4 奖励分配
```solidity
function distributeRewards() external;
```

**分配规则：**
- **60%**：按CRT占比分配给所有参与者
- **25%**：按点赞数占比分配给点赞者  
- **15%**：平均分配给精英评论者（点赞数前10）

**触发条件：**
- 达到开奖周期时间
- 至少有1条评论和1个参与者

#### 2.5 数据查询
```solidity
// 获取评论详情
function getComment(uint256 commentId) external view returns (Comment memory);

// 分页获取评论列表
function getComments(uint256 offset, uint256 limit) external view returns (
    Comment[] memory comments,
    uint256 total
);

// 获取精英评论（点赞数前10）
function getEliteComments() external view returns (Comment[] memory);

// 获取用户统计
function getUserStats(address user) external view returns (UserStats memory);

// 获取奖池信息
function getPoolInfo() external view returns (
    Sponsorship[] memory sponsorships,
    uint256 totalUSDValue
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
    uint256 crtReward;   // 累计CRT奖励
    bool isElite;        // 是否为精英评论
    uint32 timestamp;    // 发布时间戳
}
```

#### UserStats 结构
```solidity
struct UserStats {
    uint256 totalComments;   // 总评论数
    uint256 totalLikes;      // 总点赞数
    uint256 totalCRT;        // 总CRT数量
    uint256 claimedRewards;  // 已领取奖励价值
}
```

---

## 3. IProjectFactory - 项目工厂接口

### 职责范围
使用最小代理模式（EIP-1167）创建项目合约，节省部署成本。

### 核心功能

#### 3.1 项目创建
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

#### 3.2 合约验证
```solidity
function isValidProject(address projectAddress) external view returns (bool isValid);
```

**验证内容：**
- 检查合约是否存在
- 验证字节码是否匹配最小代理模式
- 验证实现合约地址是否正确

### Gas成本对比

| 部署方式 | Gas消耗 | 成本节省 |
|---------|---------|----------|
| 标准合约部署 | ~2,000,000 | - |
| Clone模式部署 | ~50,000 | 95% |

---

## 4. IPriceOracle - 价格预言机接口

### 职责范围
提供代币USD价值查询服务，支持多代币批量查询。

### 核心功能

#### 4.1 价值计算
```solidity
function getUSDValue(address token, uint256 amount) external view returns (uint256 usdValue);
```

**计算公式：**
```
USD Value = (token_amount * token_price) / (10^token_decimals)
```

**示例：**
- 1 USDC (6 decimals) = 1,000,000
- USDC price = 100,000,000 ($1.00 with 8 decimals)
- USD Value = (1,000,000 * 100,000,000) / 10^6 = 100,000,000 ($1.00)

#### 4.2 批量查询
```solidity
function getBatchUSDValue(
    address[] calldata tokens,
    uint256[] calldata amounts
) external view returns (uint256 totalUSDValue);
```

**优化效果：**
- 避免多次外部调用的Gas开销
- 减少RPC调用次数
- 提升查询性能

#### 4.3 价格验证
```solidity
function validatePrice(address token, uint256 expectedPrice) external view returns (
    bool isValid,
    uint256 deviation
);
```

**验证规则：**
- 价格不能为0
- 不能超过历史最高价的10倍
- 不能低于历史最低价的0.1倍
- 更新时间不能超过24小时

### 价格精度标准

所有价格采用8位小数精度（类似Chainlink标准）：
- $1.00 = 100,000,000 (1 * 10^8)
- $2000.50 = 200,050,000,000 (2000.5 * 10^8)

### 支持的数据源

1. **Chainlink Price Feeds**（推荐）
2. **DEX聚合价格**（如Uniswap TWAP）
3. **中心化交易所API**（备用）
4. **手动设置**（测试环境）

---

## 5. 完整的用户交互流程

### 5.1 新用户入门流程
1. **连接钱包** → 检测资产情况
2. **选择项目** → 浏览项目列表，选择感兴趣的项目
3. **发表评论** → 获得5个CRT奖励
4. **点赞互动** → 点赞他人评论获得奖励
5. **等待开奖** → 按CRT占比分配奖池奖励

### 5.2 项目赞助流程
1. **选择代币** → 支持任何ERC20代币
2. **验证金额** → 最低100 USD等值
3. **转账赞助** → 代币转入项目合约
4. **记录历史** → 永久记录赞助信息

### 5.3 奖励分配流程
1. **触发开奖** → 到达开奖周期时间
2. **计算分配** → 按60%-25%-15%规则分配
3. **更新账户** → 用户待领取奖励更新
4. **用户领取** → 调用claimRewards领取

---

## 6. 安全机制

### 6.1 智能合约安全
- **重入攻击防护**：使用ReentrancyGuard
- **权限控制**：关键函数仅管理员可调用
- **数值溢出检查**：Solidity 0.8+内置检查
- **安全代币转账**：使用SafeERC20

### 6.2 业务逻辑安全
- **防重复点赞**：mapping记录点赞关系
- **最低赞助限制**：通过预言机验证USD价值
- **CRT代币锁定**：Soulbound Token不可转移
- **开奖条件验证**：确保有足够参与度

### 6.3 价格安全
- **多数据源验证**：支持多种价格数据源
- **异常检测**：价格偏差警告机制
- **时效性验证**：价格数据过期检查
- **紧急暂停**：异常情况下暂停服务

---

## 7. Gas优化策略

### 7.1 合约层面优化
- **最小代理模式**：节省95%部署成本
- **紧凑数据结构**：合理安排struct字段顺序
- **批量操作**：支持批量查询和批量领取
- **事件存储**：评论内容通过事件存储

### 7.2 前端优化建议
- **批量RPC调用**：使用multicall合并查询
- **数据缓存**：缓存项目基础信息
- **分页加载**：避免一次加载大量数据
- **智能加载**：根据用户行为优化数据获取

---

## 8. 扩展性设计

### 8.1 模块化架构
- **职责分离**：各合约功能明确，便于维护
- **接口抽象**：核心功能抽象为接口
- **代理模式**：支持逻辑升级（工厂合约）
- **事件驱动**：完整的事件系统

### 8.2 未来扩展方向
- **跨链支持**：多链部署和资产跨链
- **NFT奖励**：引入NFT奖励机制
- **DAO治理**：社区治理功能
- **高级分析**：数据分析和商业智能

---

## 9. 开发指南

### 9.1 本地开发环境
```bash
# 安装依赖
forge install

# 编译合约
forge build

# 运行测试
forge test

# 部署到本地网络
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast
```

### 9.2 测试覆盖率
```bash
# 生成测试覆盖率报告
forge coverage

# 查看详细报告
forge coverage --report lcov
```

### 9.3 安全审计
```bash
# 使用Slither进行静态分析
slither .

# 使用Mythril进行安全扫描
myth analyze src/
```

---

## 10. 总结

CoinReal平台通过精心设计的智能合约架构，实现了：

✅ **完整的代币经济模型** - CRT奖励机制激励用户参与  
✅ **高效的Gas优化** - 最小代理模式节省95%成本  
✅ **强大的安全机制** - 多层次安全防护  
✅ **优秀的扩展性** - 模块化设计便于升级  
✅ **流畅的用户体验** - 批量操作和优化查询  

平台为Web3内容社区提供了一个可持续、可扩展的技术基础，真正实现了"评论即收益、点赞即赚币"的愿景。 