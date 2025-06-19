// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICoinRealPlatform {
    // Events
    event ProjectFactoryUpdated(address indexed newFactory);
    event PriceOracleUpdated(address indexed newOracle);
    event PlatformFeeUpdated(uint256 newFee);
    event ProjectCreated(address indexed project, string name, address indexed creator);
    
    // Structs
    struct ProjectInfo {
        address projectAddress;
        string name;
        string symbol;
        address creator;
        uint256 createdAt;
        bool isActive;
    }
    
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
    
    // Functions
    function createProject(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata category,
        uint16 drawPeriod
    ) external returns (address projectAddress);
    
    function getProjects(uint256 offset, uint256 limit) external view returns (
        ProjectInfo[] memory projects,
        uint256 total
    );
    
    function getProjectsByCategory(string calldata category) external view returns (address[] memory);
    function getUserProjects(address user) external view returns (address[] memory);
    function updatePriceOracle(address newOracle) external;
    function setProjectFactory(address newFactory) external;
    
    function getPlatformStats() external view returns (
        uint256 totalProjects,
        uint256 totalUsers,
        uint256 totalComments,
        uint256 totalPoolValue
    );
    
    function getProjectLeaderboard(
        uint8 sortBy,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory projects,
        uint256[] memory stats
    );
    
    function getUserLeaderboard(
        uint8 sortBy,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory users,
        uint256[] memory scores
    );
    
    function batchGetProjectsData(
        address[] calldata projectAddresses
    ) external view returns (ProjectDetailedData[] memory projectsData);
} 