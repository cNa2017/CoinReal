// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICoinRealPlatform
 * @dev CoinReal 平台主合约接口
 * @notice 这是 CoinReal 去中心化内容社区平台的核心接口
 * 
 * 设计理念：
 * - 实现"评论即收益、点赞即赚币"的商业模式
 * - 管理项目创建和全局配置
 * - 统计平台整体数据和用户活动
 * - 提供项目排行榜和用户排行榜功能
 */
interface ICoinRealPlatform {
    
    // ==================== 事件定义 ====================
    
    /**
     * @dev 项目工厂合约更新事件
     * @param newFactory 新的工厂合约地址
     */
    event ProjectFactoryUpdated(address indexed newFactory);
    
    /**
     * @dev 价格预言机更新事件
     * @param newOracle 新的预言机地址
     */
    event PriceOracleUpdated(address indexed newOracle);
    
    /**
     * @dev 平台手续费更新事件
     * @param newFee 新的手续费率 (基点，例如 100 = 1%)
     */
    event PlatformFeeUpdated(uint256 newFee);
    
    /**
     * @dev 项目创建事件
     * @param project 新创建的项目地址
     * @param name 项目名称
     * @param creator 项目创建者地址
     */
    event ProjectCreated(address indexed project, string name, address indexed creator);
    
    // ==================== 数据结构定义 ====================
    
    /**
     * @dev 项目基本信息结构
     * @param projectAddress 项目合约地址
     * @param name 项目名称 (如：Bitcoin, Ethereum)
     * @param symbol 项目符号 (如：BTC, ETH)
     * @param creator 项目创建者地址
     * @param createdAt 项目创建时间戳
     * @param isActive 项目是否激活状态
     */
    struct ProjectInfo {
        address projectAddress;
        string name;
        string symbol;
        address creator;
        uint256 createdAt;
        bool isActive;
    }
    
    /**
     * @dev 项目详细数据结构（用于批量查询优化）
     * @param projectAddress 项目合约地址
     * @param name 项目名称
     * @param symbol 项目符号
     * @param description 项目描述
     * @param totalParticipants 总参与人数
     * @param totalComments 总评论数
     * @param totalLikes 总点赞数
     * @param poolValueUSD 奖池价值（USD，8位小数）
     * @param nextDrawTime 下次开奖时间
     * @param category 项目分类 (DeFi/NFT/GameFi/L1/L2等)
     * @param isActive 是否激活
     */
    struct ProjectDetailedData {
        address projectAddress;
        string name;
        string symbol;
        string description;
        uint256 totalParticipants;
        uint256 totalComments;
        uint256 totalLikes;
        uint256 poolValueUSD;
        uint256 nextDrawTime;
        string category;
        bool isActive;
    }
    
    // ==================== 核心功能接口 ====================
    
    /**
     * @notice 创建新项目 (仅平台管理员可调用)
     * @dev 通过工厂合约创建项目，自动配置CRT代币铸造权限
     * 
     * 业务逻辑：
     * 1. 验证调用者权限（仅owner）
     * 2. 通过ProjectFactory创建项目代理合约
     * 3. 为项目设置CRT代币铸造权限
     * 4. 注册项目到平台并分类存储
     * 5. 触发ProjectCreated事件
     * 
     * @param name 项目名称，长度1-100字符
     * @param symbol 项目符号，长度1-20字符
     * @param description 项目描述，最大1000字符
     * @param category 项目分类 (Layer1/Layer2/DeFi/NFT/GameFi/Infrastructure等)
     * @param drawPeriod 开奖周期（天数，范围1-30天）
     * @return projectAddress 新创建的项目合约地址
     */
    function createProject(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata category,
        uint16 drawPeriod
    ) external returns (address projectAddress);
    
    // ==================== 查询功能接口 ====================
    
    /**
     * @notice 分页获取所有项目列表
     * @dev 支持分页查询，避免gas limit问题
     * 
     * @param offset 起始索引（从0开始）
     * @param limit 返回数量限制（建议不超过50）
     * @return projects 项目信息数组
     * @return total 项目总数
     */
    function getProjects(uint256 offset, uint256 limit) external view returns (
        ProjectInfo[] memory projects,
        uint256 total
    );
    
