# Chainlink 自动化合约系统

## 项目概述

本项目包含两个核心的 Chainlink 自动化智能合约：

- **AutoTag** - 基于 Chainlink Functions 的评论情感分析自动化合约
- **AutoVRF** - 基于 Chainlink VRF 的随机数生成和抽奖自动化合约

这两个合约都集成了 Chainlink Automation 服务，实现了完全自动化的工作流程，无需人工干预即可完成复杂的链上操作。

## 合约架构

### AutoTag 合约架构

AutoTag 合约实现了一个完整的评论情感分析自动化流程：

1. **请求阶段**：接收评论内容，调用 Chainlink Functions 进行 AI 情感分析
2. **分析阶段**：使用 Google Gemini API 分析评论情感（积极/消极/中性）
3. **回调阶段**：接收 AI 分析结果，存储到待处理队列
4. **自动化阶段**：Chainlink Automation 自动检测并处理已完成的分析请求
5. **更新阶段**：自动调用项目合约更新评论标志

**核心组件**：

- `FunctionsClient` - 处理 Chainlink Functions 请求
- `AutomationCompatibleInterface` - 实现自动化检测和执行
- `RequestInfo` 结构体 - 管理请求状态和数据
- AI 源代码 - 内嵌的 JavaScript 代码调用 Google Gemini API

### AutoVRF 合约架构

AutoVRF 合约实现了高效的随机数生成和自动分发系统：

1. **请求阶段**：接收随机数需求（范围和数量）
2. **VRF 阶段**：调用 Chainlink VRF 获取真随机种子
3. **生成阶段**：基于 VRF 种子生成多个不重复随机数
4. **自动化阶段**：Chainlink Automation 检测并处理已完成的 VRF 请求
5. **分发阶段**：自动调用活动合约分发抽奖结果

**核心组件**：

- `VRFConsumerBaseV2Plus` - 处理 Chainlink VRF 请求
- `AutomationCompatibleInterface` - 实现自动化检测和执行
- `VRFRequest` 结构体 - 管理 VRF 请求状态
- 随机数生成算法 - 基于单个 VRF 种子生成多个不重复随机数

## 使用方法

### AutoTag 使用步骤

1. **部署 AutoTag 合约**

```solidity
// 部署时 subscriptionId 可以先设为 0
AutoTag autoTag = new AutoTag(0);
```

2. **注册 Chainlink 服务**

