// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IProject
 * @dev CoinReal 项目合约接口
 * @notice 管理单个项目的评论、点赞和奖池系统
 * 
 * 核心功能：
 * - 评论系统：用户发表评论获得CRT奖励
 * - 点赞系统：点赞他人评论获得CRT，被点赞者获得额外奖励
 * - 奖池系统：接受多种代币赞助，按CRT占比分配奖励
 * - 精英评论：点赞数前10的评论获得额外奖励
 * - 开奖机制：定期分配奖池资金给参与者
 * 
 * CRT奖励机制：
 * - 发表评论：5 CRT
 * - 点赞评论：1 CRT (点赞者) + 1 CRT (被点赞者)
 * - 精英评论：额外15%奖池奖励
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
     * @dev 赞助添加事件
     * @param sponsor 赞助者地址
     * @param token 赞助代币地址
     * @param amount 赞助数量
     */
    event SponsorshipAdded(address indexed sponsor, address token, uint256 amount);
    
    /**
     * @dev 奖励分配事件
     * @param timestamp 分配时间戳
     * @param totalComments 总评论数
     * @param totalLikes 总点赞数
     */
    event RewardsDistributed(uint256 timestamp, uint256 totalComments, uint256 totalLikes);
    
    // ==================== 数据结构定义 ====================
    
    /**
     * @dev 评论数据结构
     * @param id 评论唯一ID（自增，保证时间顺序）
     * @param author 评论作者地址
     * @param content 评论内容（10-1000字符）
     * @param likes 点赞数量
     * @param crtReward 该评论累计获得的CRT奖励
     * @param isElite 是否为精英评论（点赞数前10）
     * @param timestamp 发布时间戳
     */
    struct Comment {
        uint256 id;
        address author;
        string content;
        uint256 likes;
        uint256 crtReward;
        bool isElite;
        uint32 timestamp;
    }
    
    /**
     * @dev 赞助记录结构
     * @param token 赞助代币地址
     * @param amount 赞助数量
     * @param sponsor 赞助者地址
     * @param timestamp 赞助时间戳
     */
    struct Sponsorship {
        address token;
        uint256 amount;
        address sponsor;
        uint32 timestamp;
    }
    
    /**
     * @dev 用户统计数据结构
     * @param totalComments 用户总评论数
     * @param totalLikes 用户总点赞数
     * @param totalCRT 用户总CRT数量
     * @param claimedRewards 用户已领取的奖励价值
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
     * 初始化流程：
     * 1. 设置项目基本信息
     * 2. 设置开奖周期和下次开奖时间
     * 3. 激活项目状态
     * 4. 记录创建时间
     * 
     * @param _name 项目名称（如：Bitcoin）
     * @param _symbol 项目符号（如：BTC）
     * @param _description 项目描述
     * @param _category 项目分类（Layer1/DeFi/NFT等）
     * @param _drawPeriod 开奖周期（天数，1-30天）
     * @param _creator 创建者地址
     * @param _priceOracle 价格预言机地址
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
    
    /**
     * @notice 设置CRT代币地址
     * @dev 仅在初始化过程中调用，用于配置CRT代币铸造
     * 
     * @param _crtToken CRT代币合约地址
     */
    function setCRTToken(address _crtToken) external;
    
    // ==================== 用户交互接口 ====================
    
    /**
     * @notice 发表评论
     * @dev 用户发表评论获得5个CRT奖励
     * 
     * 业务规则：
     * - 评论内容长度限制：10-1000字符
     * - 自动获得5个CRT基础奖励
     * - 评论ID自增，保证时间顺序
     * - 更新用户统计数据
     * - 首次参与的用户会被记录到参与者列表
     * 
     * @param content 评论内容
     * @return commentId 新创建的评论ID
     */
    function postComment(string calldata content) external returns (uint256 commentId);
    
    /**
     * @notice 点赞评论
     * @dev 点赞者和被点赞者都获得1个CRT奖励
     * 
     * 业务规则：
     * - 每个用户只能对同一评论点赞一次
     * - 点赞者获得1个CRT奖励
     * - 被点赞者获得1个CRT奖励
     * - 更新评论的点赞数和CRT奖励
     * - 可能更新精英评论排名
     * 
     * @param commentId 要点赞的评论ID
     */
    function likeComment(uint256 commentId) external;
    
    /**
     * @notice 赞助项目奖池
     * @dev 向项目奖池添加代币，最低100 USD等值
     * 
     * 业务规则：
     * - 最低赞助金额100 USD（通过预言机验证）
     * - 支持任何ERC20代币
     * - 代币转移到项目合约
     * - 记录赞助历史
     * - 更新奖池代币余额
     * 
     * @param token 赞助代币地址
     * @param amount 赞助数量
     */
    function sponsor(address token, uint256 amount) external;
    
    /**
     * @notice 触发开奖并分配奖励
     * @dev 按照预设规则分配奖池资金
     * 
     * 分配规则：
     * - 60%：按CRT占比分配给所有参与者
     * - 25%：按点赞数占比分配给点赞者
     * - 15%：平均分配给精英评论者（点赞数前10）
     * 
     * 触发条件：
     * - 达到开奖周期时间
     * - 至少有1条评论
     * - 至少有1个参与者
     * 
     * 执行流程：
     * 1. 计算总CRT和精英评论CRT
     * 2. 标记精英评论
     * 3. 为每种代币按比例分配奖励
     * 4. 更新用户待领取奖励
     * 5. 重置周期数据
     */
    function distributeRewards() external;
    
    /**
     * @notice 用户领取奖励
     * @dev 用户领取分配给自己的奖励代币
     * 
     * @param tokens 要领取的代币地址数组
     */
    function claimRewards(address[] calldata tokens) external;
    
    // ==================== 基础查询接口 ====================
    
    /**
     * @notice 项目名称
     */
    function name() external view returns (string memory);
    
    /**
     * @notice 项目符号
     */
    function symbol() external view returns (string memory);
    
    /**
     * @notice 项目描述
     */
    function description() external view returns (string memory);
    
    /**
     * @notice 项目分类
     */
    function category() external view returns (string memory);
    
    /**
     * @notice 项目创建者
     */
    function creator() external view returns (address);
    
    /**
     * @notice 项目是否激活
     */
    function isActive() external view returns (bool);
    
    /**
     * @notice 总评论数
     */
    function totalComments() external view returns (uint256);
    
    /**
     * @notice 下次开奖时间
     */
    function nextDrawTime() external view returns (uint256);
    
    // ==================== 详细查询接口 ====================
    
    /**
     * @notice 获取单条评论详情
     * @param commentId 评论ID
     * @return comment 评论完整信息
     */
    function getComment(uint256 commentId) external view returns (Comment memory comment);
    
    /**
     * @notice 分页获取评论列表
     * @dev 支持分页查询，按时间顺序排列
     * 
     * @param offset 起始位置
     * @param limit 返回数量限制
     * @return comments 评论数组
     * @return total 总评论数
     */
    function getComments(uint256 offset, uint256 limit) external view returns (
        Comment[] memory comments, 
        uint256 total
    );
    
    /**
     * @notice 获取精英评论列表
     * @dev 返回点赞数最多的前10条评论
     * 
     * 排序规则：
     * - 按点赞数降序
     * - 点赞数相同时，按评论ID升序（早发布的优先）
     * 
     * @return eliteComments 精英评论数组
     */
    function getEliteComments() external view returns (Comment[] memory eliteComments);
    
    /**
     * @notice 获取用户统计数据
     * @param user 用户地址
     * @return stats 用户在该项目的统计信息
     */
    function getUserStats(address user) external view returns (UserStats memory stats);
    
    /**
     * @notice 获取奖池信息
     * @return sponsorships 所有赞助记录
     * @return totalUSDValue 奖池总USD价值（8位小数）
     */
    function getPoolInfo() external view returns (
        Sponsorship[] memory sponsorships,
        uint256 totalUSDValue
    );
    
    /**
     * @notice 获取用户待领取奖励
     * @param user 用户地址
     * @return tokens 可领取的代币地址数组
     * @return amounts 对应的可领取数量数组
     */
    function getPendingRewards(address user) external view returns (
        address[] memory tokens,
        uint256[] memory amounts
    );
    
    /**
     * @notice 检查用户是否已点赞某评论
     * @param user 用户地址
     * @param commentId 评论ID
     * @return hasLiked 是否已点赞
     */
    function hasUserLikedComment(address user, uint256 commentId) external view returns (bool hasLiked);
    
    /**
     * @notice 获取项目统计数据
     * @return totalParticipants 总参与人数
     * @return totalLikes 总点赞数
     * @return lastActivityTime 最后活动时间
     * @return currentPoolUSD 当前奖池USD价值
     */
    function getProjectStats() external view returns (
        uint256 totalParticipants,
        uint256 totalLikes,
        uint256 lastActivityTime,
        uint256 currentPoolUSD
    );
    
    /**
     * @notice 获取用户活动历史
     * @dev 获取用户在该项目的所有活动记录
     * 
     * @param user 用户地址
     * @param offset 起始位置
     * @param limit 返回数量限制
     * @return commentIds 用户发表的评论ID数组
     * @return likedCommentIds 用户点赞的评论ID数组
     */
    function getUserActivity(address user, uint256 offset, uint256 limit) external view returns (
        uint256[] memory commentIds,
        uint256[] memory likedCommentIds
    );

    /**
     * @notice 获取用户CRT来源分组统计
     * @dev 返回用户从评论和点赞分别获得的CRT数量
     * 
     * @param user 用户地址
     * @return commentTokens 从评论获得的CRT数量
     * @return likeTokens 从点赞获得的CRT数量
     */
    function getUserCRTBreakdown(address user) external view returns (
        uint256 commentTokens,
        uint256 likeTokens
    );

    /**
     * @notice 获取用户在该项目的详细活动历史
     * @dev 返回用户的所有评论和点赞记录，支持分页
     * 
     * @param user 用户地址
     * @param offset 起始位置
     * @param limit 返回数量限制
     * @return comments 用户发表的评论数组
     * @return likedComments 用户点赞的评论数组
     */
    function getUserDetailedActivity(address user, uint256 offset, uint256 limit) external view returns (
        Comment[] memory comments,
        Comment[] memory likedComments
    );

    /**
     * @notice 获取项目奖池USD价值（兼容前端字段名）
     * @dev 别名方法，返回与getProjectStats()相同的currentPoolUSD值
     * 
     * @return poolValueUSD 奖池USD价值（8位小数精度）
     */
    function getPoolValueUSD() external view returns (uint256 poolValueUSD);
} 