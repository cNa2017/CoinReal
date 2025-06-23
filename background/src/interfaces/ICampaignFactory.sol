// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICampaignFactory {
    // ====== 事件定义 ======
    event CampaignCreated(
        address indexed campaign,
        address indexed project,
        address indexed sponsor,
        string sponsorName
    );
    
    event ImplementationUpdated(address oldImplementation, address newImplementation);
    
    // ====== 核心功能函数 ======
    
    /**
     * @dev 创建Campaign
     * @param projectAddress 项目合约地址
     * @param sponsorName 赞助者名称
     * @param duration 活动持续天数
     * @param rewardToken 奖励代币地址
     * @param rewardAmount 奖励代币数量
     */
    function createCampaign(
        address projectAddress,
        string calldata sponsorName,
        uint256 duration,
        address rewardToken,
        uint256 rewardAmount
    ) external returns (address campaign);
    
    /**
     * @dev 获取项目的所有Campaign
     */
    function getProjectCampaigns(address projectAddress) external view returns (address[] memory);
    
    /**
     * @dev 验证是否为有效的Campaign
     */
    function isValidCampaign(address campaignAddress) external view returns (bool);
    
    /**
     * @dev 获取所有Campaign
     */
    function getAllCampaigns(uint256 offset, uint256 limit) external view returns (
        address[] memory campaigns,
        uint256 total
    );
    
    /**
     * @dev 更新实现合约 - 只有owner可以调用
     */
    function updateImplementation(address newImplementation) external;
    
    /**
     * @dev 获取工厂统计信息
     */
    function getFactoryStats() external view returns (
        uint256 totalCampaigns,
        string memory factoryVersion,
        uint256 nextCampaignId
    );
    
    // ====== 状态变量的getter函数 ======
    function implementation() external view returns (address);
    function campaignIdCounter() external view returns (uint256);
    function projectCampaigns(address project, uint256 index) external view returns (address);
    function isCampaign(address campaign) external view returns (bool);
    function allCampaigns(uint256 index) external view returns (address);
} 