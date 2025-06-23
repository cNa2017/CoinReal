# CoinReal Campaign系统测试

本目录包含针对 CoinReal 平台Campaign系统的全面测试套件。

## 文件说明

- `CampaignSystemTest.t.sol` - Campaign系统完整测试合约（推荐使用）
- `README.md` - 本说明文档

## 测试内容

### 基础部署测试
- ✅ 验证所有合约正确部署（Platform、ProjectFactory、CampaignFactory）
- ✅ 验证合约地址有效性
- ✅ 验证合约间的关联配置

### 合约配置测试
- ✅ 验证Platform配置正确
- ✅ 验证ProjectFactory设置
- ✅ 验证CampaignFactory设置
- ✅ 验证PriceOracle配置

### Token配置测试
- ✅ 验证Mock Token参数（名称、符号、精度）
- ✅ 验证价格Oracle设置

### 项目创建测试
- ✅ 验证项目创建成功
- ✅ 验证项目基本信息设置
- ✅ 验证项目在平台注册

### Campaign创建测试
- ✅ 验证Campaign创建成功
- ✅ 验证Campaign基本信息设置
- ✅ 验证Campaign与Project关联
- ✅ 验证CRT代币命名（"项目名-Campaign编号"）
- ✅ 验证代币转移到Campaign合约

### 评论和CRT铸造测试
- ✅ 验证评论发布功能
- ✅ 验证多Campaign并行CRT铸造（每个Campaign 5 CRT）
- ✅ 验证CRT分类统计（评论CRT vs 点赞CRT）

### 点赞和CRT铸造测试
- ✅ 验证点赞功能
- ✅ 验证防重复点赞机制
- ✅ 验证点赞双方CRT奖励（各1 CRT per Campaign）
- ✅ 验证多Campaign并行奖励

### Campaign详细查询测试
- ✅ 验证用户在多Campaign中的CRT详情查询
- ✅ 验证CRT分类统计（评论/点赞/总计）
- ✅ 验证待领取奖励查询

### 奖励分配测试
- ✅ 验证Campaign结束后奖励分配
- ✅ 验证60%-25%-15%分配规则
- ✅ 验证用户奖励领取功能
- ✅ 验证权限控制（仅平台可分配）

### 空Campaign延期测试
- ✅ 验证无参与者时自动延长7天
- ✅ 验证延期后状态正确

### CRT代币特性测试
- ✅ 验证CRT代币不可转移特性（Soulbound）
- ✅ 验证transfer/approve函数revert

### 向后兼容性测试
- ✅ 验证Project合约兼容性函数不报错

## 运行测试

### 推荐使用Campaign系统测试

```bash
# 运行完整Campaign系统测试套件
forge test --match-contract CampaignSystemTest

# 运行特定测试函数
forge test --match-test test_BasicDeployment

# 运行带详细输出的测试
forge test --match-contract CampaignSystemTest -v

# 运行带极详细输出的测试
forge test --match-contract CampaignSystemTest -vvv

# 运行特定功能测试
forge test --match-test test_CommentAndCRTMinting -vvv
forge test --match-test test_LikeAndCRTMinting -vvv
forge test --match-test test_RewardDistribution -vvv
```

### 使用脚本运行测试

```bash
# 运行部署脚本测试
forge script script/Deploy.s.sol -vvv
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
- MockPriceOracle
- ProjectFactory
- CampaignFactory
- Mock Tokens (USDC, WETH)

### test_ProjectCreation()
验证项目创建：
- 项目合约部署
- 项目参数设置
- 项目状态管理

### test_CampaignCreation()
验证Campaign创建：
- Campaign合约部署
- Campaign参数设置
- Campaign与Project关联
- CRT代币命名验证

### test_CommentAndCRTMinting()
验证评论系统：
- 评论发布
- 多Campaign并行CRT铸造
- 用户统计更新

### test_LikeAndCRTMinting()
验证点赞功能：
- 点赞记录
- 重复点赞检查
- 双方奖励机制
- 多Campaign并行奖励

### test_MultipleCampaignInteraction()
验证多Campaign交互：
- 跨Campaign CRT累积
- 用户总CRT统计
- Campaign间独立性

### test_CampaignDetailedQuery()
验证详细查询功能：
- 用户多Campaign CRT详情
- CRT分类统计
- 待领取奖励查询

### test_RewardDistribution()
验证奖励分配：
- Campaign结束检测
- 奖励计算和分配
- 用户奖励领取
- 权限控制验证

### test_EmptyCampaignExtension()
验证空Campaign处理：
- 无参与者检测
- 自动延期机制
- 延期时间验证

### test_CRTNonTransferable()
验证CRT Token的Soulbound特性：
- 转账限制
- 批准限制
- 余额查询正常

### test_BackwardCompatibility()
验证向后兼容性：
- 兼容性函数不报错
- 返回值符合预期

## Campaign系统特性

### 核心优势
1. **多Campaign并行**：用户在同一项目的多个Campaign中同时获得奖励
2. **独立CRT代币**：每个Campaign有独立的CRT代币和奖池
3. **灵活创建**：任何人可创建Campaign，自定义奖励
4. **智能延期**：无参与者时自动延长，避免资源浪费
5. **平台管理**：奖励分配和延期由平台统一管理

### 技术特点
1. **最小代理模式**：Campaign创建成本节省97%
2. **事件通知机制**：Project通知所有活跃Campaign
3. **错误处理**：使用try-catch忽略Campaign调用错误
4. **权限分离**：平台管理Campaign，Factory创建Campaign
5. **动态命名**：Campaign代币名称包含项目名和编号

## 故障排除

### 常见问题

1. **测试失败：地址为零**
   - 确保所有合约正确部署
   - 检查依赖关系设置

2. **Campaign创建失败**
   - 验证代币授权充足
   - 检查Campaign参数有效性

3. **CRT铸造问题**
   - 验证Campaign处于活跃状态
   - 检查Project与Campaign关联

4. **奖励分配问题**
   - 确保Campaign已结束
   - 验证平台权限设置

5. **代币转移失败**
   - 检查CampaignFactory代币授权
   - 验证代币余额充足

## 扩展测试

如需添加新的测试用例，请遵循以下约定：

1. 使用 `test_` 前缀命名测试函数
2. 添加适当的断言和错误消息
3. 包含 console.log 输出用于调试
4. 更新本README文档

## Campaign系统架构

```
用户活动流程：
1. 用户发表评论 → Project.postComment()
2. Project通知所有活跃Campaign → Campaign.onCommentPosted()
3. 每个Campaign为用户铸造5个CRT
4. 用户获得多个Campaign的CRT奖励

Campaign生命周期：
1. 任何人创建Campaign → CampaignFactory.createCampaign()
2. Campaign自动激活并开始接收活动
3. Campaign结束时平台分配奖池奖励
4. 用户领取各Campaign的奖励代币
```

## 贡献

欢迎提交测试改进建议和新的测试用例！测试是确保Campaign系统稳定性的重要保障。 