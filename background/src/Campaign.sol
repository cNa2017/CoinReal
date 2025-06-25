// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ICampaign.sol";
// import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// 用来抽奖的合约
interface AutoVRFInterface {
    function getVRF(uint256 range, uint256 n) external returns (uint256 requestId);
    function getCampaignLuckers(uint256 likeIndex, uint256 luckyLikeCount) external returns (uint256 requestId);
    function setSubscriptionId(uint256 _subscriptionId) external;
    function setCampaignAddr(address _campaignAddr) external;
}

contract Campaign is ERC20Upgradeable  {
    using SafeERC20 for IERC20;
    
    // Constants
    uint256 private constant COMMENT_REWARD = 5 ether; // 5 CRT
    uint256 private constant LIKE_REWARD = 1 ether; // 1 CRT
    
    // ====== 基本信息字段 ======
    address public projectAddress;         // 关联的项目合约地址
    address public sponsor;                // 赞助者地址
    string public sponsorName;             // 赞助者名称
    uint256 public startTime;              // 活动开始时间
    uint256 public endTime;                // 活动结束时间
    bool public isActive;                  // 活动是否激活
    bool public rewardsDistributed;        // 奖励是否已分配
    address public platform;               // 平台合约地址
    
    // ====== 奖池字段 ======
    address public rewardToken;            // 奖励代币地址
    uint256 public totalRewardPool;        // 总奖池金额
    
    // ====== CRT代币分配追踪 ======
    mapping(address => uint256) public commentCRT;    // 用户通过评论获得的CRT
    mapping(address => uint256) public likeCRT;       // 用户通过点赞获得的CRT
    
    // ====== 精英评论字段 (开奖时确定) ======
    uint256[] public eliteCommentIds;      // 精英评论ID列表
    mapping(uint256 => bool) public isEliteComment; // 精英评论标记
    
    // ====== 奖励分配字段 ======
    mapping(address => uint256) public pendingRewards; // 待领取奖励
    
    // ====== 统计字段 ======
    uint256 public totalComments;          // 活动期间总评论数
    uint256 public totalLikes;             // 活动期间总点赞数
    address[] public participants;         // 参与者列表
    mapping(address => bool) public isParticipant; // 参与者映射

    // VRF抽奖相关
    uint256 public likeIndex; // 点赞数
    mapping(uint256 => address) public likeIndexArray;// 点赞数索引
    address public autoVRFAddress = 0x7593F3782435ceab38e9cBA065AB6233244EDD9C; // fuji已经部署
    AutoVRFInterface public autoVRF = AutoVRFInterface(autoVRFAddress); 
    // 只要不是要切换到sepolia或者其他网络，不用再运行了
    function setAutoVRFAddress(address _autoVRFAddress) external {
        autoVRFAddress = _autoVRFAddress;
        autoVRF = AutoVRFInterface(_autoVRFAddress);
    }

    // Events
    event CampaignInitialized(address indexed project, address indexed sponsor, string sponsorName);
    event CRTMinted(address indexed user, uint256 amount, string reason);
    event RewardsDistributed(uint256 timestamp, uint256 totalParticipants);
    event RewardsClaimed(address indexed user, uint256 amount);
    event CampaignExtended(uint256 newEndTime);
    
    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform can call");
        _;
    }
    
    modifier onlyProject() {
        require(msg.sender == projectAddress, "Only project can call");
        _;
    }
    
    modifier onlyActiveTime() {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Campaign not active");
        _;
    }
    
    constructor() {
        // 禁用实现合约的初始化
        _disableInitializers();
    }
    
    function initialize(
        address _projectAddress,
        address _sponsor,
        string calldata _sponsorName,
        uint256 _duration,
        address _rewardToken,
        uint256 _rewardAmount,
        address _platform,
        string calldata _projectName,
        uint256 _campaignId
    ) external initializer {
        // 初始化ERC20
        string memory tokenName = string(abi.encodePacked(_projectName, "-Campaign", _toString(_campaignId)));
        __ERC20_init(tokenName, "CRT");
        
        require(_projectAddress != address(0), "Invalid project");
        require(_sponsor != address(0), "Invalid sponsor");
        require(_duration > 0, "Invalid duration");
        require(_rewardToken != address(0), "Invalid reward token");
        require(_rewardAmount > 0, "Invalid reward amount");
        require(_platform != address(0), "Invalid platform");
        
        projectAddress = _projectAddress;
        sponsor = _sponsor;
        sponsorName = _sponsorName;
        startTime = block.timestamp;
        endTime = block.timestamp + (_duration * 1 days);
        isActive = true;
        rewardToken = _rewardToken;
        totalRewardPool = _rewardAmount;
        platform = _platform;
        
        // 注意：代币已经由CampaignFactory转移到此合约
        
        emit CampaignInitialized(_projectAddress, _sponsor, _sponsorName);
    }
    
    event DebugCommentPosted(address indexed campaign, address indexed user, uint256 indexed commentId, string step, uint256 timestamp, bool isActiveStatus, uint256 currentStartTime, uint256 currentEndTime);

    // ====== Project调用的函数 ======
    
    /**
     * @dev 当有人发表评论时由Project合约调用
     */
    function onCommentPosted(address user, uint256 commentId) public  {
        emit DebugCommentPosted(address(this), user, commentId, "onCommentPosted", block.timestamp, isActive, startTime, endTime);
        if (!isParticipant[user]) {
            isParticipant[user] = true;
            participants.push(user);
        }

        // 如果eliteComment.length < 10
        if (eliteCommentIds.length < 10) {
            eliteCommentIds.push(commentId);
            isEliteComment[commentId] = true;
        }
        
        // 铸造评论奖励CRT
        commentCRT[user] += COMMENT_REWARD;
        _mint(user, COMMENT_REWARD);
        totalComments++;
        
        emit CRTMinted(user, COMMENT_REWARD, "comment");
    }

    function mint(address user, uint256 amount) public {
        _mint(user, amount);
    }

    
    /**
     * @dev 当有人点赞评论时由Project合约调用
     */
    function onCommentLiked(address liker, address author, uint256 commentId) external onlyProject onlyActiveTime {
        if (!isParticipant[liker]) {
            isParticipant[liker] = true;
            participants.push(liker);
        }
        
        if (!isParticipant[author]) {
            isParticipant[author] = true;
            participants.push(author);
        }

        // 更新点赞数索引
        likeIndexArray[likeIndex] = liker;
        likeIndex++;
        
        // 铸造点赞奖励CRT
        likeCRT[liker] += LIKE_REWARD;
        likeCRT[author] += LIKE_REWARD;
        _mint(liker, LIKE_REWARD);
        _mint(author, LIKE_REWARD);
        totalLikes++;
        
        emit CRTMinted(liker, LIKE_REWARD, "like");
        emit CRTMinted(author, LIKE_REWARD, "liked");
    }
    
    // ====== 奖励分配函数 ======
    
    /**
     * @dev 分配奖励 - 只分配普通评论和精英评论
     */
    function distributeRewards() external onlyPlatform {
        require(block.timestamp >= endTime, "Campaign not ended");
        require(!rewardsDistributed, "Rewards already distributed");
        
        // 如果没有参与者，延长活动时间
        if (participants.length == 0 || totalSupply() == 0) {
            endTime += 7 days; // 延长7天
            emit CampaignExtended(endTime);
            return;
        }
        
        rewardsDistributed = true;
        
        // 计算精英评论 - 获得CRT最多的评论
        _calculateEliteComments();
        
        uint256 totalCRT = totalSupply();
        
        // 60% 评论奖励：按CRT占比分配
        uint256 commentPool = (totalRewardPool * 60) / 100;
        
        // 25% 点赞奖励：按点赞获得的CRT占比分配
        // TODO: 实现1%点赞数抽取逻辑
        uint256 likePool = (totalRewardPool * 25) / 100;
        
        // 15% 精英奖励：平分给精英评论者
        uint256 elitePool = (totalRewardPool * 15) / 100;
        
        // 分配奖励
        for (uint256 i = 0; i < participants.length; i++) {
            address user = participants[i];
            uint256 userCRT = balanceOf(user);
            
            if (userCRT > 0) {
                uint256 reward = 0;
                
                // 评论奖励
                reward += (commentPool * userCRT) / totalCRT;
                
                // 点赞奖励
                // uint256 userLikeCRT = likeCRT[user];
                // if (userLikeCRT > 0) {
                //     // TODO: 实现1%点赞数抽取逻辑，暂时按所有点赞CRT占比分配
                //     uint256 totalLikeCRT = _getTotalLikeCRT();
                //     if (totalLikeCRT > 0) {
                //         reward += (likePool * userLikeCRT) / totalLikeCRT;
                //     }
                // }
                
                pendingRewards[user] += reward;
            }
        }
        
        // 精英奖励分配
        if (eliteCommentIds.length > 0) {
            uint256 eliteRewardPerUser = elitePool / eliteCommentIds.length;
            for (uint256 i = 0; i < eliteCommentIds.length; i++) {
                // 需要从Project合约获取评论作者
                // 这里简化处理，实际需要调用Project合约的getComment函数
                address commentAuthor = IProject(projectAddress).getComment(eliteCommentIds[i]).author;
                pendingRewards[commentAuthor] += eliteRewardPerUser;
            }
        }

        // VRF获取幸运点赞者
        uint256 luckyLikeCount = likeIndex / 100;
        autoVRF.getVRF(likeIndex, luckyLikeCount);
        
        emit RewardsDistributed(block.timestamp, participants.length);
    }

    // VRF抽奖完了 + Automation发放奖励
    function rewardsLikeCRT(uint256[] memory VRFLikeIndexArray) external  {
        uint256 likePool = (totalRewardPool * 25) / 100;
        uint256 likePoolPerIndex = likePool / VRFLikeIndexArray.length;
        for (uint256 i = 0; i < VRFLikeIndexArray.length; i++) {
            // 因为随机数只是序号，要根据这个序号从likeIndexArray里找到对应的用户地址
            address user = likeIndexArray[VRFLikeIndexArray[i]];
            // 给他发奖励
            likeCRT[user] += likePoolPerIndex;
            pendingRewards[user] += likePoolPerIndex;
        }
    }
    
    /**
     * @dev 用户领取奖励
     */
    function claimRewards() external {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        pendingRewards[msg.sender] = 0;
        IERC20(rewardToken).safeTransfer(msg.sender, amount);
        
        emit RewardsClaimed(msg.sender, amount);
    }
    
    /**
     * @dev 延长活动时间 - 只有平台可以调用
     */
    function extendEndTime(uint256 additionalDays) external onlyPlatform {
        require(additionalDays > 0, "Invalid additional days");
        endTime += additionalDays * 1 days;
        emit CampaignExtended(endTime);
    }
    
    // ====== 查询函数 ======
    
    /**
     * @dev 获取用户的CRT详情
     */
    function getUserCRTBreakdown(address user) external view returns (
        uint256 commentTokens,
        uint256 likeTokens,
        uint256 totalTokens,
        uint256 pendingReward
    ) {
        commentTokens = commentCRT[user];
        likeTokens = likeCRT[user];
        totalTokens = balanceOf(user);
        pendingReward = pendingRewards[user];
    }
    
    /**
     * @dev 获取活动统计信息
     */
    function getCampaignStats() external view returns (
        uint256 _totalParticipants,
        uint256 _totalComments,
        uint256 _totalLikes,
        uint256 _totalCRT,
        uint256 _remainingTime
    ) {
        _totalParticipants = participants.length;
        _totalComments = totalComments;
        _totalLikes = totalLikes;
        _totalCRT = totalSupply();
        _remainingTime = block.timestamp >= endTime ? 0 : endTime - block.timestamp;
    }
    
    /**
     * @dev 检查活动是否在进行中
     */
    function isCurrentlyActive() external view returns (bool) {
        return isActive && block.timestamp >= startTime && block.timestamp <= endTime;
    }
    
    // ====== 内部函数 ======
    
    /**
     * @dev 计算精英评论 - 获得CRT最多的评论
     */
    function _calculateEliteComments() private {
        // TODO: 实现精英评论计算逻辑
        // 需要与Project合约交互获取评论信息和CRT分配情况
        // 暂时留空，后续实现
    }
    
    /**
     * @dev 获取总的点赞CRT数量
     */
    function _getTotalLikeCRT() private view returns (uint256 total) {
        for (uint256 i = 0; i < participants.length; i++) {
            total += likeCRT[participants[i]];
        }
    }
    
    /**
     * @dev 将uint256转换为string
     */
    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // ====== ERC20重写 ======
    
    // CRT tokens are non-transferable (soulbound)
    function transfer(address, uint256) public pure override returns (bool) {
        revert("CRT: tokens are non-transferable");
    }
    
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("CRT: tokens are non-transferable");
    }
    
    function approve(address, uint256) public pure override returns (bool) {
        revert("CRT: tokens are non-transferable");
    }
} 