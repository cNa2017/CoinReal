// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IProject
 * @dev CoinReal 项目合约接口 - 重构版本
 * @notice 管理单个项目的评论和点赞系统，Campaign独立管理奖池
 * 
 * 核心功能：
 * - 评论系统：用户发表评论和点赞
 * - Campaign管理：与多个Campaign合约交互
 * - 统计功能：项目参与度统计
 * 
 * 重构变化：
 * - 移除奖池管理（由Campaign合约负责）
 * - 移除CRT代币管理（由Campaign合约负责）
 * - 专注于评论和点赞的核心功能
 * - 通过Campaign获取CRT和奖励信息
 */
interface IProject {
    
    // ==================== 事件定义 ====================
    
    /**
     * @dev 项目初始化事件
     * @param name 项目名称
     * @param symbol 项目符号
     * @param creator 创建者地址
     */
    event ProjectInitialized(string name, string symbol, address creator);
    
    /**
     * @dev 评论发布事件
     * @param commentId 评论ID（自增）
     * @param user 评论者地址
     * @param content 评论内容
     */
    event CommentPosted(uint256 indexed commentId, address indexed user, string content);
    
    /**
     * @dev 评论点赞事件
     * @param commentId 被点赞的评论ID
     * @param liker 点赞者地址
     */
    event CommentLiked(uint256 indexed commentId, address indexed liker);
    
    /**
     * @dev Campaign添加事件
     * @param campaign Campaign合约地址
     */
    event CampaignAdded(address indexed campaign);
    
    // ==================== 数据结构定义 ====================
    
    /**
     * @dev 评论数据结构
     * @param id 评论唯一ID（自增，保证时间顺序）
     * @param author 评论作者地址
     * @param content 评论内容（1-1000字符）
     * @param likes 点赞数量
     * @param crtReward 兼容性字段，保留但不使用
     * @param isElite 是否为精英评论（由Campaign决定）
     * @param timestamp 发布时间戳
     * @param flag 打标签 0：没有标签，1，积极的，2，消极的，3，中立的
     */
    struct Comment {
        uint256 id;
        address author;
        string content;
        uint256 likes;
        uint256 crtReward; // 兼容性保留
        bool isElite;
        uint32 timestamp;
        uint flag; // 打标签 0：没有标签，1，积极的，2，消极的，3，中立的
    }
    
    /**
     * @dev 赞助记录结构 - 兼容性保留
     */
    struct Sponsorship {
        address token;
        uint256 amount;
        address sponsor;
        uint32 timestamp;
    }
    
    /**
     * @dev 用户统计数据结构 - 兼容性保留
     */
    struct UserStats {
        uint256 totalComments;
        uint256 totalLikes;
        uint256 totalCRT;
        uint256 claimedRewards;
    }
    
    // ==================== 初始化接口 ====================
    
    /**
     * @notice 初始化项目合约（仅能调用一次）
     * @dev 由ProjectFactory在克隆后调用，设置项目基本信息
     * 
     * @param _name 项目名称（如：Bitcoin）
     * @param _symbol 项目符号（如：BTC）
     * @param _description 项目描述
     * @param _category 项目分类（Layer1/DeFi/NFT等）
     * @param _drawPeriod 兼容性参数，保留但不使用
     * @param _creator 创建者地址
     * @param _priceOracle 价格预言机地址（空实现）
     * @param _platform 平台合约地址
     */
    function initialize(
        string calldata _name,
        string calldata _symbol,
        string calldata _description,
        string calldata _category,
        uint16 _drawPeriod,
        address _creator,
        address _priceOracle,
        address _platform
    ) external;
    
    // ==================== 用户交互接口 ====================
    
    /**
     * @notice 发表评论
     * @dev 用户发表评论，同时通知所有活跃的Campaign
     * 
     * 业务规则：
     * - 评论内容长度限制：1-1000字符
     * - 评论ID自增，保证时间顺序
     * - 更新项目统计数据
     * - 通知所有活跃Campaign铸造CRT
     * 
     * @param content 评论内容
     * @return commentId 新创建的评论ID
     */
    function postComment(string calldata content) external returns (uint256 commentId);

    /**
     * @notice 修改评论标签
     * @param commentId 评论ID
     * @param flag 标签
     */
    function updateCommentFlag(uint256 commentId, uint256 flag) external;
    
    /**
     * @notice 点赞评论
     * @dev 点赞评论，同时通知所有活跃的Campaign
     * 
     * 业务规则：
     * - 每个用户只能对同一评论点赞一次
     * - 更新评论的点赞数
     * - 通知所有活跃Campaign铸造CRT
     * 
     * @param commentId 要点赞的评论ID
     */
    function likeComment(uint256 commentId) external;
    
    // ==================== Campaign管理接口 ====================
    
    /**
     * @notice 添加Campaign到项目
     * @dev 只有平台可以调用，用于关联Campaign合约
     * 
     * @param campaign Campaign合约地址
     */
    function addCampaign(address campaign) external;
    
    /**
     * @notice 获取项目的所有Campaign
     * @return campaigns Campaign地址数组
     */
    function getCampaigns() external view returns (address[] memory campaigns);
    
