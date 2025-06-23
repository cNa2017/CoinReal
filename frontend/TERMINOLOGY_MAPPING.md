# CoinReal Frontend 术语映射文档

## 概述
本文档描述了 CoinReal Frontend 和 Backend Campaign系统之间的术语映射关系，以确保前后端数据交互的一致性。

## 🔗 核心映射关系

### 1. 项目 (Project) 相关

| Frontend 字段 | Backend 合约字段 | 类型 | 说明 |
|--------------|-----------------|------|------|
| `projectAddress` | `projectAddress` | string | 合约地址作为唯一标识 |
| `name` | `name()` | string | 项目名称 |
| `symbol` | `symbol()` | string | 项目代币符号 |
| `description` | `description()` | string | 项目描述 |
| `category` | `category()` | string | 项目分类 |
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
- `status` - 基于 `isActive` 计算的状态

**已移除字段（Campaign系统替代）：**
- `poolValueUSD` - 由各Campaign的奖池价值替代
- `nextDrawTime` - 由Campaign的结束时间替代

### 2. 用户 (User) 相关

| Frontend 字段 | Backend 合约字段 | 类型 | 说明 |
|--------------|-----------------|------|------|
| `address` | 合约调用者地址 | string | 钱包地址作为唯一标识 |
| `totalRewards` | 聚合所有Campaign的已领取奖励 | string | 已领取奖励总额（显示格式） |
| `commentTokens` | 聚合所有Campaign的评论CRT | number | CRT Token - 评论获得的部分 |
| `likeTokens` | 聚合所有Campaign的点赞CRT | number | CRT Token - 点赞获得的部分 |
| `totalCRT` | 聚合所有Campaign的CRT余额 | number | 总CRT数量 |
| `totalComments` | 聚合所有项目的评论数 | number | 总评论数 |
| `totalLikes` | 聚合所有项目的点赞数 | number | 总点赞数 |

**前端特有字段（非链上数据）：**
- `username` - 用户名，默认使用缩短的地址
- `avatar` - 头像，自动生成
- `joinDate` - 加入日期，前端记录
- `status` - 用户状态：
  - `"Verified"` - 平台认证（合约未实现）
  - `"Elite"` - 精英用户（基于CRT数量判断）
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
| `crtReward` | `Comment.crtReward` | number | CRT Token奖励（已废弃，显示为0） |
| `isElite` | `Comment.isElite` | boolean | 是否为精英评论（由Campaign决定） |

**前端特有字段（非链上数据）：**
- `avatar` - 评论者头像，自动生成
- `verified` - 平台认证状态（暂未实现）
- `dislikes` - 踩的数量，保留mock数据（暂不实现）

**Campaign系统说明：**
- 评论的实际CRT奖励由Campaign系统管理，不再存储在Comment结构中
- 用户的CRT余额需要通过 `getUserCampaignCRTDetails` 获取
- 精英评论由Campaign结束时根据获得CRT数量确定

### 4. Campaign 相关

| Frontend 字段 | Backend 合约字段 | 类型 | 说明 |
|--------------|-----------------|------|------|
| `address` | Campaign合约地址 | string | Campaign合约地址作为唯一标识 |
| `projectAddress` | `projectAddress()` | string | 关联的项目地址 |
| `sponsor` | `sponsor()` | string | 赞助者地址 |
| `sponsorName` | `sponsorName()` | string | 赞助者名称 |
| `startTime` | `startTime()` | number | 开始时间戳 |
| `endTime` | `endTime()` | number | 结束时间戳 |
| `isActive` | `isCurrentlyActive()` | boolean | 是否活跃 |
| `rewardsDistributed` | `rewardsDistributed()` | boolean | 奖励是否已分配 |
| `rewardToken` | `rewardToken()` | string | 奖励代币地址 |
| `totalRewardPool` | `totalRewardPool()` | number | 总奖池金额（wei格式） |
| `totalComments` | `totalComments()` | number | 活动期间评论数 |
| `totalLikes` | `totalLikes()` | number | 活动期间点赞数 |
| `totalParticipants` | `participants.length` | number | 参与者数量 |
| `name` | `name()` | string | CRT代币名称 |
| `symbol` | `symbol()` | string | CRT代币符号（固定为"CRT"） |
| `totalSupply` | `totalSupply()` | number | 总CRT发行量（已转换为整数） |

**前端特有字段（非链上数据）：**
- `remainingTime` - 剩余时间（秒），根据endTime计算
- `poolValueUSD` - 奖池USD价值，通过价格预言机计算
- `tokenIcon` - 奖励代币图标，前端展示用

### 5. 用户Campaign CRT详情

