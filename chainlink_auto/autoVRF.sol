// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.4.0/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts@1.4.0/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts@1.4.0/src/v0.8/automation/AutomationCompatible.sol";

// Campaign合约接口
interface ICampaign {
    function rewardsLikeCRT(uint256[] calldata VRFLikeIndexArray) external;
}

// 测试campaign合约:0x6AAEA242531A0a233BD9c9473DebB39b49417841
contract testCampaign is ICampaign {
    uint[] public data;
    function getData() public view returns(uint[] memory) {
        return data;
    }
    function rewardsLikeCRT(uint256[] calldata VRFLikeIndexArray) public {
        data = VRFLikeIndexArray;
    }
}

// chainlink合约的接口，用于Campaign合约调用
interface AutoVRFInterface {
    function getVRF(uint256 range, uint256 n) external returns (uint256 requestId);
    function getCampaignLuckers(uint256 likeIndex, uint256 luckyLikeCount) external returns (uint256 requestId);
    function setSubscriptionId(uint256 _subscriptionId) external;
    function setCampaignAddr(address _campaignAddr) external;
}

// 部署后要在  https://automation.chain.link/fuji   注册Automation服务
// 也要去     https://vrf.chain.link/fuji           注册VRF服务


/*
使用指引：

1. 部署AutoVRF合约（一开始的subscriptionId是0，随便填都行）
2. 在https://automation.chain.link/fuji   注册Automation服务
3. 在https://vrf.chain.link/fuji           注册VRF服务
4. AutoVRF.setSubscriptionId(VRF订阅ID)
   目前AutoVRF合约已经部署在了Fuji：0x7593F3782435ceab38e9cBA065AB6233244EDD9C
   也可以用testCampaign合约来做一下测试，在fuji：0xa848242aad648E33176D1b2814a73FBE9C561342

下面是我们campaign的合约

1. 部署我们自己的campaign合约，比如testCampaign，必须要有rewardsLikeCRT(uint256[])
2. 在remix中复制这个合约文本，选择AutoVRF的AtAddress：0x7593F3782435ceab38e9cBA065AB6233244EDD9C
3. 在remix中找到这个已经部署的合约，调用AutoVRF.setCampaignAddr(我们的Campaign合约地址)
4. 在我们自己的Campaign合约中文本的上方，把AutoVRFInterface接口写上去

interface AutoVRFInterface {
    function getVRF(uint256 range, uint256 n) external returns (uint256 requestId);
    function getCampaignLuckers(uint256 likeIndex, uint256 luckyLikeCount) external returns (uint256 requestId);
    function setSubscriptionId(uint256 _subscriptionId) external;
    function setCampaignAddr(address _campaignAddr) external;
}

contract Campaign {
    // 某个函数里
    function someFunc() {
        // 5. 初始化AutoVRF合约
        AutoVRFInterface autoVRF = AutoVRFInterface(0x7593F3782435ceab38e9cBA065AB6233244EDD9C);
        // 6. 调用getVRF函数，比如说100个里面找10个
        autoVRF.getVRF(100, 10);
    }
    function rewardsLikeCRT(uint256[] calldata VRFLikeIndexArray) external {...}
}

7. 静静等待约一分钟（或者两分钟），automation应该就会自动调用rewardsLikeCRT函数，结束
*/

