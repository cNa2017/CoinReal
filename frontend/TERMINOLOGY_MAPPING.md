# CoinReal Frontend 术语映射文档

## 概述
本文档描述了 CoinReal Frontend 和 Backend 合约之间的术语映射关系，以确保前后端数据交互的一致性。

## 🔗 核心映射关系

### 1. 项目 (Project) 相关

| Frontend 字段 | Backend 合约字段 | 类型 | 说明 |
|--------------|-----------------|------|------|
| `projectAddress` | `projectAddress` | string | 合约地址作为唯一标识 |
| `name` | `name()` | string | 项目名称 |
| `symbol` | `symbol()` | string | 项目代币符号 |
| `description` | `description()` | string | 项目描述 |
| `category` | `category()` | string | 项目分类 |
| `poolValueUSD` | `currentPoolUSD` | number | 奖池价值（美分），前端显示需除以100 |
| `nextDrawTime` | `nextDrawTime` | number | 下次开奖时间（Unix时间戳） |
| `totalParticipants` | `getProjectStats().totalParticipants` | number | 参与人数 |
| `totalComments` | `totalComments()` | number | 评论总数 |
| `totalLikes` | `getProjectStats().totalLikes` | number | 点赞总数 |
| `lastActivityTime` | `getProjectStats().lastActivityTime` | number | 最后活动时间 |
| `isActive` | `isActive()` | boolean | 项目是否活跃 |
| `creator` | `creator()` | string | 项目创建者地址 |

**前端特有字段（非链上数据）：**
- `website` - 项目官网，暂时为空
- `whitepaper` - 白皮书链接，暂时为空  
- `colorIndex` - 颜色索引，用于UI展示
- `status` - 基于 `isActive` 和 `nextDrawTime` 计算的状态

### 2. 用户 (User) 相关

| Frontend 字段 | Backend 合约字段 | 类型 | 说明 |
|--------------|-----------------|------|------|
| `address` | 合约调用者地址 | string | 钱包地址作为唯一标识 |
| `totalRewards` | `claimedRewards` | string | 已领取奖励（显示格式） |
| `commentTokens` | - | number | CRT Token - 评论获得的部分 |
| `likeTokens` | - | number | CRT Token - 点赞获得的部分 |
| `totalCRT` | `UserStats.totalCRT` | number | 总CRT数量 |
| `totalComments` | `UserStats.totalComments` | number | 总评论数 |
| `totalLikes` | `UserStats.totalLikes` | number | 总点赞数 |

**前端特有字段（非链上数据）：**
- `username` - 用户名，默认使用缩短的地址
- `avatar` - 头像，自动生成
- `joinDate` - 加入日期，前端记录
- `status` - 用户状态：
  - `"Verified"` - 平台认证（合约未实现）
  - `"Elite"` - 精英用户（从 `getEliteComments` 获取）
  - `"Active"` - 普通活跃用户
- `badge` - 用户徽章，前端展示用

### 3. 评论 (Comment) 相关

| Frontend 字段 | Backend 合约字段 | 类型 | 说明 |
|--------------|-----------------|------|------|
| `id` | `Comment.id` | number | 评论ID |
| `author` | `Comment.author` | string | 作者钱包地址 |
| `content` | `Comment.content` | string | 评论内容 |
| `likes` | `Comment.likes` | number | 点赞数 |
| `timestamp` | `Comment.timestamp` | number | 评论时间（Unix时间戳） |
| `crtReward` | `Comment.crtReward` | number | CRT Token奖励 |
| `isElite` | `Comment.isElite` | boolean | 是否为精英评论 |

**前端特有字段（非链上数据）：**
- `avatar` - 评论者头像，自动生成
- `verified` - 平台认证状态（暂未实现）
- `dislikes` - 踩的数量，保留mock数据（暂不实现）

## 🔄 数据转换工具

### 转换函数位置
所有数据转换函数位于 `frontend/utils/contract-helpers.ts`

### 主要转换函数

1. **时间转换**
   - `formatTimeLeft(nextDrawTime)` - Unix时间戳转剩余时间
   - `formatTimestamp(timestamp)` - Unix时间戳转相对时间

2. **金额转换**
   - `formatPoolValue(poolValueUSD)` - 美分转美元显示
   - `formatCRTAmount(amount)` - CRT数量格式化

3. **UI辅助**
   - `getProjectColor(projectAddress)` - 根据地址生成颜色
   - `generateDefaultAvatar(address)` - 生成默认头像
   - `shortenAddress(address)` - 缩短地址显示

4. **状态计算**
   - `calculateProjectStatus(isActive, nextDrawTime)` - 计算项目状态
   - `checkIsEliteUser(userStats)` - 判断精英用户

5. **数据准备**
   - `prepareProjectForDisplay(contractProject)` - 准备项目显示数据
   - `prepareCommentForDisplay(contractComment)` - 准备评论显示数据
   - `prepareUserForDisplay(contractUser)` - 准备用户显示数据

## 🎨 UI 相关配置

### 颜色配置
位于 `frontend/types/index.ts` 中的 `PROJECT_COLORS` 数组：
```typescript
export const PROJECT_COLORS = [
  "from-orange-500 to-yellow-500",    // Bitcoin风格
  "from-blue-500 to-purple-500",      // Ethereum风格
  "from-purple-500 to-pink-500",      // Solana风格
  // ... 共10种颜色
]
```

### 路由映射
- 项目详情页：`/projects/[projectAddress]`
- 用户页面：使用钱包地址标识
- API调用：使用 `projectAddress` 而不是简单ID

## 📋 开发注意事项

### 必须遵循的原则

1. **唯一标识符**
   - 项目：使用 `projectAddress`（合约地址）
   - 用户：使用 `address`（钱包地址）
   - 评论：使用 `id`（数字ID）

2. **数据类型**
   - 时间：统一使用 Unix 时间戳（number）
   - 金额：合约返回美分（number），前端显示美元
   - 地址：统一使用完整的42位16进制地址

3. **前端特有字段**
   - 所有UI展示相关字段（如颜色、头像、用户名）都是前端生成
   - 如果合约未返回字段，使用默认值

4. **状态管理**
   - `verified` 状态：平台认证，合约暂未实现
   - `isElite` 状态：从合约 `getEliteComments` 获取
   - `status` 状态：基于合约数据计算

### 待实现功能

1. **平台认证系统** - `verified` 字段对应的合约功能
2. **踩功能** - `dislikes` 相关的合约实现
3. **网站和白皮书** - 是否需要存储在链上待确认

## 🔧 使用示例

```typescript
// 获取项目数据并转换为前端格式
const contractProject = await contract.getProject(projectAddress)
const displayProject = prepareProjectForDisplay(contractProject)

// 使用转换后的数据
console.log(displayProject.timeLeft) // "5 days"
console.log(displayProject.pool) // "$45,230"
console.log(displayProject.status) // "Active"
```

---

**更新日期：** 2024年1月
**维护者：** CoinReal 开发团队 