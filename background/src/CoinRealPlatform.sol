// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ICoinRealPlatform.sol";
import "./interfaces/IProjectFactory.sol";
import "./interfaces/IProject.sol";
import "./CRTToken.sol";

contract CoinRealPlatform is ICoinRealPlatform {
    address public owner;
    address public projectFactory;
    address public priceOracle;
    address public crtToken;
    
    // Project tracking
    address[] public allProjects;
    mapping(address => bool) public isProject;
    mapping(string => address[]) public projectsByCategory;
    mapping(address => address[]) public userProjects;
    
    // Stats tracking
    uint256 public totalUsers;
    uint256 public totalComments;
    mapping(address => bool) public isUser;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _priceOracle) {
        require(_priceOracle != address(0), "Invalid price oracle");
        owner = msg.sender;
        priceOracle = _priceOracle;
        
        // Deploy CRT token
        crtToken = address(new CRTToken());
    }
    
    function createProject(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata category,
        uint16 drawPeriod
    ) external onlyOwner returns (address projectAddress) {
        require(projectFactory != address(0), "Factory not set");
        require(bytes(name).length > 0, "Name required");
        require(drawPeriod > 0, "Invalid draw period");
        
        // Create project via factory
        projectAddress = IProjectFactory(projectFactory).createProject(
            name,
            symbol,
            description,
            category,
            drawPeriod,
            msg.sender,
            priceOracle,
            address(this)
        );
        
        // Set CRT token for the project
        IProject(projectAddress).setCRTToken(crtToken);
        
        // Add CRT minter permission
        CRTToken(crtToken).addMinter(projectAddress);
        
        // Track project
        allProjects.push(projectAddress);
        isProject[projectAddress] = true;
        projectsByCategory[category].push(projectAddress);
        userProjects[msg.sender].push(projectAddress);
        
        emit ProjectCreated(projectAddress, name, msg.sender);
    }
    
    function getProjects(uint256 offset, uint256 limit) external view returns (
        ProjectInfo[] memory projects,
        uint256 total
    ) {
        total = allProjects.length;
        
        if (offset >= total) {
            return (new ProjectInfo[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        projects = new ProjectInfo[](end - offset);
        for (uint256 i = 0; i < end - offset; i++) {
            address projectAddr = allProjects[offset + i];
            IProject project = IProject(projectAddr);
            
            projects[i] = ProjectInfo({
                projectAddress: projectAddr,
                name: project.name(),
                symbol: project.symbol(),
                creator: project.creator(),
                createdAt: 0, // Could add creation timestamp
                isActive: project.isActive()
            });
        }
    }
    
    function getProjectsByCategory(string calldata category) external view returns (address[] memory) {
        return projectsByCategory[category];
    }
    
    function getUserProjects(address user) external view returns (address[] memory) {
        return userProjects[user];
    }
    
    function updatePriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle");
        priceOracle = newOracle;
        emit PriceOracleUpdated(newOracle);
    }
    
    function setProjectFactory(address newFactory) external onlyOwner {
        require(newFactory != address(0), "Invalid factory");
        projectFactory = newFactory;
        emit ProjectFactoryUpdated(newFactory);
    }
    
    function getPlatformStats() external view returns (
        uint256 _totalProjects,
        uint256 _totalUsers,
        uint256 _totalComments,
        uint256 totalPoolValue
    ) {
        _totalProjects = allProjects.length;
        _totalUsers = totalUsers;
        _totalComments = totalComments;
        
        // Calculate total pool value across all projects
        for (uint256 i = 0; i < allProjects.length; i++) {
            (, uint256 projectPoolValue) = IProject(allProjects[i]).getPoolInfo();
            totalPoolValue += projectPoolValue;
        }
    }
    
    function getProjectLeaderboard(
        uint8 sortBy,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory projects,
        uint256[] memory stats
    ) {
        uint256 total = allProjects.length;
        
        if (offset >= total || limit == 0) {
            return (new address[](0), new uint256[](0));
        }
        
        // Get stats for all projects
        uint256[] memory allStats = new uint256[](total);
        
        for (uint256 i = 0; i < total; i++) {
            IProject project = IProject(allProjects[i]);
            
            if (sortBy == 0) { // By participants
                (uint256 participants,,,) = project.getProjectStats();
                allStats[i] = participants;
            } else if (sortBy == 1) { // By comments
                allStats[i] = project.totalComments();
            } else if (sortBy == 2) { // By pool value
                (, uint256 poolValue) = project.getPoolInfo();
                allStats[i] = poolValue;
            } else if (sortBy == 3) { // By last activity
                (,, uint256 lastActivity,) = project.getProjectStats();
                allStats[i] = lastActivity;
            }
        }
        
        // Create index array for sorting
        uint256[] memory indices = new uint256[](total);
        for (uint256 i = 0; i < total; i++) {
            indices[i] = i;
        }
        
        // Simple bubble sort (for demonstration - use more efficient sorting in production)
        for (uint256 i = 0; i < total - 1; i++) {
            for (uint256 j = 0; j < total - i - 1; j++) {
                if (allStats[indices[j]] < allStats[indices[j + 1]]) {
                    uint256 temp = indices[j];
                    indices[j] = indices[j + 1];
                    indices[j + 1] = temp;
                }
            }
        }
        
        // Return requested page
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 size = end - offset;
        projects = new address[](size);
        stats = new uint256[](size);
        
        for (uint256 i = 0; i < size; i++) {
            uint256 idx = indices[offset + i];
            projects[i] = allProjects[idx];
            stats[i] = allStats[idx];
        }
    }
    
    function getUserLeaderboard(
        uint8 sortBy,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory users,
        uint256[] memory scores
    ) {
        // Simplified implementation - in production, track users globally
        revert("Not implemented");
    }
    
    function batchGetProjectsData(
        address[] calldata projectAddresses
    ) external view returns (ProjectDetailedData[] memory projectsData) {
        projectsData = new ProjectDetailedData[](projectAddresses.length);
        
        for (uint256 i = 0; i < projectAddresses.length; i++) {
            IProject project = IProject(projectAddresses[i]);
            
            (uint256 participants, uint256 likes, uint256 lastActivity, uint256 poolUSD) = project.getProjectStats();
            
            projectsData[i] = ProjectDetailedData({
                projectAddress: projectAddresses[i],
                name: project.name(),
                symbol: project.symbol(),
                description: project.description(),
                totalParticipants: participants,
                totalComments: project.totalComments(),
                totalLikes: likes,
                poolValueUSD: poolUSD,
                nextDrawTime: project.nextDrawTime(),
                category: project.category(),
                isActive: project.isActive()
            });
        }
    }
    
    // Function to track user and comment stats (called by projects)
    function recordUserActivity(address user) external {
        require(isProject[msg.sender], "Only projects can call");
        if (!isUser[user]) {
            isUser[user] = true;
            totalUsers++;
        }
    }
    
    function recordComment() external {
        require(isProject[msg.sender], "Only projects can call");
        totalComments++;
    }
} 