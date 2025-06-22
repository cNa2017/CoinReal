# CoinReal Web 项目接口文档

币圈大众点评 Web 应用的 API 接口规范说明

## 🔧 技术栈

- **数据管理**: TanStack Query (React Query)
- **类型定义**: TypeScript
- **状态管理**: React Hooks
- **模拟数据**: Mock API

## 📋 接口概览

本项目目前使用 Mock API 实现，所有接口返回模拟数据。在生产环境中，这些接口将替换为真实的后端 API 调用。

## 🚀 项目相关接口

### 1. 获取项目列表

**接口名称**: `getProjects`  
**用途**: 获取所有加密货币项目的列表信息  
**HTTP 方法**: `GET`  
**路径**: `/api/projects`  

**请求参数**: 无

**返回数据类型**: `Promise<Project[]>`

**返回数据结构**:
```typescript
interface Project {
  id: string              // 项目唯一标识
  name: string            // 项目名称
  symbol: string          // 代币符号 (如: BTC, ETH)
  description: string     // 项目描述
  color: string           // 项目主题色
  pool: string            // 奖池金额 (如: "$45,230")
  timeLeft: string        // 剩余时间 (如: "5 days 12h")
  participants: number    // 参与人数
  comments: number        // 评论数量
  likes: number           // 点赞总数
  website: string         // 官方网站
  whitepaper: string      // 白皮书链接
  status: "Active" | "New" | "Paused" | "Ended" // 项目状态
  category: string        // 项目分类 (如: DeFi, NFT, GameFi)
  tvl?: string           // 总锁仓价值 (可选)
  change24h?: number     // 24小时变化率% (可选)
  rank?: number          // 排名 (可选)
}
```

**React Hook 调用**:
```typescript
const { data: projects, isLoading, error } = useProjects()
```

---

### 2. 获取单个项目详情

**接口名称**: `getProject`  
**用途**: 根据项目ID获取特定项目的详细信息  
**HTTP 方法**: `GET`  
**路径**: `/api/projects/{id}`  

**请求参数**:
- `id` (string): 项目唯一标识

**返回数据类型**: `Promise<Project | null>`

**返回数据结构**: 同上 `Project` 接口，如果项目不存在返回 `null`

**React Hook 调用**:
```typescript
const { data: project, isLoading, error } = useProject(projectId)
```

---

## 💬 评论相关接口

### 3. 获取项目评论列表

**接口名称**: `getProjectComments`  
**用途**: 获取指定项目的所有评论  
**HTTP 方法**: `GET`  
**路径**: `/api/projects/{projectId}/comments`  

**请求参数**:
- `projectId` (string): 项目ID

**返回数据类型**: `Promise<Comment[]>`

**返回数据结构**:
```typescript
interface Comment {
  id: number              // 评论唯一标识
  author: string          // 评论者昵称
  avatar: string          // 评论者头像URL
  content: string         // 评论内容
  likes: number           // 点赞数
  dislikes: number        // 踩数
  timestamp: string       // 发布时间
  verified: boolean       // 是否认证用户
  tokens: number          // 获得的Token数量
  projectId: string       // 所属项目ID
}
```

**React Hook 调用**:
```typescript
const { data: comments, isLoading, error } = useProjectComments(projectId)
```

---

### 4. 发表评论

**接口名称**: `postComment`  
**用途**: 在指定项目下发表新评论  
**HTTP 方法**: `POST`  
**路径**: `/api/projects/{projectId}/comments`  

**请求参数**:
- `projectId` (string): 项目ID
- `content` (string): 评论内容

**请求体结构**:
```json
{
  "content": "这是一条评论内容"
}
```

**返回数据类型**: `Promise<Comment>`

**返回数据结构**: 新创建的评论对象 (同上 `Comment` 接口)

**业务规则**:
- 评论者必须持有对应项目的代币
- 评论长度限制: 10-500字符
- 每条评论自动获得5个评论Token
- 系统自动生成用户ID和时间戳