- 在 [Chainlink Functions](https://functions.chain.link/fuji) 注册 Functions 服务
- 在 [Chainlink Automation](https://automation.chain.link/fuji) 注册 Automation 服务

3. **配置合约**

```solidity
// 更新 Functions 订阅 ID
autoTag.updateSubscriptionId(YOUR_SUBSCRIPTION_ID);

// 设置项目合约地址
autoTag.updateProjectContract(YOUR_PROJECT_CONTRACT_ADDRESS);
```

4. **在项目合约中集成**

```solidity
interface AutoTagInterface {
    function getCommentFlag(uint commentId, string calldata comment) external returns (bytes32 requestId);
    function tagToFlag(string memory tag) external pure returns (uint);
}

contract YourProject {
    AutoTagInterface autoTag = AutoTagInterface(0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9);

    function analyzeComment(uint commentId, string memory comment) public {
        autoTag.getCommentFlag(commentId, comment);
    }

    // 必须实现此函数接收自动化结果
    function updateCommentFlag(uint commentId, uint flag) public {
        // flag: 1=积极, 2=消极, 3=中性, 0=未知
        // 处理分析结果
    }
}
```

### AutoVRF 使用步骤

1. **部署 AutoVRF 合约**

```solidity
// 部署时 subscriptionId 可以先设为 0
AutoVRF autoVRF = new AutoVRF(0);
```

2. **注册 Chainlink 服务**

- 在 [Chainlink VRF](https://vrf.chain.link/fuji) 注册 VRF 服务
- 在 [Chainlink Automation](https://automation.chain.link/fuji) 注册 Automation 服务

3. **配置合约**

```solidity
// 更新 VRF 订阅 ID
autoVRF.setSubscriptionId(YOUR_SUBSCRIPTION_ID);

// 设置活动合约地址
autoVRF.setCampaignAddr(YOUR_CAMPAIGN_CONTRACT_ADDRESS);
```

4. **在活动合约中集成**

```solidity
interface AutoVRFInterface {
    function getVRF(uint256 range, uint256 n) external returns (uint256 requestId);
    function getCampaignLuckers(uint256 likeIndex, uint256 luckyLikeCount) external returns (uint256 requestId);
}

contract YourCampaign {
    AutoVRFInterface autoVRF = AutoVRFInterface(0x7593F3782435ceab38e9cBA065AB6233244EDD9C);

    function startLottery(uint256 totalParticipants, uint256 winnerCount) public {
        autoVRF.getVRF(totalParticipants, winnerCount);
    }

    // 必须实现此函数接收自动化结果
    function rewardsLikeCRT(uint256[] calldata luckyNumbers) external {
        // 处理中奖号码
    }
}
```

## 部署说明

### 网络配置

- **测试网络**：Avalanche Fuji
- **主网络**：Avalanche Mainnet

### 已部署合约地址（Fuji 测试网）

- **AutoTag 合约**：`0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9`
- **AutoVRF 合约**：`0x7593F3782435ceab38e9cBA065AB6233244EDD9C`
- **测试项目合约**：`0x42D555CAC4bA948A73D25DD54EbD8c4477accbd8`
- **测试活动合约**：`0x6AAEA242531A0a233BD9c9473DebB39b49417841`

### 部署要求

由于 Chainlink 订阅服务的要求，建议使用 Remix IDE 进行部署：

1. **使用 Remix 部署**

   - 复制合约代码到 Remix
   - 连接到 Avalanche Fuji 测试网
   - 部署合约并获取地址

2. **订阅服务配置**

   - Functions 订阅需要 LINK 代币
   - VRF 订阅需要 LINK 代币
   - Automation 注册需要 LINK 代币

3. **Gas 配置**
   - AutoTag：建议 gas limit 300,000
   - AutoVRF：建议 callback gas limit 500,000

## 技术实现

### Chainlink Functions 集成

AutoTag 合约使用内嵌的 JavaScript 代码调用 Google Gemini API：

```javascript
// AI 分析源代码片段
const promptText = args[0];
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=API_KEY`;
// 发送请求并返回情感分析结果：POS/NEG/NEU
```

### Chainlink VRF 集成

AutoVRF 合约优化了随机数生成策略：

- **单次 VRF 请求**：只请求 1 个真随机种子，降低成本
- **多数生成算法**：基于 VRF 种子使用 keccak256 生成多个随机数
- **去重机制**：确保生成的随机数不重复

### Chainlink Automation 集成

两个合约都实现了自动化检测和执行：

```solidity
function checkUpkeep(bytes calldata) external view override
    returns (bool upkeepNeeded, bytes memory performData) {
    // 检测是否有待处理的请求
}

function performUpkeep(bytes calldata performData) external override {
    // 自动执行处理逻辑
}
```

## 文件结构

```
chainlink_auto/
├── antoTag.sol          # AutoTag 主合约 - 评论情感分析自动化
├── autoVRF.sol          # AutoVRF 主合约 - 随机数生成自动化
├── counterAuto.sol      # Counter 示例合约 - Automation 基础示例
├── README.md           # 英文文档
└── README_zh.md        # 中文文档（本文档）
```

### 文件说明

- **antoTag.sol**：完整的评论情感分析自动化合约，包含测试项目合约
- **autoVRF.sol**：完整的随机数生成自动化合约，包含测试活动合约
- **counterAuto.sol**：简单的计数器自动化示例，用于学习 Automation 基础概念
- **README.md**：英文版本文档
- **README_zh.md**：中文版本文档

## 标签说明

### AutoTag 情感标志

- **POS**：积极/看涨情感 → 标志值 1
- **NEG**：消极/看跌情感 → 标志值 2
- **NEU**：中性情感 → 标志值 3
- **未知/错误** → 标志值 0

### 工作流程时间

- **AutoTag**：分析完成后约 1-2 分钟自动更新结果
- **AutoVRF**：VRF 完成后约 1-2 分钟自动分发结果

## 注意事项

1. **订阅管理**：确保 LINK 代币余额充足
2. **Gas 优化**：根据网络情况调整 gas limit
3. **错误处理**：合约包含完善的错误处理和重试机制
4. **安全性**：所有外部调用都有适当的验证和保护
5. **可扩展性**：支持批量处理和手动干预功能