    /**
     * @notice 获取用户在所有Campaign中的CRT总数
     * @param user 用户地址
     * @return totalCRT 总CRT数量
     */
    function getUserTotalCRT(address user) external view returns (uint256 totalCRT);
    
    /**
     * @notice 获取用户在所有Campaign中的详细CRT信息
     * @param user 用户地址
     * @return campaignAddresses Campaign地址数组
     * @return commentCRTs 各Campaign中的评论CRT
     * @return likeCRTs 各Campaign中的点赞CRT
     * @return totalCRTs 各Campaign中的总CRT
     * @return pendingRewards 各Campaign中的待领取奖励
     */
    function getUserCampaignCRTDetails(address user) external view returns (
        address[] memory campaignAddresses,
        uint256[] memory commentCRTs,
        uint256[] memory likeCRTs,
        uint256[] memory totalCRTs,
        uint256[] memory pendingRewards
    );
    
    // ==================== 查询接口 ====================
    
    /**
     * @notice 获取单个评论详情
     * @param commentId 评论ID
     * @return comment 评论结构体
     */
    function getComment(uint256 commentId) external view returns (Comment memory comment);
    
    /**
     * @notice 分页获取评论列表
     * @param offset 偏移量
     * @param limit 每页数量
     * @return commentList 评论数组
     * @return total 总评论数
     */
    function getComments(uint256 offset, uint256 limit) external view returns (
        Comment[] memory commentList,
        uint256 total
    );
    
    /**
     * @notice 获取项目统计信息
     * @return totalParticipants 总参与者数
     * @return totalLikes 总点赞数
     * @return lastActivityTime 最后活动时间
     * @return currentPoolUSD 兼容性字段，返回0
     */
    function getProjectStats() external view returns (
        uint256 totalParticipants,
        uint256 totalLikes,
        uint256 lastActivityTime,
        uint256 currentPoolUSD
    );
    
    /**
     * @notice 获取总参与者数量
     * @return 参与者总数
     */
    function getTotalParticipants() external view returns (uint256);
    
    /**
     * @notice 检查用户是否点赞了指定评论
     * @param user 用户地址
     * @param commentId 评论ID
     * @return 是否已点赞
     */
    function hasUserLikedComment(address user, uint256 commentId) external view returns (bool);
    
    /**
     * @notice 获取用户活动记录
     * @param user 用户地址
     * @param offset 偏移量
     * @param limit 每页数量
     * @return commentIds 用户评论ID数组
     * @return likedCommentIds 用户点赞的评论ID数组
     */
    function getUserActivity(address user, uint256 offset, uint256 limit) external view returns (
        uint256[] memory commentIds,
        uint256[] memory likedCommentIds
    );
    
    // ==================== 兼容性接口 ====================
    
    /**
     * @notice 兼容性函数 - 返回空的奖池信息
     */
    function getPoolInfo() external pure returns (
        Sponsorship[] memory sponsorships,
        uint256 totalUSDValue
    );
    
    /**
     * @notice 兼容性函数 - 返回0
     */
    function getPoolValueUSD() external view returns (uint256);
    
    /**
     * @notice 兼容性函数 - 返回空的用户统计
     */
    function getUserStats(address user) external pure returns (UserStats memory stats);
    
    /**
     * @notice 兼容性函数 - 返回空的CRT分解
     */
    function getUserCRTBreakdown(address user) external pure returns (
        uint256 commentTokens,
        uint256 likeTokens
    );
    
    /**
     * @notice 兼容性函数 - 返回空的详细活动
     */
    function getUserDetailedActivity(address user, uint256 offset, uint256 limit) external pure returns (
        Comment[] memory comments,
        Comment[] memory likedComments
    );
    
    /**
     * @notice 兼容性函数 - 返回空的精英评论
     */
    function getEliteComments() external pure returns (Comment[] memory);
    
    /**
     * @notice 兼容性函数 - 返回空的待领取奖励
     */
    function getPendingRewards(address user) external pure returns (
        address[] memory tokens,
        uint256[] memory amounts
    );
    
    /**
     * @notice 兼容性函数 - 空实现
     */
    function setCRTToken(address crtToken) external;
    
    /**
     * @notice 兼容性函数 - 重定向到Campaign系统
     */
    function sponsor(address token, uint256 amount) external;
    
    /**
     * @notice 兼容性函数 - 重定向到Campaign系统
     */
    function distributeRewards() external;
    
    /**
     * @notice 兼容性函数 - 重定向到Campaign系统
     */
    function claimRewards(address[] calldata tokens) external;
    
    // ==================== 状态变量访问器 ====================
    
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function description() external view returns (string memory);
    function category() external view returns (string memory);
    function creator() external view returns (address);
    function isActive() external view returns (bool);
    function platform() external view returns (address);
    function priceOracle() external view returns (address);
    function commentIdCounter() external view returns (uint256);
    function totalComments() external view returns (uint256);
    function totalLikes() external view returns (uint256);
    function lastActivityTime() external view returns (uint256);
    function drawPeriod() external view returns (uint16); // 兼容性
    function nextDrawTime() external view returns (uint256); // 兼容性

    // 测试
    function getCommentFlag(uint256 commentId) external view returns (uint256 flag);
}