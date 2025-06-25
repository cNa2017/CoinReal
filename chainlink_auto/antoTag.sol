// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts@1.4.0/src/v0.8/automation/AutomationCompatible.sol";

// 部署后要在  https://automation.chain.link/fuji   注册Automation服务
// 也要去     https://functions.chain.link/fuji     注册Functions服务

/*
使用指引：

1. 部署AutoTag合约(一开始subscriptionId是0，随便填都行)
2. 在https://functions.chain.link/fuji     注册Functions服务
3. 在https://automation.chain.link/fuji   注册Automation服务
4. AutoTag.updateSubscriptionId(Functions订阅ID)
   目前AutoTag合约已经部署在了Fuji：0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9
   也可以用testCampaign合约来做一下测试，在fuji：0x42D555CAC4bA948A73D25DD54EbD8c4477accbd8

下面是我们project的合约

1. 部署我们自己的project合约，比如testProject，必须要有updateCommentFlag(uint, uint)这个函数
2. 在remix中复制这个合约文本，选择AutoTag的AtAddress：0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9
3. 在remix中找到这个已经部署的合约，调用AutoTag.updateProjectContract(我们的project合约地址) 
4. 在我们自己的project合约文本上方，把AutoTagInterface接口写上去

interface AutoTagInterface {
    // getgetCommentFlag就是我们在project里面调用的函数
    function getCommentFlag(uint commentId, string calldata comment) external returns (bytes32 requestId);
    function tagToFlag(string memory tag) external pure returns (uint);
    // 这个是我们project合约部署时候要更新给AutoTag的
    function updateProjectContract(address _newProjectContract) external;
    function updateSubscriptionId(uint64 _newSubscriptionId) external;
}

contract project {
    // 某个函数里
    function someFunc() {
        // 5. 初始化AutoTag合约
        AutoTagInterface autoTag = AutoTagInterface(0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9);
        // 6. 调用getCommentFlag函数分析评论情感
        autoTag.getCommentFlag(commentId, comment);
    }
    function updateCommentFlag(uint commentId, uint flag) public {
        ...
    }
}

7. 静静等待约一到两分钟，Automation应该就会自动调用项目合约的updateCommentFlag函数，完成整个流程

标签说明：
- POS: 积极/看涨情感 -> 标志值 1
- NEG: 消极/看跌情感 -> 标志值 2
- NEU: 中性情感 -> 标志值 3
- 未知/错误 -> 标志值 0
*/

/**
 * @title 项目接口 - 用于更新评论标志
 */
interface IProject {
    function updateCommentFlag(uint commentId, uint flag) external;
}

/**
 * @title AutoTag接口 - 供其他合约调用
 */
interface AutoTagInterface {
    function getCommentFlag(uint commentId, string calldata comment) external returns (bytes32 requestId);
    function getRequestInfo(bytes32 requestId) external view returns (uint, string memory, bool, bool);
    function getStats() external view returns (uint, uint, uint, uint);
    function tagToFlag(string memory tag) external pure returns (uint);
    function updateProjectContract(address _newProjectContract) external;
    function updateSubscriptionId(uint64 _newSubscriptionId) external;
}

// 已经部署了：0x42D555CAC4bA948A73D25DD54EbD8c4477accbd8
contract TestProject {
    mapping(uint => uint) public commentIdToFlag;
    
    // 获取评论标志
    function getData(uint _commentId) public view returns(uint) {
        return commentIdToFlag[_commentId];
    }
    
    // 更新评论标志
    function updateCommentFlag(uint commentId, uint flag) public {
        commentIdToFlag[commentId] = flag;
    }
}


