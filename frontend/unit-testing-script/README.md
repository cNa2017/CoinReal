# CoinReal 单元测试脚本

这个目录包含了使用 viem 编写的单元测试脚本，用于查看和测试 CoinReal 平台各个合约的状态。

## 📋 功能概述

### 1. 平台统计 (`platform-stats.ts`)
- 查看平台总体统计信息
- 显示项目列表和基本信息
- 查看项目排行榜

### 2. 项目详情 (`project-details.ts`)
- 查看项目详细信息和统计
- 显示项目评论列表
- 查看用户在项目中的活动
- 查看用户CRT奖励详情

### 3. Campaign状态 (`campaign-status.ts`)
- 查看Campaign基本信息和状态
- 显示奖励分配比例
- 查看用户在Campaign中的奖励

## 🚀 使用方法

### 环境准备

1. **创建环境配置文件**（在frontend根目录）
```bash
cd frontend
cp .env.example .env
```

2. **编辑 `.env` 文件**
```bash
# 私钥配置（用于测试脚本）
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# RPC URL
RPC_URL=http://127.0.0.1:8545
```

3. **安装依赖**（在frontend根目录）
```bash
cd frontend
pnpm install
```

### 运行脚本

#### 1. 查看平台统计
```bash
pnpm run test:platform
```

#### 2. 查看项目详情
```bash
# 查看所有项目
pnpm run test:project

# 查看指定项目 (使用项目key，如: btc, eth, sol)
pnpm run test:project btc

# 查看用户活动
pnpm run test:project <项目地址> <用户地址>
```

#### 3. 查看Campaign状态
```bash
# 查看所有Campaign
pnpm run test:campaign

# 查看指定Campaign
pnpm run test:campaign <Campaign地址>

# 查看用户奖励
pnpm run test:campaign <Campaign地址> <用户地址>
```

#### 4. 运行所有测试
```bash
pnpm run test:all
```

### 直接运行 TypeScript 文件
```bash
# 在frontend根目录运行
cd frontend
pnpm exec tsx unit-testing-script/platform-stats.ts
pnpm exec tsx unit-testing-script/project-details.ts btc
pnpm exec tsx unit-testing-script/campaign-status.ts
```

## 📁 文件说明

```
frontend/
├── package.json           # 共享依赖配置
├── tsconfig.json          # 共享TypeScript配置
├── .env                   # 环境变量配置
└── unit-testing-script/
    ├── config.ts          # 配置文件（网络、私钥、ABI加载）
    ├── platform-stats.ts  # 平台统计脚本
    ├── project-details.ts # 项目详情脚本
    ├── campaign-status.ts # Campaign状态脚本
    ├── demo.ts            # 演示脚本
    └── README.md          # 使用说明
```

## 🔧 配置说明

### 网络配置
- 默认连接到本地 Anvil 网络 (`http://127.0.0.1:8545`)
- 使用 Anvil 默认账户私钥进行测试
- 通过环境变量 `PRIVATE_KEY` 和 `RPC_URL` 可自定义配置

### 合约地址
- 自动从 `public/deployments.json` 读取部署的合约地址
- 支持查看部署信息中的所有项目和Campaign

### ABI文件
- 自动从 `public/abi-json/` 目录加载合约ABI
- 支持所有主要合约：Platform、Project、Campaign等

### 共享工程化
- 使用frontend项目的共享依赖和TypeScript配置
- 无需重复安装viem等依赖包
- 统一的代码风格和构建环境

## 📊 输出示例

### 平台统计输出
```
🔧 测试配置:
📍 网络: Anvil
🔗 RPC: http://127.0.0.1:8545
👤 账户: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

📊 === 平台统计信息 ===
🏗️  总项目数: 9
👥 总用户数: 0
💬 总评论数: 0
💰 总奖池价值: $0

📋 项目列表 (前10个):
1. Bitcoin (BTC)
   地址: 0xd8058efe0198ae9dd7d563e1b4938dcbc86a1f81
   分类: Layer1
   描述: 第一个去中心化数字货币...
```

### 项目详情输出
```
📝 === 项目详情和评论 ===

🎯 项目: Bitcoin (BTC)
📍 地址: 0xd8058efe0198ae9dd7d563e1b4938dcbc86a1f81
👥 参与人数: 0
👍 总点赞数: 0
⏰ 最后活动时间: 1970-1-1 08:00:00
💰 当前奖池USD: $0
🎪 关联Campaign数量: 0

💬 评论列表 (前10条):
   暂无评论
```

## ⚠️  注意事项

1. **网络连接**：确保 Anvil 本地网络正在运行
2. **合约部署**：确保合约已正确部署并且 `deployments.json` 文件存在
3. **私钥安全**：不要在生产环境中使用测试私钥
4. **错误处理**：脚本包含错误处理，会显示具体的错误信息

## 🔍 故障排除

### 常见问题

1. **连接失败**
   - 检查 Anvil 是否正在运行
   - 确认 RPC URL 配置正确

2. **合约调用失败**
   - 检查合约是否正确部署
   - 确认 ABI 文件是否存在

3. **TypeScript 错误**
   - 确保安装了所有依赖
   - 检查 tsconfig.json 配置

### 调试模式
在脚本中添加更多日志输出：
```typescript
console.log('调试信息:', { address, abi, functionName, args })
``` 