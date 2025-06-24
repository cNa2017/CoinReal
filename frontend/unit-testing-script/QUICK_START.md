# 🚀 快速开始指南

## 1. 环境准备

### 确保Anvil正在运行
```bash
# 在后端目录启动Anvil
cd background
anvil
```

### 创建环境配置
```bash
cd frontend

# 创建.env文件
echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > .env
echo "RPC_URL=http://127.0.0.1:8545" >> .env
```

## 2. 安装依赖

```bash
# 在frontend根目录安装依赖
cd frontend
npm install
```

## 3. 运行测试

### 🎯 快速演示 (推荐)
```bash
npm run test:demo
```

### 📊 查看平台统计
```bash
npm run test:platform
```

### 📝 查看项目详情
```bash
# 查看所有项目
npm run test:project

# 查看指定项目
npm run test:project btc
```

### 🎪 查看Campaign状态
```bash
npm run test:campaign
```

## 4. 预期输出

运行演示脚本后，您应该看到类似以下的输出：

```
🚀 CoinReal 合约状态演示
══════════════════════════════════════════════════

📊 1. 平台统计信息
──────────────────────────────
🏗️  总项目数: 9
👥 总用户数: 0
💬 总评论数: 0
💰 总奖池价值: $0

📋 2. 项目列表
──────────────────────────────
找到 5 个项目:
1. Bitcoin (BTC)
   📍 地址: 0xd8058efe0198ae9dd7d563e1b4938dcbc86a1f81
   🏷️  分类: Layer1

2. Ethereum (ETH)
   📍 地址: 0x6d544390eb535d61e196c87d6b9c80dcd8628acd
   🏷️  分类: Layer1
...

✅ 演示完成!
```

## 5. 故障排除

### ❌ 网络连接失败
```bash
# 检查Anvil是否运行
curl http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" --data '{"method":"web3_clientVersion","params":[],"id":67,"jsonrpc":"2.0"}'
```

### ❌ 合约地址错误
检查 `../public/deployments.json` 文件是否存在且包含正确的合约地址。

### ❌ ABI文件缺失
确保 `../public/abi-json/` 目录包含所有合约的ABI文件。

## 6. 高级用法

### 查看特定用户活动
```bash
# 使用示例用户地址
npm run test:project 0xd8058efe0198ae9dd7d563e1b4938dcbc86a1f81 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
```

### 直接运行TypeScript文件
```bash
# 在frontend根目录运行
cd frontend
npx tsx unit-testing-script/demo.ts
npx tsx unit-testing-script/platform-stats.ts
```

---

💡 **提示**: 如果遇到问题，请查看完整的 [README.md](./README.md) 文档获取详细说明。 