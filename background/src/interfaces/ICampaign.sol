// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICampaign {
    // ====== 结构体定义 ======
    
    // ====== 事件定义 ======
    event CampaignInitialized(address indexed project, address indexed sponsor, string sponsorName);
    event CRTMinted(address indexed user, uint256 amount, string reason);
    event RewardsDistributed(uint256 timestamp, uint256 totalParticipants);
    event RewardsClaimed(address indexed user, uint256 amount);
    event CampaignExtended(uint256 newEndTime);
    
    // ====== 核心功能函数 ======
    
    /**
     * @dev 初始化Campaign
     * @param _duration 活动持续分钟数
     */
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
    ) external;


    /**
     * @dev 当有人发表评论时由Project合约调用
     */
    function onCommentPosted(address user, uint256 commentId) external;

    function mint(address user, uint256 amount) external;

    /**
     * @dev 当有人点赞评论时由Project合约调用
     */
    function onCommentLiked(address liker, address author, uint256 commentId) external;
    
    /**
     * @dev 分配奖励 - 只分配普通评论和精英评论
     */
    function distributeRewards() external;

    /**
     * @dev 分配点赞抽奖，发送随机数请求
     */
    function rewardsLikeCRT(uint256[] memory VRFLikeIndexArray) external;
    
    /**
     * @dev 用户领取奖励
     */
    function claimRewards() external;

    
    /**
     * @dev 延长活动时间 - 只有平台可以调用
     */
    function extendEndTime(uint256 additionalDays) external;
    
    // ====== 查询函数 ======
    
    /**
     * @dev 获取用户的CRT详情
     */
    function getUserCRTBreakdown(address user) external view returns (
        uint256 commentTokens,
        uint256 likeTokens,
        uint256 totalTokens,
        uint256 pendingReward
    );
    
    /**
     * @dev 获取活动统计信息
     */
    function getCampaignStats() external view returns (
        uint256 _totalParticipants,
        uint256 _totalComments,
        uint256 _totalLikes,
        uint256 _totalCRT,
        uint256 _remainingTime
    );
    
    /**
     * @dev 检查活动是否在进行中
     */
    function isCurrentlyActive() external view returns (bool);
    
    // ====== ERC20相关函数 ======
    
    /**
     * @dev 获取用户的CRT代币余额
     */
    function balanceOf(address account) external view returns (uint256);
    
    /**
     * @dev 获取代币名称
     */
    function name() external view returns (string memory);
    
    /**
     * @dev 获取代币符号
     */
    function symbol() external view returns (string memory);
    
    /**
     * @dev 获取代币总供应量
     */
    function totalSupply() external view returns (uint256);
    
    /**
     * @dev 转移代币（CRT代币不可转移，会revert）
     */
    function transfer(address to, uint256 amount) external returns (bool);
    
    /**
     * @dev 授权代币（CRT代币不可转移，会revert）
     */
    function approve(address spender, uint256 amount) external returns (bool);
    
    // ====== 状态变量的getter函数 ======
    function projectAddress() external view returns (address);
    function sponsor() external view returns (address);
    function sponsorName() external view returns (string memory);
    function startTime() external view returns (uint256);
    function endTime() external view returns (uint256);
    function isActive() external view returns (bool);
    function rewardsDistributed() external view returns (bool);
    function rewardToken() external view returns (address);
    function totalRewardPool() external view returns (uint256);
    function commentCRT(address user) external view returns (uint256);
    function likeCRT(address user) external view returns (uint256);
    function pendingRewards(address user) external view returns (uint256);
    function totalComments() external view returns (uint256);
    function totalLikes() external view returns (uint256);
} 