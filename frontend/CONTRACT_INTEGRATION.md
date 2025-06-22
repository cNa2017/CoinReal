# CoinReal 前后端数据统一方案

## 📋 概述

本文档描述了CoinReal项目前后端数据统一的具体实现方案，解决了合约接口与前端数据格式的对接差异。

## 🔄 主要改进

### 1. 后端合约接口增强

#### 新增接口方法
```solidity
// Project.sol 新增方法
function getUserCRTBreakdown(address user) external view returns (
    uint256 commentTokens,
    uint256 likeTokens
);

function getUserDetailedActivity(address user, uint256 offset, uint256 limit) external view returns (
    Comment[] memory comments,
    Comment[] memory likedComments
);

function getPoolValueUSD() external view returns (uint256 poolValueUSD);
```

#### 平台接口增强
```solidity
// ICoinRealPlatform.sol 新增
struct UserActivity {
    uint8 activityType;
    address projectAddress;
    uint32 timestamp;
    string details;
    uint256 reward;
}

function getUserPlatformActivity(address user, uint256 offset, uint256 limit) 
    external view returns (UserActivity[] memory activities);
```

### 2. 前端数据转换层优化

#### 精度处理统一
```typescript
// 新的精度常量
export const PRECISION_CONSTANTS = {
  CRT_DECIMALS: 18,           // CRT Token精度
  USD_DECIMALS: 8,            // USD价值精度（Chainlink标准）
  ETH_DECIMALS: 18,           // ETH精度
  USDC_DECIMALS: 6,           // USDC精度
  CENTS_FACTOR: 100,          // 美分转换因子
} as const
```

#### 数据转换函数
```typescript
// 8位小数USD转美元显示
export function formatPoolValue(poolValueUSD: number): string {
  const dollars = poolValueUSD / 100000000 // 除以10^8
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars)
}

// 18位小数CRT转整数显示
export function formatCRTAmount(amount: number): string {
  const crtAmount = amount / Math.pow(10, 18)
  // 格式化逻辑...
}
```

### 3. 新的合约API层

#### ContractAPI类
```typescript
export class ContractAPI {
  // 支持分页的项目获取
  async getProjects(offset: number = 0, limit: number = 50): Promise<Project[]>
  
  // 支持CRT分组统计的用户数据
  async getUser(userAddress: string): Promise<User>
  
  // 真实的区块链交互
  async postComment(projectAddress: string, content: string): Promise<Comment>
  async likeComment(projectAddress: string, commentId: number): Promise<void>
}
```

## 📊 数据流转对比

### 之前的Mock数据流
```
Frontend Types → Mock Data → Frontend Display
```

### 现在的合约数据流
```
Contract Data → Data Converter → Frontend Types → Frontend Display
```

## 🔧 具体对接差异解决

### 1. 金额精度统一

#### 问题
- **后端**: 8位小数USD (Chainlink标准)
- **前端**: 美分整数显示

#### 解决方案
```typescript
// convertContractProjectToFrontend
poolValueUSD: Math.floor((contractData.currentPoolUSD || 0) / 1000000)
```

### 2. 字段名称映射

#### 问题
- **后端**: `currentPoolUSD`
- **前端**: `poolValueUSD`

#### 解决方案
```typescript
// 字段名映射和兼容
poolValueUSD: contractData.currentPoolUSD || contractData.poolValueUSD || 0
```

### 3. CRT Token分组统计

#### 问题
- **前端期望**: `commentTokens`, `likeTokens`
- **后端原有**: 只有 `totalCRT`

#### 解决方案
```solidity
// 新增分组统计mapping
mapping(address => uint256) public userCommentCRT;
mapping(address => uint256) public userLikeCRT;

// 新增查询接口
function getUserCRTBreakdown(address user) external view returns (
    uint256 commentTokens,
    uint256 likeTokens
);
```

### 4. 分页查询支持

#### 问题
- **前端mock**: 不支持分页
- **后端合约**: 支持分页

#### 解决方案
```typescript
// 统一的分页接口
interface PaginationParams {
  offset: number
  limit: number
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  hasMore: boolean
}
```

### 5. 用户活动历史

#### 问题
- **前端期望**: 详细的活动记录
- **后端原有**: 缺失跨项目活动汇总

