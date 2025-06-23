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
 * - 支持Campaign奖励系统
 * - 统计平台整体数据和用户活动
 */
interface ICoinRealPlatform {
    
    // ==================== 事件定义 ====================
    
    /**
     * @dev 项目工厂合约更新事件
     * @param newFactory 新的工厂合约地址
     */
    event ProjectFactoryUpdated(address indexed newFactory);
    
    /**
     * @dev Campaign工厂合约更新事件
     * @param newFactory 新的Campaign工厂合约地址
     */
    event CampaignFactoryUpdated(address indexed newFactory);
    
    /**
     * @dev 价格预言机更新事件
     * @param newOracle 新的预言机地址
     */
    event PriceOracleUpdated(address indexed newOracle);
    
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
    
    // ==================== 核心功能接口 ====================
    
    /**
     * @notice 创建新项目 (仅平台管理员可调用)
     * @dev 通过工厂合约创建项目
     * 
     * 业务逻辑：
     * 1. 验证调用者权限（仅owner）
     * 2. 通过ProjectFactory创建项目代理合约
     * 3. 注册项目到平台并分类存储
     * 4. 触发ProjectCreated事件
     * 
     * @param name 项目名称，长度1-100字符
     * @param symbol 项目符号，长度1-20字符
     * @param description 项目描述，最大1000字符
     * @param category 项目分类 (Layer1/Layer2/DeFi/NFT/GameFi/Infrastructure等)
     * @param drawPeriod 开奖周期（天数，兼容性保留）
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
    
    /**
     * @notice 设置Campaign工厂合约 (仅管理员)
     * @dev 用于升级Campaign创建逻辑
     * 
     * @param newFactory 新的Campaign工厂合约地址，必须实现ICampaignFactory接口
     */
    function setCampaignFactory(address newFactory) external;
    
    /**
     * @notice 添加Campaign到项目 (仅Campaign工厂可调用)
     * @dev Campaign工厂创建Campaign后调用此方法将其添加到项目
     * 
     * @param projectAddress 项目地址
     * @param campaignAddress Campaign地址
     */
    function addCampaignToProject(address projectAddress, address campaignAddress) external;
    
    // ==================== 统计数据接口 ====================
    
    /**
     * @notice 获取平台全局统计数据
     * @dev 用于首页展示和数据分析
     * 
     * @return totalProjects 平台项目总数
     * @return totalUsers 平台用户总数（去重）
     * @return totalComments 平台评论总数（所有项目）
     * @return totalPoolValue 所有项目奖池总价值（USD，Campaign系统中为0）
     */
    function getPlatformStats() external view returns (
        uint256 totalProjects,
        uint256 totalUsers,
        uint256 totalComments,
        uint256 totalPoolValue
    );
    
    /**
     * @notice 获取项目排行榜
     * @dev 支持多种排序方式和分页
     * 
     * @param sortBy 排序方式：0=参与人数, 1=评论数, 2=奖池价值(已废弃), 3=最后活动时间
     * @param offset 起始索引
     * @param limit 返回数量限制
     * @return projects 项目地址数组（按排序）
     * @return stats 对应的统计数据
     */
    function getProjectLeaderboard(
        uint8 sortBy,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory projects,
        uint256[] memory stats
    );
    
    // ==================== 活动统计接口 ====================
    
    /**
     * @notice 记录用户活动 (仅项目合约可调用)
     * @dev 用于统计平台用户数
     * 
     * @param user 用户地址
     */
    function recordUserActivity(address user) external;
    
    /**
     * @notice 记录评论数量 (仅项目合约可调用)
     * @dev 用于统计平台评论总数
     */
    function recordComment() external;
    
    // ==================== 查询接口 ====================
    
    /**
     * @notice 检查是否为有效项目
     * @param project 项目地址
     * @return 是否为平台注册的项目
     */
    function isProject(address project) external view returns (bool);
    
    /**
     * @notice 获取项目工厂地址
     * @return 当前项目工厂合约地址
     */
    function projectFactory() external view returns (address);
    
    /**
     * @notice 获取Campaign工厂地址
     * @return 当前Campaign工厂合约地址
     */
    function campaignFactory() external view returns (address);
    
    /**
     * @notice 获取价格预言机地址
     * @return 当前价格预言机合约地址
     */
    function priceOracle() external view returns (address);
    
    /**
     * @notice 获取平台所有者
     * @return 平台所有者地址
     */
    function owner() external view returns (address);
} 