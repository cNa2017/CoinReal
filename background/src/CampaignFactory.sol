// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Campaign.sol";
import "./interfaces/IProject.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ICoinRealPlatform.sol";

contract CampaignFactory is Ownable {
    using Clones for address;
    
    address public implementation;
    address public platform; // 添加平台地址字段
    uint256 public campaignIdCounter;
    
    // Campaign tracking
    mapping(address => address[]) public projectCampaigns; // project => campaigns[]
    mapping(address => bool) public isCampaign;
    address[] public allCampaigns;
    
    event CampaignCreated(
        address indexed campaign,
        address indexed project,
        address indexed sponsor,
        string sponsorName
    );
    
    event ImplementationUpdated(address oldImplementation, address newImplementation);
    event PlatformUpdated(address indexed newPlatform);
    
    constructor(address _implementation) Ownable(msg.sender) {
        require(_implementation != address(0), "Invalid implementation");
        implementation = _implementation;
    }
    
    /**
     * @dev 设置平台地址 - 只有owner可以调用
     */
    function setPlatform(address _platform) external onlyOwner {
        require(_platform != address(0), "Invalid platform");
        platform = _platform;
        emit PlatformUpdated(_platform);
    }
    
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
    ) external returns (address campaign) {
        require(projectAddress != address(0), "Invalid project address");
        require(bytes(sponsorName).length > 0, "Sponsor name required");
        require(duration > 0 && duration <= 365, "Invalid duration");
        require(rewardToken != address(0), "Invalid reward token");
        require(rewardAmount > 0, "Invalid reward amount");
        require(platform != address(0), "Platform not set");
        
        // 获取项目名称
        string memory projectName = IProject(projectAddress).name();
        
        // 生成Campaign ID
        uint256 campaignId = ++campaignIdCounter;
        
        // 使用最小代理模式创建Campaign
        campaign = implementation.clone();
        
        // 先转移代币到Factory，然后再转给Campaign
        IERC20(rewardToken).transferFrom(msg.sender, address(this), rewardAmount);
        IERC20(rewardToken).transfer(campaign, rewardAmount);
        
        // 初始化Campaign
        Campaign(campaign).initialize(
            projectAddress,
            msg.sender,        // sponsor
            sponsorName,
            duration,
            rewardToken,
            rewardAmount,
            platform,         // 使用正确的平台地址
            projectName,
            campaignId
        );
        
        // 记录Campaign
        projectCampaigns[projectAddress].push(campaign);
        isCampaign[campaign] = true;
        allCampaigns.push(campaign);
        
        // 通过平台通知Project合约添加Campaign
        ICoinRealPlatform(platform).addCampaignToProject(projectAddress, campaign);
        
        emit CampaignCreated(campaign, projectAddress, msg.sender, sponsorName);
    }
    
    /**
     * @dev 获取项目的所有Campaign
     */
    function getProjectCampaigns(address projectAddress) external view returns (address[] memory) {
        return projectCampaigns[projectAddress];
    }
    
    /**
     * @dev 验证是否为有效的Campaign
     */
    function isValidCampaign(address campaignAddress) external view returns (bool) {
        return isCampaign[campaignAddress];
    }
    
    /**
     * @dev 获取所有Campaign
     */
    function getAllCampaigns(uint256 offset, uint256 limit) external view returns (
        address[] memory campaigns,
        uint256 total
    ) {
        total = allCampaigns.length;
        
        if (offset >= total) {
            return (new address[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        campaigns = new address[](end - offset);
        for (uint256 i = 0; i < end - offset; i++) {
            campaigns[i] = allCampaigns[offset + i];
        }
    }
    
    /**
     * @dev 更新实现合约 - 只有owner可以调用
     */
    function updateImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        address oldImplementation = implementation;
        implementation = newImplementation;
        emit ImplementationUpdated(oldImplementation, newImplementation);
    }
    
    /**
     * @dev 获取工厂统计信息
     */
    function getFactoryStats() external view returns (
        uint256 totalCampaigns,
        string memory factoryVersion,
        uint256 nextCampaignId
    ) {
        totalCampaigns = allCampaigns.length;
        factoryVersion = "1.0.0";
        nextCampaignId = campaignIdCounter + 1;
    }
} 