**React Hook 调用**:
```typescript
const postCommentMutation = usePostComment()

// 发表评论
postCommentMutation.mutate({
  projectId: 'bitcoin',
  content: '这是我的评论内容'
})
```

---

### 5. 点赞评论

**接口名称**: `likeComment`  
**用途**: 对指定评论进行点赞  
**HTTP 方法**: `POST`  
**路径**: `/api/comments/{commentId}/like`  

**请求参数**:
- `commentId` (number): 评论ID

**返回数据类型**: `Promise<void>`

**返回数据结构**: 无返回数据，成功时返回空

**业务规则**:
- 点赞者钱包资产需≥$100 USDC等值
- 每次点赞获得点赞Token
- 被点赞的评论会增加点赞数

**React Hook 调用**:
```typescript
const likeCommentMutation = useLikeComment()

// 点赞评论
likeCommentMutation.mutate(commentId)
```

---

## 👤 用户相关接口

### 6. 获取用户信息

**接口名称**: `getUser`  
**用途**: 获取当前登录用户的个人信息  
**HTTP 方法**: `GET`  
**路径**: `/api/user/profile`  

**请求参数**: 无 (通过认证token识别用户)

**返回数据类型**: `Promise<User>`

**返回数据结构**:
```typescript
interface User {
  id: string                    // 用户ID
  name: string                  // 用户昵称
  avatar: string                // 头像URL
  walletAddress: string         // 钱包地址
  totalRewards: string          // 累计获得奖励金额
  commentTokens: number         // 评论Token数量
  likeTokens: number           // 点赞Token数量
  totalComments: number        // 累计评论数
  totalLikes: number           // 累计获得点赞数
  joinDate: string             // 加入日期
  status: "Active" | "Verified" | "Elite"  // 用户状态
  badge?: string               // 用户徽章 (可选)
  tokenBalances?: {            // 代币余额列表 (可选)
    name: string               // 代币名称
    symbol: string             // 代币符号
    amount: string             // 持有数量
    value: string              // 美元价值
    change24h: number          // 24小时涨跌幅%
  }[]
}
```

**React Hook 调用**:
```typescript
const { data: user, isLoading, error } = useUser()
```

---

### 7. 获取用户活动记录

**接口名称**: `getUserActivity`  
**用途**: 获取用户的活动历史记录  
**HTTP 方法**: `GET`  
**路径**: `/api/user/activities`  

**请求参数**: 无

**返回数据类型**: `Promise<UserActivity[]>`

**返回数据结构**:
```typescript
interface UserActivity {
  id: number                   // 活动记录ID
  type: "comment" | "like" | "reward" | "achievement"  // 活动类型
  action: string               // 活动描述
  target: string               // 活动目标 (项目名称等)
  reward: string               // 获得奖励 (如: "+15 CRT")
  timestamp: string            // 活动时间
  description: string          // 详细描述
}
```

**活动类型说明**:
- `comment`: 发表评论
- `like`: 点赞相关 (给出点赞或收到点赞)
- `reward`: 系统奖励 (签到奖励、周活跃奖励等)
- `achievement`: 成就解锁 (里程碑奖励)

**React Hook 调用**:
```typescript
const { data: activities, isLoading, error } = useUserActivity()
```

---

## 🏆 排行榜接口

### 8. 获取排行榜

**接口名称**: `getLeaderboard`  
**用途**: 获取项目参与度排行榜  
**HTTP 方法**: `GET`  
**路径**: `/api/leaderboard`  

**请求参数**: 无

**返回数据类型**: `Promise<Project[]>`

**返回数据结构**: 按参与人数降序排列的项目列表 (同 `Project` 接口)

**排序规则**: 按 `participants` 字段降序排列

**React Hook 调用**:
```typescript
const { data: leaderboard, isLoading, error } = useLeaderboard()
```

---

## 🔄 数据流转和缓存

### React Query 配置