| Frontend 字段 | Backend 合约字段 | 类型 | 说明 |
|--------------|-----------------|------|------|
| `campaignAddress` | Campaign合约地址 | string | Campaign地址 |
| `commentCRT` | `commentCRT[user]` | number | 评论获得的CRT（已转换为整数） |
| `likeCRT` | `likeCRT[user]` | number | 点赞获得的CRT（已转换为整数） |
| `totalCRT` | `balanceOf(user)` | number | 总CRT余额（已转换为整数） |
| `pendingReward` | `pendingRewards[user]` | number | 待领取奖励（wei格式） |
| `crtBalance` | `balanceOf(user)` | number | CRT代币余额（已转换为整数） |

## 🔄 数据转换工具

### 转换函数位置
所有数据转换函数位于 `frontend/utils/contract-helpers.ts`

### 主要转换函数

1. **CRT精度转换**
   - `convertCRTReward(reward)` - 18位小数转整数显示
   - `convertToCRTWei(amount)` - 整数转18位小数

2. **时间转换**
   - `calculateRemainingTime(endTime)` - Unix时间戳转剩余时间
   - `formatRemainingTime(seconds)` - 剩余时间转友好显示
   - `formatTimestamp(timestamp)` - Unix时间戳转相对时间

3. **金额转换**
   - `calculatePoolValueUSD(token, amount)` - 通过价格预言机计算USD价值
   - `formatCRTAmount(amount)` - CRT数量格式化

4. **UI辅助**
   - `getProjectColor(projectAddress)` - 根据地址生成颜色
   - `generateDefaultAvatar(address)` - 生成默认头像
   - `shortenAddress(address)` - 缩短地址显示

5. **状态计算**
   - `calculateProjectStatus(isActive)` - 计算项目状态
   - `checkIsEliteUser(totalCRT)` - 判断精英用户
   - `isCampaignActive(startTime, endTime)` - 判断Campaign是否活跃

6. **数据准备**
   - `prepareProjectForDisplay(contractProject)` - 准备项目显示数据
   - `prepareCommentForDisplay(contractComment)` - 准备评论显示数据
   - `prepareUserForDisplay(contractUser)` - 准备用户显示数据
   - `prepareCampaignForDisplay(contractCampaign)` - 准备Campaign显示数据

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
   - Campaign：使用 `address`（Campaign合约地址）

2. **数据类型**
   - 时间：统一使用 Unix 时间戳（number）
   - CRT数量：合约返回18位小数（bigint），前端显示整数（number）
   - 奖励金额：合约返回wei格式（bigint），前端根据代币精度转换
   - 地址：统一使用完整的42位16进制地址

3. **前端特有字段**
   - 所有UI展示相关字段（如颜色、头像、用户名）都是前端生成
   - 如果合约未返回字段，使用默认值

4. **状态管理**
   - `verified` 状态：平台认证，合约暂未实现
   - `isElite` 状态：基于CRT数量判断或Campaign结束时确定
   - `status` 状态：基于合约数据计算

5. **Campaign系统特殊处理**
   - CRT奖励数据需要从Campaign合约获取，不再依赖Comment结构
   - 用户数据需要聚合所有参与的Campaign
   - 奖池价值需要通过价格预言机实时计算

### 待实现功能

1. **平台认证系统** - `verified` 字段对应的合约功能
2. **踩功能** - `dislikes` 相关的合约实现
3. **网站和白皮书** - 是否需要存储在链上待确认
4. **精英评论自动识别** - Campaign结束时的精英评论算法优化

## 🔧 使用示例

```typescript
// 获取项目数据并转换为前端格式
const contractProject = await contract.getProject(projectAddress)
const displayProject = prepareProjectForDisplay(contractProject)

// 获取项目的Campaign列表
const campaigns = await api.getProjectCampaigns(projectAddress)
const activeCampaigns = campaigns.filter(c => c.isActive)

// 获取用户的CRT详情
const userCRTDetails = await api.getUserCampaignCRTDetails(projectAddress, userAddress)
const totalCRT = userCRTDetails.reduce((sum, detail) => sum + detail.totalCRT, 0)

// 使用转换后的数据
console.log(displayProject.status) // "Active"
console.log(activeCampaigns.length) // 3
console.log(totalCRT) // 125 (整数显示)
```

### Campaign系统集成示例

```typescript
// 创建新Campaign
const campaignParams = {
  projectAddress: "0x...",
  sponsorName: "Alice",
  duration: 30, // 30天
  rewardToken: "0x...", // USDC地址
  rewardAmount: parseUnits("1000", 6).toString() // 1000 USDC
}

const campaignAddress = await api.createCampaign(campaignParams)

// 发表评论获得CRT奖励
await api.postComment(projectAddress, "这个项目很有潜力！")
// 自动在所有活跃Campaign中获得5个CRT

// 点赞评论获得CRT奖励  
await api.likeComment(projectAddress, commentId)
// 点赞者和被点赞者各获得1个CRT

// Campaign结束后领取奖励
await api.claimCampaignReward(campaignAddress)
// 根据CRT占比获得相应的USDC奖励
```

---

**更新日期：** 2024年1月
**维护者：** CoinReal 开发团队 