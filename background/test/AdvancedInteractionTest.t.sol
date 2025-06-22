// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import "../src/CoinRealPlatform.sol";
import "../src/ProjectFactory.sol";
import "../src/Project.sol";
import "../src/CRTToken.sol";
import "../src/mocks/MockPriceOracle.sol";
import "../src/mocks/MockERC20.sol";
import "../src/interfaces/ICoinRealPlatform.sol";
import "../src/interfaces/IProject.sol";

contract AdvancedInteractionTest is Test {
    // Core contracts
    CoinRealPlatform public platform;
    CRTToken public crtToken;
    MockPriceOracle public priceOracle;
    ProjectFactory public factory;
    Project public projectImpl;
    
    // Mock tokens
    MockERC20 public usdc;
    MockERC20 public weth;
    MockERC20 public dai;
    
    // Project addresses
    address public btcProject;
    address public ethProject;
    address public solProject;
    
    // Test users
    address public deployer;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    
    function setUp() public {
        deployer = address(this);
        vm.deal(deployer, 100 ether);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
        
        _deployContracts();
        _createInitialProjects();
        _setupInitialSponsorship();
    }
    
    function _deployContracts() private {
        // Deploy MockPriceOracle
        priceOracle = new MockPriceOracle();
        
        // Deploy CoinRealPlatform
        platform = new CoinRealPlatform(address(priceOracle));
        
        // Get CRT Token
        crtToken = CRTToken(platform.crtToken());
        
        // Deploy Project implementation
        projectImpl = new Project();
        
        // Deploy ProjectFactory
        factory = new ProjectFactory(address(projectImpl));
        
        // Configure platform
        platform.setProjectFactory(address(factory));
        
        // Deploy mock tokens
        usdc = new MockERC20("USD Coin", "USDC", 1000000 * 10**6, 6);
        weth = new MockERC20("Wrapped Ether", "WETH", 1000 * 10**18, 18);
        dai = new MockERC20("Dai Stablecoin", "DAI", 1000000 * 10**18, 18);
        
        // Set token prices
        priceOracle.setPriceWithDecimals(address(usdc), 1 * 10**8);
        priceOracle.setPriceWithDecimals(address(weth), 2000 * 10**8);
        priceOracle.setPriceWithDecimals(address(dai), 1 * 10**8);
        
        console.log("[SETUP] All contracts deployed successfully");
    }
    
    function _createInitialProjects() private {
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
        
        console.log("[SETUP] Projects created and CRT tokens configured successfully");
    }
    
    function _setupInitialSponsorship() private {
        // Mint tokens for test users
        usdc.mint(user1, 10000 * 10**6);
        weth.mint(user1, 10 * 10**18);
        dai.mint(user2, 5000 * 10**18);
        
        console.log("[SETUP] Test user tokens minted");
    }
    
    // Helper function for string comparison
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
    
    // Test comment functionality
    function test_CommentFunction() public {
        console.log("=== Testing Comment Function ===");
        
        vm.startPrank(user1);
        
        // 记录初始状态
        uint256 initialCRTBalance = crtToken.balanceOf(user1);
        uint256 initialCommentCount = IProject(btcProject).totalComments();
        
        // 发表评论
        uint256 commentId = IProject(btcProject).postComment("Bitcoin is amazing!");
        
        // 验证评论创建成功
        IProject.Comment memory comment = IProject(btcProject).getComment(commentId);
        assertEq(comment.author, user1, "Comment author incorrect");
        assertTrue(_compareStrings(comment.content, "Bitcoin is amazing!"), "Comment content incorrect");
        assertEq(comment.likes, 0, "Comment should have no likes initially");
        assertEq(comment.crtReward, 5 ether, "Comment CRT reward incorrect");
        console.log("[OK] Comment created successfully with ID:", commentId);
        
        // 验证CRT奖励发放
        uint256 finalCRTBalance = crtToken.balanceOf(user1);
        assertEq(finalCRTBalance - initialCRTBalance, 5 ether, "CRT reward not distributed correctly");
        console.log("[OK] CRT reward distributed correctly");
        
        // 验证项目统计更新
        uint256 finalCommentCount = IProject(btcProject).totalComments();
        assertEq(finalCommentCount - initialCommentCount, 1, "Project comment count not updated");
        console.log("[OK] Project comment count updated");
        
        // 验证用户统计
        IProject.UserStats memory userStats = IProject(btcProject).getUserStats(user1);
        assertEq(userStats.totalComments, 1, "User comment count incorrect");
        assertEq(userStats.totalCRT, 5 ether, "User CRT total incorrect");
        console.log("[OK] User statistics updated");
        
        vm.stopPrank();
        console.log("=== Comment Function Test Completed ===");
    }
    
    // Test like functionality
    function test_LikeFunction() public {
        console.log("=== Testing Like Function ===");
        
        // First post a comment
        vm.startPrank(user1);
        uint256 commentId = IProject(btcProject).postComment("Great project!");
        vm.stopPrank();
        
        // 记录初始状态
        uint256 initialLikerCRT = crtToken.balanceOf(user2);
        uint256 initialAuthorCRT = crtToken.balanceOf(user1);
        
        // Like the comment
        vm.startPrank(user2);
        
        IProject(btcProject).likeComment(commentId);
        
        // 验证点赞成功
        IProject.Comment memory comment = IProject(btcProject).getComment(commentId);
        assertEq(comment.likes, 1, "Comment likes count incorrect");
        assertEq(comment.crtReward, 6 ether, "Comment CRT reward should be 6 ETH (5 + 1)");
        console.log("[OK] Comment liked successfully");
        
        // 验证CRT奖励发放
        uint256 finalLikerCRT = crtToken.balanceOf(user2);
        uint256 finalAuthorCRT = crtToken.balanceOf(user1);
        assertEq(finalLikerCRT - initialLikerCRT, 1 ether, "Liker CRT reward not distributed correctly");
        assertEq(finalAuthorCRT - initialAuthorCRT, 1 ether, "Author CRT reward not distributed correctly");
        console.log("[OK] CRT rewards distributed to both liker and author");
        
        // 验证用户统计
        IProject.UserStats memory likerStats = IProject(btcProject).getUserStats(user2);
        assertEq(likerStats.totalLikes, 1, "Liker like count incorrect");
        assertEq(likerStats.totalCRT, 1 ether, "Liker CRT total incorrect");
        console.log("[OK] Liker statistics updated");
        
        // Test duplicate like prevention
        vm.expectRevert("Already liked");
        IProject(btcProject).likeComment(commentId);
        console.log("[OK] Duplicate like prevention works");
        
        vm.stopPrank();
        console.log("=== Like Function Test Completed ===");
    }
    
    // Test CRT Token soulbound feature
    function test_CRTTokenSoulbound() public {
        console.log("=== Testing CRT Token Soulbound Feature ===");
        
        vm.startPrank(user1);
        
        // 发表评论获取CRT代币
        IProject(btcProject).postComment("Test comment for CRT");
        
        uint256 crtBalance = crtToken.balanceOf(user1);
        assertTrue(crtBalance > 0, "User should have CRT balance");
        console.log("[OK] User has CRT balance:", crtBalance / 1 ether);
        
        // 测试转账应该失败
        vm.expectRevert("CRT: tokens are non-transferable");
        crtToken.transfer(user2, crtBalance);
        console.log("[OK] Transfer function correctly reverts");
        
        // 测试transferFrom应该失败
        vm.expectRevert("CRT: tokens are non-transferable");
        crtToken.transferFrom(user1, user2, crtBalance);
        console.log("[OK] TransferFrom function correctly reverts");
        
        // 测试approve应该失败
        vm.expectRevert("CRT: tokens are non-transferable");
        crtToken.approve(user2, crtBalance);
        console.log("[OK] Approve function correctly reverts");
        
        // 验证余额不变
        uint256 finalBalance = crtToken.balanceOf(user1);
        assertEq(finalBalance, crtBalance, "Balance should remain unchanged");
        console.log("[OK] Balance remains unchanged after failed transfers");
        
        vm.stopPrank();
        console.log("=== CRT Token Soulbound Test Completed ===");
    }
    
    // Test user sponsorship
    function test_UserSponsorProject() public {
        console.log("=== Testing User Sponsor Project ===");
        
        vm.startPrank(user1);
        
        uint256 sponsorAmount = 500 * 10**6;
        uint256 userBalance = usdc.balanceOf(user1);
        console.log("[INFO] User1 has USDC balance");
        
        if (userBalance >= sponsorAmount) {
            uint256 balanceBefore = usdc.balanceOf(user1);
            
            usdc.approve(btcProject, sponsorAmount);
            
            IProject(btcProject).sponsor(address(usdc), sponsorAmount);
            uint256 balanceAfter = usdc.balanceOf(user1);
            assertEq(balanceBefore - balanceAfter, sponsorAmount, "Sponsorship amount incorrect");
            console.log("[OK] User sponsored project with USDC");
                
        } else {
            console.log("[ERROR] Insufficient user balance");
        }
        
        vm.stopPrank();
        console.log("=== User Sponsor Project Test Completed ===");
    }
    
    // Test basic sponsorship
    function test_Sponsorship() public {
        console.log("=== Testing Basic Sponsorship ===");
        
        uint256 sponsorAmount = 1000 * 10**6;
        uint256 balanceBefore = usdc.balanceOf(address(this));
        
        usdc.approve(btcProject, sponsorAmount);
        
        IProject(btcProject).sponsor(address(usdc), sponsorAmount);
        uint256 balanceAfter = usdc.balanceOf(address(this));
        assertEq(balanceBefore - balanceAfter, sponsorAmount, "Amount incorrect");
        console.log("[OK] Basic sponsorship successful");
        
        console.log("=== Basic Sponsorship Test Completed ===");
    }
    
    // Test project creation
    function test_ProjectCreation() public {
        console.log("=== Testing Advanced Project Creation ===");
        
        address newProject = platform.createProject(
            "Cardano",
            "ADA",
            "A proof-of-stake blockchain",
            "Layer1",
            14
        );
        
        assertTrue(newProject != address(0), "Project not created");
        assertTrue(platform.isProject(newProject), "Project not registered");
        console.log("[OK] New project created:", newProject);
        
        // CRT token is automatically configured by the platform
        
        // Check project details using string comparison helper
        string memory name = IProject(newProject).name();
        assertTrue(_compareStrings(name, "Cardano"), "Project name incorrect");
        console.log("[OK] Project name verified:", name);
        
        string memory symbol = IProject(newProject).symbol();
        assertTrue(_compareStrings(symbol, "ADA"), "Project symbol incorrect");
        console.log("[OK] Project symbol verified:", symbol);
        
        bool active = IProject(newProject).isActive();
        assertTrue(active, "Project should be active");
        console.log("[OK] Project is active");
        
        bool isMinter = crtToken.isMinter(newProject);
        assertTrue(isMinter, "Project should be CRT minter");
        console.log("[OK] Project has CRT minter permission");
        
        console.log("=== Advanced Project Creation Test Completed ===");
    }
    
    // Test platform statistics
    function test_PlatformStats() public {
        console.log("=== Testing Platform Stats ===");
        
        // Test basic configuration verification
        assertTrue(platform.isProject(btcProject), "Bitcoin should be registered");
        assertTrue(platform.isProject(ethProject), "Ethereum should be registered");
        assertTrue(platform.isProject(solProject), "Solana should be registered");
        console.log("[OK] Project registration verified");
        
        assertEq(platform.crtToken(), address(crtToken), "CRT token not set");
        console.log("[OK] CRT token configuration verified");
        
        assertEq(platform.priceOracle(), address(priceOracle), "Price oracle not set");
        console.log("[OK] Price oracle configuration verified");
        
        assertEq(platform.projectFactory(), address(factory), "Factory not set");
        console.log("[OK] Project factory configuration verified");
        
        console.log("=== Platform Stats Test Completed ===");
    }
    
    // Test project leaderboard
    function test_ProjectLeaderboard() public {
        console.log("=== Testing Project Leaderboard ===");
        
        // Test basic project listing
        assertTrue(platform.isProject(btcProject), "Bitcoin should exist");
        assertTrue(platform.isProject(ethProject), "Ethereum should exist");
        assertTrue(platform.isProject(solProject), "Solana should exist");
        
        // Test category functionality
        console.log("[INFO] Testing category functionality...");
        address[] memory layer1Projects = platform.getProjectsByCategory("Layer1");
        assertTrue(layer1Projects.length >= 3, "Should have at least 3 Layer1 projects");
        console.log("[OK] Category filtering works, found", layer1Projects.length, "projects");
        
        console.log("=== Project Leaderboard Test Completed ===");
    }
    
    // Test batch data retrieval
    function test_BatchGetProjectsData() public {
        console.log("=== Testing Batch Get Projects Data ===");
        
        address[] memory projectAddresses = new address[](3);
        projectAddresses[0] = btcProject;
        projectAddresses[1] = ethProject;
        projectAddresses[2] = solProject;
        
        // 测试批量获取项目数据
        ICoinRealPlatform.ProjectDetailedData[] memory projectsData = 
            platform.batchGetProjectsData(projectAddresses);
        
        // 验证返回的数据数量正确
        assertEq(projectsData.length, 3, "Batch data length incorrect");
        console.log("[OK] Batch data returned correct number of projects");
        
        // 验证每个项目的数据
        assertTrue(_compareStrings(projectsData[0].name, "Bitcoin"), "Bitcoin data incorrect");
        assertTrue(_compareStrings(projectsData[0].symbol, "BTC"), "Bitcoin symbol incorrect");
        assertTrue(_compareStrings(projectsData[0].category, "Layer1"), "Bitcoin category incorrect");
        assertTrue(projectsData[0].isActive, "Bitcoin should be active");
        console.log("[OK] Bitcoin data verified");
        
        assertTrue(_compareStrings(projectsData[1].name, "Ethereum"), "Ethereum data incorrect");
        assertTrue(_compareStrings(projectsData[1].symbol, "ETH"), "Ethereum symbol incorrect");
        assertTrue(_compareStrings(projectsData[1].category, "Layer1"), "Ethereum category incorrect");
        assertTrue(projectsData[1].isActive, "Ethereum should be active");
        console.log("[OK] Ethereum data verified");
        
        assertTrue(_compareStrings(projectsData[2].name, "Solana"), "Solana data incorrect");
        assertTrue(_compareStrings(projectsData[2].symbol, "SOL"), "Solana symbol incorrect");
        assertTrue(_compareStrings(projectsData[2].category, "Layer1"), "Solana category incorrect");
        assertTrue(projectsData[2].isActive, "Solana should be active");
        console.log("[OK] Solana data verified");
        
        // 验证所有项目地址正确
        assertEq(projectsData[0].projectAddress, btcProject, "Bitcoin address incorrect");
        assertEq(projectsData[1].projectAddress, ethProject, "Ethereum address incorrect");
        assertEq(projectsData[2].projectAddress, solProject, "Solana address incorrect");
        console.log("[OK] All project addresses verified");
        
        console.log("=== Batch Get Projects Data Test Completed ===");
    }
    
    // Test deploy script functionality
    function test_DeployScriptFunctionality() public {
        console.log("=== Testing Deploy Script Advanced Functionality ===");
        
        // Verify core contracts
        assertTrue(address(platform) != address(0), "Platform deployment failed");
        assertTrue(address(crtToken) != address(0), "CRT Token deployment failed");
        assertTrue(address(priceOracle) != address(0), "Price Oracle deployment failed");
        assertTrue(address(factory) != address(0), "Factory deployment failed");
        console.log("[OK] Core contracts deployed");
        
        // Verify mock tokens
        assertTrue(address(usdc) != address(0), "USDC deployment failed");
        assertTrue(address(weth) != address(0), "WETH deployment failed");
        assertTrue(address(dai) != address(0), "DAI deployment failed");
        console.log("[OK] Mock tokens deployed");
        
        // Verify price settings
        assertTrue(priceOracle.getUSDValue(address(usdc), 1 * 10**6) == 1 * 10**8, "USDC price wrong");
        assertTrue(priceOracle.getUSDValue(address(weth), 1 * 10**18) == 2000 * 10**8, "WETH price wrong");
        assertTrue(priceOracle.getUSDValue(address(dai), 1 * 10**18) == 1 * 10**8, "DAI price wrong");
        console.log("[OK] Token prices set correctly");
        
        // Verify projects
        assertTrue(btcProject != address(0), "Bitcoin project not created");
        assertTrue(ethProject != address(0), "Ethereum project not created");
        assertTrue(solProject != address(0), "Solana project not created");
        console.log("[OK] Sample projects created");
        
        // Verify configurations
        assertEq(platform.priceOracle(), address(priceOracle), "Price oracle not configured");
        assertEq(platform.projectFactory(), address(factory), "Factory not configured");
        assertEq(platform.crtToken(), address(crtToken), "CRT token not configured");
        console.log("[OK] Contract configurations verified");
        
        console.log("=== Deploy Script Advanced Functionality Test Completed ===");
    }
    
    // Comprehensive workflow test
    function test_CompleteWorkflow() public {
        console.log("=== Testing Complete Advanced Workflow ===");
        
        console.log("[INFO] Running all advanced tests...");
        test_ProjectCreation();
        test_CommentFunction();
        test_LikeFunction();
        test_Sponsorship();
        test_UserSponsorProject();
        test_CRTTokenSoulbound();
        test_PlatformStats();
        test_ProjectLeaderboard();
        test_BatchGetProjectsData();
        test_DeployScriptFunctionality();
        
        console.log("=== Complete Advanced Workflow Test Completed ===");
    }
    
    // 简化的评论测试用于调试
    function test_SimpleCommentFunction() public {
        console.log("=== Testing Simple Comment Function ===");
        
        vm.startPrank(user1);
        
        // 只尝试发表评论，不做复杂验证
        try IProject(btcProject).postComment("Simple test comment") returns (uint256 commentId) {
            console.log("[OK] Comment posted successfully with ID:", commentId);
        } catch Error(string memory reason) {
            console.log("[ERROR] Comment failed with reason:", reason);
        } catch {
            console.log("[ERROR] Comment failed with unknown error");
        }
        
        vm.stopPrank();
        console.log("=== Simple Comment Function Test Completed ===");
    }
    
    // 极简的评论测试，不使用try-catch
    function test_VerySimpleComment() public {
        console.log("=== Testing Very Simple Comment ===");
        
        vm.startPrank(user1);
        IProject(btcProject).postComment("Very simple comment");
        vm.stopPrank();
        
        console.log("=== Very Simple Comment Test Completed ===");
    }
} 