// 已经部署了：0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9
contract AutoTag is FunctionsClient, AutomationCompatibleInterface {
    
    // Chainlink Functions配置 - Avalanche Fuji测试网
    address router = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;
    bytes32 donID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;
    uint32 gasLimit = 300000;
    uint64 public subscriptionId;

    using FunctionsRequest for FunctionsRequest.Request;

    // 项目合约接口
    IProject public projectContract;
    
    // 请求信息结构体
    struct RequestInfo {
        uint commentId;      // 评论ID
        string tag;          // 分析结果标签
        bool isCompleted;    // 是否已完成分析
        bool isProcessed;    // 是否已处理
    }
    
    // 状态变量
    mapping(bytes32 => RequestInfo) public requests;  // 请求ID到请求信息的映射
    mapping(bytes32 => bool) public validRequestIds;  // 有效请求ID验证
    bytes32[] public pendingRequests;                 // 待处理的已完成请求队列
    
    // 计数器
    uint public totalRequests;      // 总请求数
    uint public completedRequests;  // 已完成请求数
    uint public processedRequests;  // 已处理请求数

    // AI分析源代码 - 使用Google Gemini进行情感分析
    string constant AI_SOURCE = 
        "const promptText = args[0];"
        "const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDAxxv2iq4miqPHqXxLqwyOYTXubQWdLKQ`;"
        "const body = {"
        "  system_instruction: {"
        "    parts: ["
        "      {"
        "        text: 'Classify crypto sentiment: POS for positive/bullish, NEG for negative/bearish, NEU for neutral. Output only: POS, NEG, or NEU'"
        "      }"
        "    ]"
        "  },"
        "  contents: ["
        "    {"
        "      parts: ["
        "        {"
        "          text: promptText"
        "        }"
        "      ]"
        "    }"
        "  ],"
        "  generationConfig: {"
        "    thinkingConfig: {"
        "      thinkingBudget: 0"
        "    }"
        "  }"
        "};"
        "try {"
        "  const response = await Functions.makeHttpRequest({"
        "    url: url,"
        "    method: 'POST',"
        "    headers: {"
        "      'Content-Type': 'application/json'"
        "    },"
        "    data: body"
        "  });"
        "  if (response.error) return Functions.encodeString('NEU');"
        "  const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'NEU';"
        "  return Functions.encodeString(resultText);"
        "} catch (e) {"
        "  return Functions.encodeString('NEU');"
        "}";

    // 事件
    event CommentAnalysisRequested(uint indexed commentId, string comment, bytes32 requestId);
    event CommentAnalysisCompleted(uint indexed commentId, string tag, bytes32 requestId);
    event CommentFlagUpdated(uint indexed commentId, uint flag);
    event ProjectContractUpdated(address newProjectContract);

    /**
     * @notice 初始化合约
     * @param _subscriptionId Chainlink Functions订阅ID
     */
    constructor(uint64 _subscriptionId)
        FunctionsClient(router)
    {
        subscriptionId = _subscriptionId;
    }

    /**
     * @notice 获取评论情感标志 - 发起AI分析请求
     * @param commentId 评论ID
     * @param comment 评论内容
     * @return requestId 请求ID
     */
    function getCommentFlag(uint commentId, string calldata comment)
        external
        returns (bytes32 requestId)
    {
        require(bytes(comment).length > 0, "Comment cannot be empty");
        
        // 准备AI分析参数
        string[] memory args = new string[](1);
        args[0] = comment;

        // 创建Functions请求
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(AI_SOURCE);
        req.setArgs(args);

        // 发送请求
        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        // 记录请求信息
        requests[requestId] = RequestInfo({
            commentId: commentId,
            tag: "",
            isCompleted: false,
            isProcessed: false
        });
        
        validRequestIds[requestId] = true;
        totalRequests++;

        emit CommentAnalysisRequested(commentId, comment, requestId);
        return requestId;
    }

    /**
     * @notice Chainlink Functions回调函数 - 处理AI分析结果
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        require(validRequestIds[requestId], "Invalid request ID");

        RequestInfo storage request = requests[requestId];

        // 处理分析结果
        if (err.length == 0 && response.length > 0) {
            string memory tag = string(response);
            // 验证返回的标签是否有效
            if (keccak256(abi.encodePacked(tag)) == keccak256(abi.encodePacked("POS")) ||
                keccak256(abi.encodePacked(tag)) == keccak256(abi.encodePacked("NEG")) ||
                keccak256(abi.encodePacked(tag)) == keccak256(abi.encodePacked("NEU"))) {
                request.tag = tag;
            } else {
                request.tag = "NEU"; // 默认为中性
            }
        } else {
            request.tag = "NEU"; // 错误时默认为中性
        }

        // 标记为已完成并加入待处理队列
        request.isCompleted = true;
        pendingRequests.push(requestId);
        completedRequests++;

        emit CommentAnalysisCompleted(request.commentId, request.tag, requestId);

        // 清理验证映射
        delete validRequestIds[requestId];
    }

    /**
     * @notice 将标签转换为数字标志
     * @param tag 情感标签 (POS/NEG/NEU)
     * @return flag 数字标志 (1=POS, 2=NEG, 3=NEU, 0=未知)
     */
    function tagToFlag(string memory tag) public pure returns (uint flag) {
        if (keccak256(abi.encodePacked(tag)) == keccak256(abi.encodePacked("POS"))) {
            return 1;
        }
        if (keccak256(abi.encodePacked(tag)) == keccak256(abi.encodePacked("NEG"))) {
            return 2;
        }
        if (keccak256(abi.encodePacked(tag)) == keccak256(abi.encodePacked("NEU"))) {
            return 3;
        }
        return 0; // 未知标签
    }

    /**
     * @notice Chainlink Automation检查函数 - 检查是否需要执行自动化
     * @return upkeepNeeded 是否需要执行自动化
     * @return performData 执行数据（未使用）
     */
    function checkUpkeep(bytes calldata /* checkData */)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        // 检查是否有已完成但未处理的请求
        upkeepNeeded = pendingRequests.length > 0;
    }

    /**
     * @notice Chainlink Automation执行函数 - 处理已完成的分析请求
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        // 处理所有待处理的请求
        uint pendingCount = pendingRequests.length;
        if (pendingCount == 0) return;

        // 批量处理待处理请求
        for (uint i = 0; i < pendingCount; i++) {
            bytes32 requestId = pendingRequests[i];
            RequestInfo storage request = requests[requestId];

            if (request.isCompleted && !request.isProcessed) {
                // 将标签转换为数字标志
                uint flag = tagToFlag(request.tag);

                // 调用项目合约更新标志
                try projectContract.updateCommentFlag(request.commentId, flag) {
                    request.isProcessed = true;
                    processedRequests++;
                    emit CommentFlagUpdated(request.commentId, flag);
                } catch {
                    // 如果调用失败，保持未处理状态，下次继续尝试
                }
            }
        }

        // 清理已处理的请求
        _cleanupProcessedRequests();
    }

    /**
     * @notice 清理已处理的请求队列
     */
    function _cleanupProcessedRequests() private {
        uint writeIndex = 0;
        for (uint readIndex = 0; readIndex < pendingRequests.length; readIndex++) {
            bytes32 requestId = pendingRequests[readIndex];
            if (!requests[requestId].isProcessed) {
                pendingRequests[writeIndex] = requestId;
                writeIndex++;
            }
        }

        // 删除已处理的请求
        while (pendingRequests.length > writeIndex) {
            pendingRequests.pop();
        }
    }

    /**
     * @notice 更新项目合约地址
     * @param _newProjectContract 新的项目合约地址
     */
    function updateProjectContract(address _newProjectContract) external {
        require(_newProjectContract != address(0), "Invalid contract address");
        projectContract = IProject(_newProjectContract);
        emit ProjectContractUpdated(_newProjectContract);
    }

    /**
     * @notice 更新Chainlink Functions订阅ID
     * @param _newSubscriptionId 新的订阅ID
     */
    function updateSubscriptionId(uint64 _newSubscriptionId) external {
        require(_newSubscriptionId > 0, "Invalid subscription ID");
        subscriptionId = _newSubscriptionId;
    }

    /**
     * @notice 更新gas限制
     * @param _newGasLimit 新的gas限制
     */
    function updateGasLimit(uint32 _newGasLimit) external {
        require(_newGasLimit >= 100000, "Gas limit too low");
        gasLimit = _newGasLimit;
    }

    /**
     * @notice 获取请求信息
     * @param requestId 请求ID
     * @return commentId 评论ID
     * @return tag 分析标签
     * @return isCompleted 是否已完成
     * @return isProcessed 是否已处理
     */
    function getRequestInfo(bytes32 requestId)
        external
        view
        returns (uint commentId, string memory tag, bool isCompleted, bool isProcessed)
    {
        RequestInfo memory request = requests[requestId];
        return (request.commentId, request.tag, request.isCompleted, request.isProcessed);
    }

    /**
     * @notice 获取合约统计信息
     * @return total 总请求数
     * @return completed 已完成请求数
     * @return processed 已处理请求数
     * @return pending 待处理请求数
     */
    function getStats()
        external
        view
        returns (uint total, uint completed, uint processed, uint pending)
    {
        return (totalRequests, completedRequests, processedRequests, pendingRequests.length);
    }

    /**
     * @notice 获取待处理请求列表
     * @return requestIds 待处理的请求ID数组
     */
    function getPendingRequests() external view returns (bytes32[] memory requestIds) {
        return pendingRequests;
    }

    /**
     * @notice 获取合约配置信息
     * @return routerAddr 路由器地址
     * @return currentGasLimit 当前gas限制
     * @return currentDonID 当前DON ID
     * @return currentSubscriptionId 当前订阅ID
     * @return projectAddr 项目合约地址
     */
    function getConfig()
        external
        view
        returns (
            address routerAddr,
            uint32 currentGasLimit,
            bytes32 currentDonID,
            uint64 currentSubscriptionId,
            address projectAddr
        )
    {
        return (router, gasLimit, donID, subscriptionId, address(projectContract));
    }

    /**
     * @notice 手动处理特定请求（紧急情况使用）
     * @param requestId 请求ID
     */
    function manualProcessRequest(bytes32 requestId) external {
        RequestInfo storage request = requests[requestId];
        require(request.isCompleted, "Request not completed");
        require(!request.isProcessed, "Request already processed");

        uint flag = tagToFlag(request.tag);
        projectContract.updateCommentFlag(request.commentId, flag);
        request.isProcessed = true;
        processedRequests++;

        emit CommentFlagUpdated(request.commentId, flag);
    }

    /**
     * @notice 获取AI源代码（调试用）
     */
    function getAiSource() external pure returns (string memory) {
        return AI_SOURCE;
    }
}