// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPriceOracle
 * @dev CoinReal 价格预言机接口
 * @notice 提供代币USD价值查询服务，支持多代币批量查询
 * 
 * 设计目标：
 * - 为赞助金额验证提供准确的USD价值
 * - 支持多种ERC20代币的价格查询
 * - 提供批量查询功能，优化Gas消耗
 * - 确保价格数据的时效性和准确性
 * 
 * 价格精度：
 * - 所有价格以8位小数精度返回（类似Chainlink标准）
 * - 例如：$1.00 = 100000000 (1 * 10^8)
 * - 例如：$2000.50 = 200050000000 (2000.5 * 10^8)
 * 
 * 支持的代币类型：
 * - 主流稳定币：USDT, USDC, DAI, BUSD等
 * - 主流代币：ETH, BTC, BNB, MATIC等
 * - 支持自定义代币价格设置
 * 
 * 数据来源：
 * - Chainlink Price Feeds（推荐）
 * - 多DEX聚合价格（如Uniswap TWAP）
 * - 中心化交易所API（备用）
 * - 管理员手动设置（测试环境）
 */
interface IPriceOracle {
    
    // ==================== 事件定义 ====================
    
    /**
     * @dev 价格更新事件
     * @param token 代币地址
     * @param price 新价格（8位小数）
     * @param timestamp 更新时间戳
     */
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    
    /**
     * @dev 价格数据源添加事件
     * @param token 代币地址
     * @param dataSource 数据源地址（如Chainlink聚合器）
     * @param sourceType 数据源类型（0:Chainlink, 1:DEX, 2:Manual）
     */
    event DataSourceAdded(address indexed token, address indexed dataSource, uint8 sourceType);
    
    /**
     * @dev 价格偏差警告事件
     * @param token 代币地址
     * @param expectedPrice 预期价格
     * @param actualPrice 实际价格
     * @param deviation 偏差百分比
     */
    event PriceDeviationWarning(address indexed token, uint256 expectedPrice, uint256 actualPrice, uint256 deviation);
    
    // ==================== 核心查询接口 ====================
    
    /**
     * @notice 获取代币的USD价值
     * @dev 根据当前价格计算指定数量代币的USD价值
     * 
     * 计算公式：
     * USD Value = (token_amount * token_price) / (10^token_decimals)
     * 
     * 示例：
     * - 1 USDC (6 decimals) = 1000000
     * - USDC price = 100000000 ($1.00 with 8 decimals)
     * - USD Value = (1000000 * 100000000) / 10^6 = 100000000 ($1.00)
     * 
     * 错误处理：
     * - 代币价格未设置时返回0或抛出异常
     * - 代币地址无效时抛出异常
     * - 价格数据过期时抛出异常
     * 
     * @param token 代币合约地址
     * @param amount 代币数量（原始精度）
     * @return usdValue 对应的USD价值（8位小数精度）
     */
    function getUSDValue(address token, uint256 amount) external view returns (uint256 usdValue);
    
    /**
     * @notice 批量获取多个代币的USD价值总和
     * @dev 优化版本，一次调用获取多个代币的总价值
     * 
     * 使用场景：
     * - 计算项目奖池总价值
     * - 验证多代币赞助的总金额
     * - 用户资产组合价值计算
     * 
     * Gas优化：
     * - 避免多次外部调用的Gas开销
     * - 批量处理价格查询
     * - 减少RPC调用次数
     * 
     * @param tokens 代币地址数组
     * @param amounts 对应的代币数量数组
     * @return totalUSDValue 所有代币的USD价值总和（8位小数）
     */
    function getBatchUSDValue(
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external view returns (uint256 totalUSDValue);
    
    // ==================== 价格信息查询接口 ====================
    
    /**
     * @notice 获取代币当前价格
     * @dev 返回代币相对于USD的价格，不需要数量计算
     * 
     * @param token 代币地址
     * @return price 代币价格（8位小数，USD计价）
     * @return lastUpdate 最后更新时间戳
     */
    function getPrice(address token) external view returns (uint256 price, uint256 lastUpdate);
    
    /**
     * @notice 批量获取多个代币的价格
     * @dev 批量查询优化版本
     * 
     * @param tokens 代币地址数组
     * @return prices 对应的价格数组（8位小数）
     * @return lastUpdates 对应的最后更新时间数组
     */
    function getBatchPrices(address[] calldata tokens) external view returns (
        uint256[] memory prices,
        uint256[] memory lastUpdates
    );
    
    /**
     * @notice 检查代币价格是否可用
     * @dev 验证代币是否有有效的价格数据
     * 
     * @param token 代币地址
     * @return isAvailable 价格是否可用
     * @return stalePeriod 价格过期时间（秒）
     */
    function isPriceAvailable(address token) external view returns (bool isAvailable, uint256 stalePeriod);
    
    /**
     * @notice 获取支持的代币列表
     * @dev 返回所有配置了价格数据源的代币
     * 
     * @return tokens 支持的代币地址数组
     * @return symbols 对应的代币符号数组
     */
    function getSupportedTokens() external view returns (
        address[] memory tokens,
        string[] memory symbols
    );
    
    // ==================== 价格验证接口 ====================
    
    /**
     * @notice 验证价格是否在合理范围内
     * @dev 检查价格是否存在异常偏差
     * 
     * 验证规则：
     * - 价格不能为0
     * - 价格不能超过历史最高价的10倍
     * - 价格不能低于历史最低价的0.1倍
     * - 价格更新时间不能超过24小时
     * 
     * @param token 代币地址
     * @param expectedPrice 预期价格（8位小数）
     * @return isValid 价格是否有效
     * @return deviation 偏差百分比（基点，10000 = 100%）
     */
    function validatePrice(address token, uint256 expectedPrice) external view returns (
        bool isValid,
        uint256 deviation
    );
    
    /**
     * @notice 获取价格历史范围
     * @dev 返回代币的历史价格范围，用于异常检测
     * 
     * @param token 代币地址
     * @param period 时间周期（天数）
     * @return minPrice 最低价格
     * @return maxPrice 最高价格
     * @return avgPrice 平均价格
     */
    function getPriceRange(address token, uint256 period) external view returns (
        uint256 minPrice,
        uint256 maxPrice,
        uint256 avgPrice
    );
    
    // ==================== 管理接口 ====================
    
    /**
     * @notice 添加价格数据源（仅管理员）
     * @dev 为代币配置价格数据源
     * 
     * 数据源类型：
     * - 0: Chainlink Price Feed
     * - 1: DEX聚合价格
     * - 2: 手动设置价格
     * - 3: 外部API价格
     * 
     * @param token 代币地址
     * @param dataSource 数据源地址
     * @param sourceType 数据源类型
     */
    function addDataSource(address token, address dataSource, uint8 sourceType) external;
    
    /**
     * @notice 手动设置代币价格（仅管理员）
     * @dev 用于测试环境或应急情况
     * 
     * @param token 代币地址
     * @param price 价格（8位小数）
     */
    function setPrice(address token, uint256 price) external;
    
    /**
     * @notice 设置价格过期时间（仅管理员）
     * @dev 配置价格数据的有效期
     * 
     * @param stalePeriod 过期时间（秒）
     */
    function setStalePeriod(uint256 stalePeriod) external;
    
    /**
     * @notice 紧急暂停价格更新（仅管理员）
     * @dev 用于应急情况下暂停价格服务
     * 
     * @param paused 是否暂停
     */
    function setPaused(bool paused) external;
} 