项目使用 TanStack Query 进行数据管理，具有以下特性：

**查询键 (Query Keys)**:
- `['projects']` - 项目列表
- `['project', id]` - 单个项目详情
- `['project-comments', projectId]` - 项目评论列表
- `['user']` - 用户信息
- `['user-activity']` - 用户活动记录
- `['leaderboard']` - 排行榜

**缓存策略**:
- 查询数据自动缓存，避免重复请求
- 变更操作后自动刷新相关缓存
- 页面切换时保持数据状态

**自动刷新机制**:
- 发表评论后自动刷新评论列表
- 点赞后自动刷新评论数据
- 支持乐观更新提升用户体验

---

## 🛡️ 错误处理

### 通用错误响应格式

```typescript
interface ApiResponse<T> {
  data: T                      // 响应数据
  message?: string             // 错误消息 (可选)
  success: boolean             // 请求是否成功
}
```

### 常见错误类型

1. **网络错误**: 请求超时或网络不可达
2. **权限错误**: 未连接钱包或资产不足
3. **参数错误**: 缺少必需参数或参数格式错误
4. **业务错误**: 不满足业务规则 (如持币门槛)

### 错误处理示例

```typescript
const { data, error, isError } = useProjects()

if (isError) {
  console.error('获取项目列表失败:', error)
}
```

---

## 🔗 Web3 集成

### 钱包连接状态

```typescript
interface WalletState {
  isConnected: boolean         // 是否已连接
  isConnecting: boolean        // 是否连接中
  address?: string             // 钱包地址
  chainId?: number            // 链ID
  balance?: string            // 余额
}
```

### 支持的区块链网络

```typescript
interface SupportedChain {
  id: number                   // 链ID
  name: string                 // 网络名称
  symbol: string               // 原生代币符号
  color: string                // 主题色
  rpcUrl?: string             // RPC端点 (可选)
  blockExplorer?: string      // 区块浏览器 (可选)
}
```

**当前支持的网络**:
- Ethereum 主网 (Chain ID: 1)
- Polygon (Chain ID: 137)
- BSC (Chain ID: 56)
- Arbitrum (Chain ID: 42161)
- Anvil 本地网络 (Chain ID: 31337)

---

## 📝 使用示例

### 完整的项目详情页实现

```typescript
function ProjectDetailPage({ projectId }: { projectId: string }) {
  // 获取项目信息
  const { data: project, isLoading: projectLoading } = useProject(projectId)
  
  // 获取评论列表
  const { data: comments, isLoading: commentsLoading } = useProjectComments(projectId)
  
  // 发表评论
  const postComment = usePostComment()
  
  // 点赞评论
  const likeComment = useLikeComment()
  
  const handleSubmitComment = (content: string) => {
    postComment.mutate({ projectId, content })
  }
  
  const handleLikeComment = (commentId: number) => {
    likeComment.mutate(commentId)
  }
  
  if (projectLoading || commentsLoading) {
    return <div>加载中...</div>
  }
  
  return (
    <div>
      <ProjectInfo project={project} />
      <CommentSection 
        comments={comments}
        onSubmitComment={handleSubmitComment}
        onLikeComment={handleLikeComment}
      />
    </div>
  )
}
```

---

## 🔮 未来扩展

### 计划中的接口

1. **项目创建接口**: 项目方创建新项目
2. **奖池管理接口**: 添加/提取奖池资金
3. **统计分析接口**: 项目数据分析和图表
4. **通知系统接口**: 实时消息推送
5. **搜索接口**: 项目和评论搜索
6. **用户关注接口**: 关注项目和用户

### 实时功能

- WebSocket 连接用于实时评论更新
- 奖池金额实时变化通知
- 开奖结果实时推送

---

## 📚 相关文档

- [项目技术架构](../README.md)
- [组件使用指南](../components/README.md)
- [部署说明](../docs/deployment.md)

---

*最后更新时间: 2024年12月*
