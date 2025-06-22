// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import "../src/CoinRealPlatform.sol";
import "../src/ProjectFactory.sol";
import "../src/Project.sol";
import "../src/CRTToken.sol";
import "../src/mocks/MockPriceOracle.sol";
import "../src/mocks/MockERC20.sol";

contract DeployTest is Test {
    // 合约实例
    CoinRealPlatform public platform;
    CRTToken public crtToken;
    MockPriceOracle public priceOracle;
    ProjectFactory public factory;
    Project public projectImpl;
    
    // Mock tokens
    MockERC20 public usdc;
    MockERC20 public weth;
    MockERC20 public dai;
    
    // 项目地址
    address public btcProject;
    address public ethProject;
    address public solProject;
    
    // 测试用户
    address public deployer;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    function setUp() public {
        // 获取部署者地址
        deployer = address(this);
        vm.deal(deployer, 100 ether);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        
        // 直接在测试中部署所有合约
        _deployContracts();
    }
    
    function _deployContracts() private {
        // 部署MockPriceOracle
        priceOracle = new MockPriceOracle();
        console.log("MockPriceOracle deployed at:", address(priceOracle));
        
        // 部署CoinRealPlatform
        platform = new CoinRealPlatform(address(priceOracle));
        console.log("CoinRealPlatform deployed at:", address(platform));
        
        // 获取CRT Token
        crtToken = CRTToken(platform.crtToken());
        console.log("CRTToken deployed at:", address(crtToken));
        
        // 部署Project implementation
        projectImpl = new Project();
        console.log("Project implementation deployed at:", address(projectImpl));
        
        // 部署ProjectFactory
        factory = new ProjectFactory(address(projectImpl));
        console.log("ProjectFactory deployed at:", address(factory));
        
        // 设置factory
        platform.setProjectFactory(address(factory));
        
        // 部署mock tokens
        usdc = new MockERC20("USD Coin", "USDC", 1000000 * 10**6, 6);
        weth = new MockERC20("Wrapped Ether", "WETH", 1000 * 10**18, 18);
        dai = new MockERC20("Dai Stablecoin", "DAI", 1000000 * 10**18, 18);
        
        console.log("USDC deployed at:", address(usdc));
        console.log("WETH deployed at:", address(weth));
        console.log("DAI deployed at:", address(dai));
        
        // 设置token价格
        priceOracle.setPriceWithDecimals(address(usdc), 1 * 10**8); // $1
        priceOracle.setPriceWithDecimals(address(weth), 2000 * 10**8); // $2000
        priceOracle.setPriceWithDecimals(address(dai), 1 * 10**8); // $1
        
        // 创建示例项目
        btcProject = platform.createProject(
            "Bitcoin",
            "BTC",
            "The original cryptocurrency",
            "Layer1",
            7
        );
        
        ethProject = platform.createProject(
            "Ethereum", 
            "ETH",
            "A decentralized platform",
            "Layer1",
            7
        );
        
        solProject = platform.createProject(
            "Solana",
            "SOL", 
            "A high-performance blockchain",
            "Layer1",
            7
        );
        
        console.log("Projects created:");
        console.log("Bitcoin:", btcProject);
        console.log("Ethereum:", ethProject);
        console.log("Solana:", solProject);
        
        // 为项目提供初始赞助
        _addInitialSponsorship();
    }
    
    function _addInitialSponsorship() private {
        uint256 sponsorAmount = 1000 * 10**6; // 1000 USDC
        
        // 赞助Bitcoin项目
        usdc.approve(btcProject, sponsorAmount);
        IProject(btcProject).sponsor(address(usdc), sponsorAmount);
        
        // 赞助Ethereum项目
        usdc.approve(ethProject, sponsorAmount * 2);
        IProject(ethProject).sponsor(address(usdc), sponsorAmount * 2);
        
        // 赞助Solana项目（使用WETH）
        uint256 wethAmount = 1 * 10**18; // 1 WETH
        weth.approve(solProject, wethAmount);
        IProject(solProject).sponsor(address(weth), wethAmount);
        
        console.log("Initial sponsorship completed");
    }
    
    // 测试基础部署
    function test_BasicDeployment() public view {
        assertTrue(address(platform) != address(0), "Platform not deployed");
        assertTrue(address(crtToken) != address(0), "CRT Token not deployed");
        assertTrue(address(priceOracle) != address(0), "Price Oracle not deployed");
        assertTrue(address(factory) != address(0), "Factory not deployed");
        
        assertTrue(address(usdc) != address(0), "USDC not deployed");
        assertTrue(address(weth) != address(0), "WETH not deployed");
        assertTrue(address(dai) != address(0), "DAI not deployed");
        
        console.log("[SUCCESS] Basic deployment verified");
    }
    
    // 测试合约配置
    function test_ContractConfiguration() public view {
        assertEq(platform.priceOracle(), address(priceOracle), "Price oracle not set");
        assertEq(platform.projectFactory(), address(factory), "Factory not set");
        assertEq(platform.crtToken(), address(crtToken), "CRT token not set");
        
        assertTrue(factory.implementation() != address(0), "Factory implementation not set");
        
        console.log("[SUCCESS] Contract configuration verified");
    }
    
    // 测试Token配置
    function test_TokenConfiguration() public view {
        assertTrue(_compareStrings(usdc.name(), "USD Coin"), "USDC name incorrect");
        assertTrue(_compareStrings(usdc.symbol(), "USDC"), "USDC symbol incorrect");
        assertEq(usdc.decimals(), 6, "USDC decimals incorrect");
        
        assertTrue(_compareStrings(weth.name(), "Wrapped Ether"), "WETH name incorrect");
        assertTrue(_compareStrings(weth.symbol(), "WETH"), "WETH symbol incorrect");
        
        assertTrue(_compareStrings(crtToken.name(), "CoinReal Token"), "CRT name incorrect");
        assertTrue(_compareStrings(crtToken.symbol(), "CRT"), "CRT symbol incorrect");
        
        console.log("[SUCCESS] Token configuration verified");
    }
    
    // 测试价格Oracle
    function test_PriceOracle() public view {
        uint256 usdcValue = priceOracle.getUSDValue(address(usdc), 1 * 10**6);
        uint256 wethValue = priceOracle.getUSDValue(address(weth), 1 * 10**18);
        uint256 daiValue = priceOracle.getUSDValue(address(dai), 1 * 10**18);
        
        assertEq(usdcValue, 1 * 10**8, "USDC price incorrect");
        assertEq(wethValue, 2000 * 10**8, "WETH price incorrect");
        assertEq(daiValue, 1 * 10**8, "DAI price incorrect");
        
        console.log("[SUCCESS] Price Oracle verified");
    }
    
    // 测试项目创建
    function test_ProjectCreation() public view {
        assertTrue(btcProject != address(0), "Bitcoin project not created");
        assertTrue(ethProject != address(0), "Ethereum project not created");
        assertTrue(solProject != address(0), "Solana project not created");
        
        assertTrue(platform.isProject(btcProject), "Bitcoin project not registered");
        assertTrue(platform.isProject(ethProject), "Ethereum project not registered");
        assertTrue(platform.isProject(solProject), "Solana project not registered");
        
        IProject btc = IProject(btcProject);
        assertTrue(_compareStrings(btc.name(), "Bitcoin"), "Bitcoin name incorrect");
        assertTrue(_compareStrings(btc.symbol(), "BTC"), "Bitcoin symbol incorrect");
        assertTrue(_compareStrings(btc.category(), "Layer1"), "Bitcoin category incorrect");
        assertTrue(btc.isActive(), "Bitcoin project not active");
        
        console.log("[SUCCESS] Project creation verified");
    }
    
    // 测试赞助功能
    function test_Sponsorship() public view {
        IProject btc = IProject(btcProject);
        (IProject.Sponsorship[] memory sponsorships, uint256 totalUSD) = btc.getPoolInfo();
        
        assertTrue(sponsorships.length > 0, "No sponsorships found");
        assertTrue(totalUSD > 0, "Pool value is zero");
        
        // 验证USDC赞助
        bool foundUSDCSponsorship = false;
        for (uint256 i = 0; i < sponsorships.length; i++) {
            if (sponsorships[i].token == address(usdc) && 
                sponsorships[i].amount == 1000 * 10**6) {
                foundUSDCSponsorship = true;
                break;
            }
        }
        assertTrue(foundUSDCSponsorship, "USDC sponsorship not found");
        
        console.log("[SUCCESS] Sponsorship verified");
    }
    
    // 测试平台统计
    function test_PlatformStats() public view {
        (uint256 totalProjects, uint256 totalUsers, uint256 totalComments, uint256 totalPoolValue) 
            = platform.getPlatformStats();
        
        assertEq(totalProjects, 3, "Total projects count incorrect");
        assertTrue(totalPoolValue > 0, "Total pool value should be > 0");
        
        console.log("Total Projects:", totalProjects);
        console.log("Total Pool Value (USD):", totalPoolValue / 10**8);
        console.log("[SUCCESS] Platform stats verified");
    }
    
    // 测试评论功能
    function test_CommentFunction() public {
        vm.startPrank(user1);
        
        IProject btc = IProject(btcProject);
        uint256 commentId = btc.postComment("Bitcoin is amazing!");
        
        IProject.Comment memory comment = btc.getComment(commentId);
        assertEq(comment.author, user1, "Comment author incorrect");
        assertTrue(_compareStrings(comment.content, "Bitcoin is amazing!"), "Comment content incorrect");
        assertEq(comment.likes, 0, "Comment should have no likes initially");
        
        IProject.UserStats memory stats = btc.getUserStats(user1);
        assertEq(stats.totalComments, 1, "User comment count incorrect");
        assertTrue(stats.totalCRT > 0, "User should have CRT rewards");
        
        vm.stopPrank();
        console.log("[SUCCESS] Comment function verified");
    }
    
    // 测试点赞功能
    function test_LikeFunction() public {
        vm.startPrank(user1);
        IProject btc = IProject(btcProject);
        uint256 commentId = btc.postComment("Great project!");
        vm.stopPrank();
        
        vm.startPrank(user2);
        btc.likeComment(commentId);
        
        IProject.Comment memory comment = btc.getComment(commentId);
        assertEq(comment.likes, 1, "Comment likes count incorrect");
        
        // 验证不能重复点赞
        vm.expectRevert("Already liked");
        btc.likeComment(commentId);
        
        vm.stopPrank();
        console.log("[SUCCESS] Like function verified");
    }
    
    // 测试用户赞助项目
    function test_UserSponsorProject() public {
        vm.startPrank(user1);
        
        // 给用户mint一些USDC
        usdc.mint(user1, 5000 * 10**6);
        
        IProject btc = IProject(btcProject);
        uint256 sponsorAmount = 500 * 10**6;
        
        usdc.approve(btcProject, sponsorAmount);
        btc.sponsor(address(usdc), sponsorAmount);
        
        (IProject.Sponsorship[] memory sponsorships,) = btc.getPoolInfo();
        
        bool foundNewSponsorship = false;
        for (uint256 i = 0; i < sponsorships.length; i++) {
            if (sponsorships[i].sponsor == user1 && 
                sponsorships[i].token == address(usdc) &&
                sponsorships[i].amount == sponsorAmount) {
                foundNewSponsorship = true;
                break;
            }
        }
        assertTrue(foundNewSponsorship, "User sponsorship not found");
        
        vm.stopPrank();
        console.log("[SUCCESS] User sponsorship verified");
    }
    
    // 测试CRT Token的Soulbound特性
    function test_CRTTokenSoulbound() public {
        vm.startPrank(user1);
        
        IProject btc = IProject(btcProject);
        btc.postComment("Test comment for CRT");
        
        uint256 crtBalance = crtToken.balanceOf(user1);
        assertTrue(crtBalance > 0, "User should have CRT tokens");
        
        // 尝试转账应该失败
        vm.expectRevert("CRT: tokens are non-transferable");
        crtToken.transfer(user2, crtBalance);
        
        vm.stopPrank();
        console.log("[SUCCESS] CRT Token Soulbound verified");
    }
    
    // 测试项目排行榜
    function test_ProjectLeaderboard() public view {
        (address[] memory projects, uint256[] memory stats) = 
            platform.getProjectLeaderboard(2, 0, 3); // 按pool value排序
        
        assertTrue(projects.length > 0, "Leaderboard should have projects");
        assertTrue(stats.length == projects.length, "Stats length should match");
        
        console.log("[SUCCESS] Project leaderboard verified");
    }
    
    // 测试批量获取项目数据
    function test_BatchGetProjectsData() public view {
        address[] memory projectAddresses = new address[](3);
        projectAddresses[0] = btcProject;
        projectAddresses[1] = ethProject;
        projectAddresses[2] = solProject;
        
        ICoinRealPlatform.ProjectDetailedData[] memory projectsData = 
            platform.batchGetProjectsData(projectAddresses);
        
        assertEq(projectsData.length, 3, "Batch data length incorrect");
        assertEq(projectsData[0].name, "Bitcoin", "Bitcoin data incorrect");
        assertEq(projectsData[1].name, "Ethereum", "Ethereum data incorrect");
        assertEq(projectsData[2].name, "Solana", "Solana data incorrect");
        
        console.log("[SUCCESS] Batch get projects data verified");
    }
    
    // 简化的项目创建测试（独立的）
    function test_SimpleProjectCreation() public {
        // 创建一个新项目用于测试
        address testProject = platform.createProject(
            "Test Coin",
            "TEST",
            "A test cryptocurrency",
            "Test",
            3
        );
        
        assertTrue(testProject != address(0), "Test project not created");
        assertTrue(platform.isProject(testProject), "Test project not registered");
        
        console.log("[SUCCESS] Simple project creation verified");
    }
    
    // 单独测试CRT Token铸造权限
    function test_CRTMinterPermissions() public view {
        // 验证项目合约有CRT铸造权限
        assertTrue(crtToken.isMinter(btcProject), "Bitcoin project should be CRT minter");
        assertTrue(crtToken.isMinter(ethProject), "Ethereum project should be CRT minter");
        assertTrue(crtToken.isMinter(solProject), "Solana project should be CRT minter");
        
        console.log("[SUCCESS] CRT minter permissions verified");
    }
    
    // 测试Deploy脚本功能覆盖
    function test_DeployScriptFunctionality() public view {
        // 验证类似Deploy.s.sol脚本的功能
        
        // 1. 验证所有核心合约部署
        assertTrue(address(platform) != address(0), "Platform deployment failed");
        assertTrue(address(crtToken) != address(0), "CRT Token deployment failed");
        assertTrue(address(priceOracle) != address(0), "Price Oracle deployment failed");
        assertTrue(address(factory) != address(0), "Factory deployment failed");
        
        // 2. 验证Mock tokens部署
        assertTrue(address(usdc) != address(0), "USDC deployment failed");
        assertTrue(address(weth) != address(0), "WETH deployment failed");
        assertTrue(address(dai) != address(0), "DAI deployment failed");
        
        // 3. 验证价格设置
        assertTrue(priceOracle.getUSDValue(address(usdc), 1 * 10**6) == 1 * 10**8, "USDC price not set");
        assertTrue(priceOracle.getUSDValue(address(weth), 1 * 10**18) == 2000 * 10**8, "WETH price not set");
        assertTrue(priceOracle.getUSDValue(address(dai), 1 * 10**18) == 1 * 10**8, "DAI price not set");
        
        // 4. 验证项目创建
        assertTrue(btcProject != address(0), "Bitcoin project not created");
        assertTrue(ethProject != address(0), "Ethereum project not created");
        assertTrue(solProject != address(0), "Solana project not created");
        
        // 5. 验证初始赞助
        IProject btc = IProject(btcProject);
        (, uint256 btcPoolValue) = btc.getPoolInfo();
        assertTrue(btcPoolValue > 0, "Bitcoin project should have initial sponsorship");
        
        console.log("[SUCCESS] Deploy script functionality verified");
    }

    // Helper function for string comparison
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
} 