// 已经部署了：0x7593F3782435ceab38e9cBA065AB6233244EDD9C
contract AutoVRF is AutomationCompatibleInterface, VRFConsumerBaseV2Plus, AutoVRFInterface{
    event RequestSent(uint256 requestId, uint32 numWords, uint256 range, uint256 n);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords, uint256[] luckyNumbers);
    event CampaignRewardsSent(address campaign, uint256[] luckyNumbers);

    struct VRFRequest {
        bool fulfilled;     // 这个请求是否已完成
        bool exists;        // 这个请求ID是否存在
        bool processed;     // 这个请求是否已被处理过
        uint256 range;      // 随机数范围
        uint256 n;          // 需要多少个随机数
        uint256[] randomWords; // 原始随机数
        uint256[] luckyNumbers; // 处理后的幸运数字
        address campaignAddr;   // 调用的campaign地址
    }

    mapping(uint256 => VRFRequest) public s_requests;
    
    // VRF相关参数
    uint256 public s_subscriptionId;
    uint256[] public requestIds;
    uint256 public lastRequestId;
    
    // VRF计数器，用于自动化检测
    uint256 public vrfNonce;
    uint256 public prevVrfNonce;
    
    // VRF配置参数
    // fuji网络的keyHash
    bytes32 public keyHash = 0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887;
    uint32 public callbackGasLimit = 500000; // 降低callback gas limit
    uint16 public requestConfirmations = 1;
    uint32 public numWords = 1; // 只请求1个随机数作为种子
    

    address public campaignAddr; // 单一的campaign合约地址
    

    // fuji网络的VRF Coordinator: 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE
    constructor(
        uint256 subscriptionId
    ) VRFConsumerBaseV2Plus(0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE) {
        s_subscriptionId = subscriptionId;
        vrfNonce = 0;
        prevVrfNonce = 0;
    }

    // 设置订阅ID
    function setSubscriptionId(uint256 _subscriptionId) external {
        s_subscriptionId = _subscriptionId;
    }
    
    // 设置Campaign合约地址
    function setCampaignAddr(address _campaignAddr) external {
        campaignAddr = _campaignAddr;
    }

    // 主要的VRF请求函数 - 从range中抽取n个不重复的随机数
    function getVRF(uint256 range, uint256 n) public returns (uint256 requestId) {
        require(range > 0 && n > 0 && n <= range, "Invalid range or n");
        require(n <= 500, "Too many numbers requested"); // 增加上限，因为不再受VRF限制
        require(s_subscriptionId > 0, "Subscription ID not set"); // 检查订阅ID
        
        // 只请求1个随机数作为种子
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: 1, // 固定为1
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: false // 使用LINK支付
                    })
                )
            })
        );
        
        // 保存请求信息 - 使用设置的campaign地址而不是msg.sender
        address callerAddr = campaignAddr != address(0) ? campaignAddr : msg.sender;
        s_requests[requestId] = VRFRequest({
            fulfilled: false,
            exists: true,
            processed: false,
            range: range,
            n: n,
            randomWords: new uint256[](0),
            luckyNumbers: new uint256[](0),
            campaignAddr: callerAddr
        });
        
        requestIds.push(requestId);
        lastRequestId = requestId;
        vrfNonce++; // 增加VRF计数器
        
        emit RequestSent(requestId, 1, range, n); // 实际只请求1个VRF随机数
        return requestId;
    }

    // 专门为Campaign抽奖设计的函数
    function getCampaignLuckers(uint256 likeIndex, uint256 luckyLikeCount) external returns (uint256 requestId) {
        // likeIndex表示有多少个点赞，luckyLikeCount表示要抽多少个幸运用户
        return getVRF(likeIndex, luckyLikeCount);
    }

    // VRF回调函数
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "Request not found");
        
        VRFRequest storage request = s_requests[_requestId];
        request.fulfilled = true;
        request.randomWords = _randomWords;
        
        // 使用VRF种子生成多个随机数
        uint256[] memory luckyNumbers = generateMultipleRandomNumbers(
            _randomWords[0], // VRF种子
            request.range,
            request.n,
            _requestId // 使用requestId作为额外的nonce
        );
        
        request.luckyNumbers = luckyNumbers;
        
        emit RequestFulfilled(_requestId, _randomWords, luckyNumbers);
    }
    
    // 使用单个VRF种子生成多个不重复的随机数
    function generateMultipleRandomNumbers(
        uint256 seed,
        uint256 range,
        uint256 count,
        uint256 nonce
    ) internal view returns (uint256[] memory) {
        uint256[] memory numbers = new uint256[](count);
        bool[] memory used = new bool[](range + 1);
        
        for (uint256 i = 0; i < count; i++) {
            // 使用keccak256生成伪随机数，结合seed、nonce和索引
            uint256 hash = uint256(keccak256(abi.encodePacked(seed, nonce, i, block.timestamp)));
            uint256 randomNum = (hash % range) + 1;
            
            // 确保不重复 - 如果已使用则线性探测下一个
            uint256 attempts = 0;
            while (used[randomNum] && attempts < range) {
                randomNum = (randomNum % range) + 1;
                attempts++;
            }
            
            // 如果所有数字都被使用了，直接跳出（这种情况不应该发生，因为count <= range）
            if (attempts >= range) {
                break;
            }
            
            used[randomNum] = true;
            numbers[i] = randomNum;
        }
        
        return numbers;
    }

    // Automation检查函数
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // 检查是否有新的VRF请求
        bool hasNewRequest = vrfNonce > prevVrfNonce;
        
        if (!hasNewRequest) {
            return (false, "");
        }
        
        // 检查是否有已完成但未处理的请求
        for (uint256 i = requestIds.length; i > 0; i--) {
            uint256 requestId = requestIds[i - 1];
            VRFRequest memory request = s_requests[requestId];
            
            if (request.fulfilled && !request.processed) {
                // 找到了一个需要处理的请求
                upkeepNeeded = true;
                performData = abi.encode(requestId);
                break;
            }
        }
    }

    // Automation执行函数
    function performUpkeep(bytes calldata performData) external override {
        uint256 requestId = abi.decode(performData, (uint256));
        VRFRequest storage request = s_requests[requestId];
        
        // 验证请求状态
        require(request.exists, "Request not found");
        require(request.fulfilled, "Request not fulfilled");
        require(!request.processed, "Request already processed");
        
        // 标记为已处理
        request.processed = true;
        prevVrfNonce++;
        
        // 调用Campaign合约的奖励函数
        if (request.campaignAddr != address(0)) {
            ICampaign(request.campaignAddr).rewardsLikeCRT(request.luckyNumbers);
            emit CampaignRewardsSent(request.campaignAddr, request.luckyNumbers);
        }
    }

    // 查询请求状态
    function getRequestStatus(
        uint256 _requestId
    ) external view returns (
        bool fulfilled, 
        bool processed,
        uint256[] memory randomWords,
        uint256[] memory luckyNumbers,
        uint256 range,
        uint256 n
    ) {
        require(s_requests[_requestId].exists, "Request not found");
        VRFRequest memory request = s_requests[_requestId];
        return (
            request.fulfilled, 
            request.processed,
            request.randomWords, 
            request.luckyNumbers,
            request.range,
            request.n
        );
    }

    // 获取所有请求ID
    function getAllRequestIds() external view returns (uint256[] memory) {
        return requestIds;
    }

    // 手动触发处理（紧急情况使用）
    function manualProcessRequest(uint256 requestId) external {
        VRFRequest storage request = s_requests[requestId];
        require(request.exists && request.fulfilled && !request.processed, "Invalid request state");
        
        request.processed = true;
        
        if (request.campaignAddr != address(0)) {
            ICampaign(request.campaignAddr).rewardsLikeCRT(request.luckyNumbers);
            emit CampaignRewardsSent(request.campaignAddr, request.luckyNumbers);
        }
    }

    // 更新VRF参数
    function updateVRFParams(
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations,
        uint32 _numWords
    ) external {
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
        numWords = _numWords;
    }
}