#### 解决方案
```solidity
// 新增用户活动结构
struct UserActivity {
    uint8 activityType;    // 0:评论, 1:点赞, 2:赞助, 3:奖励
    address projectAddress;
    uint32 timestamp;
    string details;
    uint256 reward;
}

// 平台级活动查询
function getUserPlatformActivity(address user, uint256 offset, uint256 limit) 
    external view returns (UserActivity[] memory);
```

## 🚀 使用指南

### 1. 环境配置

在`.env.local`中配置合约地址：
```env
NEXT_PUBLIC_PLATFORM_ADDRESS=0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
NEXT_PUBLIC_CRT_TOKEN_ADDRESS=0xcafac3dd18ac6c6e92c921884f9e4176737c052c
NEXT_PUBLIC_PRICE_ORACLE_ADDRESS=0x5fbdb2315678afecb367f032d93f642f64180aa3
```

### 2. 切换到合约API

```typescript
// 原来使用mock数据
import { mockApi } from '@/lib/mock-data'

// 现在使用合约API
import { api } from '@/lib/contract-api'

// 接口保持兼容
const projects = await api.getProjects()
```

### 3. 处理精度转换

```typescript
import { 
  convertContractProjectToFrontend,
  formatPoolValue,
  formatCRTAmount 
} from '@/utils/contract-helpers'

// 自动处理精度转换
const frontendProject = convertContractProjectToFrontend(contractData)
```

## 📋 迁移检查清单

### 后端合约部署
- [ ] 部署增强的Project合约
- [ ] 部署增强的Platform合约
- [ ] 验证新增接口功能
- [ ] 测试数据精度正确性

### 前端集成
- [ ] 配置合约地址
- [ ] 集成Web3钱包连接
- [ ] 更新API调用为真实合约
- [ ] 测试数据转换正确性
- [ ] 验证用户交互功能

### 数据一致性验证
- [ ] 项目列表数据格式
- [ ] 评论系统数据流
- [ ] 用户统计准确性
- [ ] 精度转换正确性
- [ ] 分页功能正常

## 🔍 调试指南

### 1. 数据精度问题
```typescript
// 检查原始合约数据
console.log('Contract poolValueUSD:', contractData.currentPoolUSD)
console.log('Converted poolValueUSD:', Math.floor(contractData.currentPoolUSD / 1000000))

// 检查CRT精度
console.log('Contract CRT:', contractData.totalCRT)
console.log('Converted CRT:', Math.floor(contractData.totalCRT / Math.pow(10, 18)))
```

### 2. 字段映射检查
```typescript
// 验证字段映射
const mappingCheck = {
  contractField: contractData.currentPoolUSD,
  frontendField: frontendData.poolValueUSD,
  isMatched: contractData.currentPoolUSD / 1000000 === frontendData.poolValueUSD
}
console.log('Field mapping check:', mappingCheck)
```

### 3. 合约调用错误处理
```typescript
try {
  const result = await contractAPI.getProjects()
} catch (error) {
  console.error('Contract call failed:', error)
  // 降级到mock数据或显示错误
}
```

## 📈 性能优化

### 1. 批量查询优化
```typescript
// 使用批量接口减少RPC调用
const projectDetails = await platform.batchGetProjectsData(projectAddresses)
```

### 2. 数据缓存策略
```typescript
// 缓存不变数据（项目基本信息）
// 实时查询变化数据（评论、点赞）
```

### 3. 分页加载
```typescript
// 实现无限滚动
const loadMoreProjects = async () => {
  const newProjects = await api.getProjects(currentOffset, PAGE_SIZE)
  setProjects(prev => [...prev, ...newProjects])
}
```

## 🛠️ 开发工具

### 1. 类型检查
使用TypeScript严格模式确保类型安全：
```typescript
// tsconfig.json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

### 2. 数据验证
```typescript
import { z } from 'zod'

const ProjectSchema = z.object({
  projectAddress: z.string(),
  poolValueUSD: z.number(),
  // ... 其他字段
})

// 运行时验证
const validatedProject = ProjectSchema.parse(contractData)
```

## 📚 相关文档

- [INTERFACE_DOCUMENTATION.md](../background/INTERFACE_DOCUMENTATION.md) - 完整的合约接口文档
- [TERMINOLOGY_MAPPING.md](./TERMINOLOGY_MAPPING.md) - 前后端术语映射
- [Contract ABI文档] - 合约ABI和调用示例

---

**注意**: 这是一个渐进式升级方案，可以在mock数据和真实合约之间平滑切换，确保开发和测试的连续性。 