    /**
     * @notice 根据分类获取项目列表
     * @dev 用于前端分类展示，如DeFi项目、NFT项目等
     * 
     * @param category 项目分类名称 (大小写敏感)
     * @return projects 该分类下的项目地址数组
     */
    function getProjectsByCategory(string calldata category) external view returns (address[] memory);
    
    /**
     * @notice 获取用户参与的所有项目
     * @dev 查询用户发表过评论或点赞的项目
     * 
     * @param user 用户钱包地址
     * @return projects 用户参与的项目地址数组
     */
    function getUserProjects(address user) external view returns (address[] memory);
    
    // ==================== 管理功能接口 ====================
    
    /**
     * @notice 更新价格预言机地址 (仅管理员)
     * @dev 用于升级价格预言机或切换数据源
     * 
     * @param newOracle 新的预言机合约地址，必须实现IPriceOracle接口
     */
    function updatePriceOracle(address newOracle) external;
    
    /**
     * @notice 设置项目工厂合约 (仅管理员)
     * @dev 用于升级项目创建逻辑
     * 
     * @param newFactory 新的工厂合约地址，必须实现IProjectFactory接口
     */
    function setProjectFactory(address newFactory) external;
    
    // ==================== 统计数据接口 ====================
    
    /**
     * @notice 获取平台全局统计数据
     * @dev 用于首页展示和数据分析
     * 
     * @return totalProjects 平台项目总数
     * @return totalUsers 平台用户总数（去重）
     * @return totalComments 平台评论总数（所有项目）
     * @return totalPoolValue 所有项目奖池总价值（USD，8位小数）
     */
    function getPlatformStats() external view returns (
        uint256 totalProjects,
        uint256 totalUsers,
        uint256 totalComments,
        uint256 totalPoolValue
    );
    
    /**
     * @notice 获取项目排行榜
     * @dev 支持多种排序方式，用于展示热门项目
     * 
     * 排序方式说明：
     * - 0: 按参与人数排序（最受关注）
     * - 1: 按评论数量排序（最活跃讨论）
     * - 2: 按奖池金额排序（最具价值）
     * - 3: 按最新活动排序（最新动态）
     * 
     * @param sortBy 排序方式（0-3）
     * @param offset 起始位置
     * @param limit 返回数量（建议不超过20）
     * @return projects 排序后的项目地址数组
     * @return stats 对应的统计数据数组
     */
    function getProjectLeaderboard(
        uint8 sortBy,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory projects,
        uint256[] memory stats
    );
    
    /**
     * @notice 获取用户排行榜
     * @dev 展示平台活跃用户和贡献者
     * 
     * 排序方式说明：
     * - 0: 按总CRT数量排序（总贡献度）
     * - 1: 按评论数量排序（内容贡献）
     * - 2: 按获赞数排序（质量贡献）
     * - 3: 按总收益排序（经济收益）
     * 
     * @param sortBy 排序方式（0-3）
     * @param offset 起始位置
     * @param limit 返回数量
     * @return users 排序后的用户地址数组
     * @return scores 对应的分数数组
     */
    function getUserLeaderboard(
        uint8 sortBy,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory users,
        uint256[] memory scores
    );
    
    /**
     * @notice 批量获取项目详细数据
     * @dev 前端优化接口，一次调用获取多个项目的完整信息
     * 
     * 使用场景：
     * - 项目列表页面数据加载
     * - 排行榜详细信息展示
     * - 用户收藏项目信息更新
     * 
     * @param projectAddresses 项目地址数组（建议不超过10个）
     * @return projectsData 项目详细数据数组
     */
    function batchGetProjectsData(
        address[] calldata projectAddresses
    ) external view returns (ProjectDetailedData[] memory projectsData);
    
    // ==================== 内部调用接口 ====================
    
    /**
     * @notice 记录用户活动 (仅项目合约可调用)
     * @dev 由项目合约调用，用于统计平台用户数据
     * 
     * 功能：
     * - 新用户首次活动时增加平台用户计数
     * - 更新用户最后活动时间
     * - 关联用户与项目的参与关系
     * 
     * @param user 用户地址
     */
    function recordUserActivity(address user) external;
    
    /**
     * @notice 记录评论统计 (仅项目合约可调用)
     * @dev 由项目合约调用，用于统计平台评论总数
     */
    function recordComment() external;
} 