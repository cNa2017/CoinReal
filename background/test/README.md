# CoinReal 部署测试

本目录包含针对 CoinReal 平台部署脚本的全面测试套件。

## 文件说明

- `DeployTest.t.sol` - 原始全面测试合约（正在修复中）
- `DeployScriptTest.t.sol` - 简化的Deploy脚本测试合约（推荐使用）
- `README.md` - 本说明文档

## 测试内容

### 基础部署测试
- ✅ 验证所有合约正确部署
- ✅ 验证合约地址有效性
- ✅ 验证合约间的关联配置

### 合约配置测试
- ✅ 验证Platform配置正确
- ✅ 验证ProjectFactory设置
- ✅ 验证PriceOracle配置

### Token配置测试
- ✅ 验证Mock Token参数（名称、符号、精度）
- ✅ 验证CRT Token的Soulbound特性
- ✅ 验证Token总供应量

### 价格Oracle测试
- ✅ 验证USDC价格 ($1.00)
- ✅ 验证WETH价格 ($2000.00)
- ✅ 验证DAI价格 ($1.00)

### 项目创建测试
- ✅ 验证三个示例项目创建成功
- ✅ 验证项目基本信息设置
- ✅ 验证项目在平台注册

### 赞助功能测试
- ✅ 验证初始赞助金额
- ✅ 验证用户赞助功能
- ✅ 验证赞助记录追踪

### 用户交互测试
- ✅ 评论发布功能
- ✅ 评论点赞功能
- ✅ CRT奖励机制
- ✅ 用户统计更新

### 平台功能测试
- ✅ 平台统计数据
- ✅ 项目排行榜
- ✅ 批量数据获取

## 运行测试

### 推荐使用简化测试 (DeployScriptTest)

```bash
# 运行简化测试套件
forge test --match-contract DeployScriptTest

# 运行特定测试函数
forge test --match-test test_DeployScriptCore

# 运行带详细输出的测试
forge test --match-contract DeployScriptTest -v

# 运行带极详细输出的测试
forge test --match-contract DeployScriptTest -vvv

# 运行完整工作流测试
forge test --match-test test_FullDeployWorkflow
forge test --match-test test_CompleteWorkflow -vvv
```

### 使用脚本运行测试

```bash
# 运行测试脚本
forge script test/RunTest.s.sol -vvv
```

## 测试覆盖率

运行测试覆盖率分析：

```bash
forge coverage
```

## 测试环境要求

- Foundry 安装
- Solidity ^0.8.19
- 所有依赖库已安装 (forge install)

## 测试用例详情

### test_BasicDeployment()
验证所有核心合约正确部署，包括：
- CoinRealPlatform
- CRTToken
- MockPriceOracle
- ProjectFactory
- Mock Tokens (USDC, WETH, DAI)

### test_ContractConfiguration()
验证合约间配置正确：
- Platform与PriceOracle关联
- Platform与ProjectFactory关联
- Platform与CRTToken关联

### test_TokenConfiguration()
验证Token配置：
- Mock Token基本参数
- CRT Token参数
- Token精度设置

### test_PriceOracle()
验证价格Oracle功能：
- Token价格查询
- USD价值计算
- 精度处理

### test_ProjectCreation()
验证项目创建：
- 项目合约部署
- 项目参数设置
- 项目状态管理

### test_Sponsorship()
验证赞助功能：
- 赞助记录创建
- 资金池管理
- USD价值计算

### test_CommentFunction()
验证评论系统：
- 评论发布
- CRT奖励分发
- 用户统计更新

### test_LikeFunction()
验证点赞功能：
- 点赞记录
- 重复点赞检查
- 奖励机制

### test_UserSponsorProject()
验证用户赞助：
- 用户资金转移
- 赞助记录追踪
- 最小赞助额检查

### test_CRTTokenSoulbound()
验证CRT Token的Soulbound特性：
- 转账限制
- 批准限制
- 余额查询

### test_ProjectLeaderboard()
验证排行榜功能：
- 项目排序
- 统计数据正确性
- 分页功能

### test_BatchGetProjectsData()
验证批量数据获取：
- 多项目数据查询
- 数据完整性
- 性能验证

## 故障排除

### 常见问题

1. **测试失败：地址为零**
   - 确保所有合约正确部署
   - 检查依赖关系设置

2. **Price Oracle错误**
   - 验证Token价格已设置
   - 检查Token精度配置

3. **赞助失败**
   - 确保Token余额充足
   - 检查批准额度

4. **CRT奖励问题**
   - 验证CRT Token铸造权限
   - 检查项目合约权限设置

## 扩展测试

如需添加新的测试用例，请遵循以下约定：

1. 使用 `test_` 前缀命名测试函数
2. 添加适当的断言和错误消息
3. 包含 console.log 输出用于调试
4. 更新本README文档

## 贡献

欢迎提交测试改进建议和新的测试用例！ 