// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IProjectFactory
 * @dev CoinReal 项目工厂合约接口
 * @notice 使用最小代理模式（EIP-1167）创建项目合约
 * 
 * 设计原理：
 * - 使用Clone模式大幅降低项目创建的Gas成本
 * - 所有项目共享同一个实现合约逻辑
 * - 每个项目都是独立的代理合约，拥有独立的存储空间
 * - 使用标准Clone创建，地址由网络状态决定
 * 
 * Gas优化：
 * - 标准合约部署：~2,000,000 gas
 * - 使用Clone模式：~50,000 gas
 * - 节省约95%的部署成本
 * 
 * 安全性：
 * - 实现合约不可升级，保证逻辑稳定性
 * - 每个代理合约拥有独立状态，互不影响
 * - 工厂合约仅负责创建，不参与项目治理
 */
interface IProjectFactory {
    
    // ==================== 事件定义 ====================
    
    /**
     * @dev 项目创建成功事件
     * @param project 新创建的项目代理合约地址
     * @param creator 项目创建者地址
     * @param name 项目名称
     * @param symbol 项目符号
     */
    event ProjectCreated(
        address indexed project, 
        address indexed creator,
        string name,
        string symbol
    );
    
    /**
     * @dev 实现合约更新事件
     * @param oldImplementation 旧实现合约地址
     * @param newImplementation 新实现合约地址
     */
    event ImplementationUpdated(
        address indexed oldImplementation,
        address indexed newImplementation
    );
    
    // ==================== 核心功能接口 ====================
    
    /**
     * @notice 创建新项目代理合约
     * @dev 使用EIP-1167最小代理模式克隆实现合约
     * 
     * 创建流程：
     * 1. 使用Clone创建最小代理合约
     * 2. 调用代理合约的initialize函数进行初始化
     * 3. 验证初始化成功
     * 4. 触发ProjectCreated事件
     * 
     * 使用标准Clone的优势：
     * - 更低的Gas消耗
     * - 简单的创建流程
     * - 避免地址冲突问题
     * 
     * @param name 项目名称（如：Bitcoin, Ethereum）
     * @param symbol 项目符号（如：BTC, ETH）
     * @param description 项目描述（最大1000字符）
     * @param category 项目分类（Layer1/DeFi/NFT/GameFi等）
     * @param drawPeriod 开奖周期（天数，范围1-30）
     * @param creator 项目创建者地址
     * @param priceOracle 价格预言机合约地址
     * @param platform 平台主合约地址
     * @return projectAddress 新创建的项目代理合约地址
     */
    function createProject(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata category,
        uint16 drawPeriod,
        address creator,
        address priceOracle,
        address platform
    ) external returns (address projectAddress);
    
    // ==================== 查询接口 ====================
    
    /**
     * @notice 获取项目实现合约地址
     * @dev 返回所有项目代理合约的逻辑实现地址
     * 
     * 用途：
     * - 前端验证合约版本
     * - 开发者检查实现逻辑
     * - 安全审计和验证
     * 
     * @return implementation 实现合约地址
     */
    function implementation() external view returns (address implementation);
    
    /**
     * @notice 验证项目合约是否由此工厂创建
     * @dev 检查地址是否为有效的项目代理合约
     * 
     * 验证方法：
     * - 检查合约是否存在
     * - 验证字节码是否匹配最小代理模式
     * - 验证实现合约地址是否正确
     * 
     * @param projectAddress 要验证的项目合约地址
     * @return isValid 是否为有效的项目合约
     */
    function isValidProject(address projectAddress) external view returns (bool isValid);
    
    /**
     * @notice 获取工厂合约统计信息
     * @dev 返回通过此工厂创建的项目数量等统计数据
     * 
     * @return totalProjects 总创建项目数
     * @return factoryVersion 工厂合约版本
     * @return creationFee 创建费用（如果有）
     */
    function getFactoryStats() external view returns (
        uint256 totalProjects,
        string memory factoryVersion,
        uint256 creationFee
    );
    
    // ==================== 管理接口 ====================
    
    /**
     * @notice 更新实现合约地址（仅管理员）
     * @dev 用于升级项目逻辑，仅影响新创建的项目
     * 
     * 重要说明：
     * - 已创建的项目不受影响
     * - 新项目将使用新的实现逻辑
     * - 需要谨慎测试新实现合约
     * 
     * @param newImplementation 新的实现合约地址
     */
    function updateImplementation(address newImplementation) external;
    
    /**
     * @notice 设置项目创建费用（仅管理员）
     * @dev 可选功能，用于防止垃圾项目创建
     * 
     * @param fee 创建费用（wei）
     * @param feeToken 费用代币地址（address(0)表示ETH）
     */
    function setCreationFee(uint256 fee, address feeToken) external;
    
    /**
     * @notice 暂停/恢复项目创建（仅管理员）
     * @dev 紧急情况下暂停新项目创建
     * 
     * @param paused 是否暂停
     */
    function setPaused(bool paused) external;
}