// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import "../src/CoinRealPlatform.sol";
import "../src/ProjectFactory.sol";
import "../src/Project.sol";
import "../src/Campaign.sol";
import "../src/CampaignFactory.sol";
import "../src/mocks/MockPriceOracle.sol";
import "../src/mocks/MockERC20.sol";
import "../src/interfaces/IProject.sol";
import "../src/interfaces/ICampaign.sol";

contract CampaignSystemTest is Test {
    // 核心合约
    CoinRealPlatform public platform;
    MockPriceOracle public priceOracle;
    ProjectFactory public projectFactory;
    CampaignFactory public campaignFactory;
    Project public projectImpl;
    Campaign public campaignImpl;
    
    // 测试代币
    MockERC20 public usdc;
    MockERC20 public weth;
    
    // 测试项目和Campaign
    address public btcProject;
    address public ethProject;
    address public btcCampaign1;
    address public btcCampaign2;
    address public ethCampaign1;
    
    // 测试用户
    address public deployer;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");
    address public sponsor = makeAddr("sponsor");
    
    event CommentPosted(uint256 indexed commentId, address indexed user, string content);
    event CommentLiked(uint256 indexed commentId, address indexed liker);
    event CRTMinted(address indexed user, uint256 amount, string reason);
    event CampaignCreated(address indexed campaign, address indexed project, address indexed sponsor, string sponsorName);
    
    function setUp() public {
        deployer = address(this);
        
        // 给测试用户分配ETH
        vm.deal(deployer, 100 ether);
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        vm.deal(charlie, 1 ether);
        vm.deal(sponsor, 1 ether);
        
        _deployContracts();
        _setupTokens();
        _createProjects();
        _createCampaigns();
    }
    
    function _deployContracts() private {
        console.log("=== Deploying Core Contracts ===");
        
        // 部署价格预言机
        priceOracle = new MockPriceOracle();
        
        // 部署平台
        platform = new CoinRealPlatform(address(priceOracle));
        
        // 部署Project相关
        projectImpl = new Project();
        projectFactory = new ProjectFactory(address(projectImpl));
        
        // 部署Campaign相关
        campaignImpl = new Campaign();
        campaignFactory = new CampaignFactory(address(campaignImpl));
        
        // 配置平台
        platform.setProjectFactory(address(projectFactory));
        platform.setCampaignFactory(address(campaignFactory));
        
        // 配置CampaignFactory的平台地址
        campaignFactory.setPlatform(address(platform));
        
        console.log("Platform:", address(platform));
        console.log("ProjectFactory:", address(projectFactory));
        console.log("CampaignFactory:", address(campaignFactory));
    }
    
    function _setupTokens() private {
        console.log("=== Setting up Test Tokens ===");
        
        // 部署测试代币
        usdc = new MockERC20("USD Coin", "USDC", 1000000 * 10**6, 6);
        weth = new MockERC20("Wrapped Ether", "WETH", 1000 * 10**18, 18);
        
        // 设置价格
        priceOracle.setPriceWithDecimals(address(usdc), 1 * 10**8); // $1
        priceOracle.setPriceWithDecimals(address(weth), 2500 * 10**8); // $2500
        
        // 给赞助者分配代币 - 注意：deployer是初始持有者
        usdc.transfer(sponsor, 10000 * 10**6); // 10K USDC
        weth.transfer(sponsor, 10 * 10**18); // 10 WETH
        
        // 验证代币余额
        console.log("Sponsor USDC balance:", usdc.balanceOf(sponsor));
        console.log("Sponsor WETH balance:", weth.balanceOf(sponsor));
        
        console.log("USDC:", address(usdc));
        console.log("WETH:", address(weth));
    }
    
    function _createProjects() private {
        console.log("=== Creating Test Projects ===");
        
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
            "Smart contract platform",
            "Layer1",
            7
        );
        
        console.log("Bitcoin Project:", btcProject);
        console.log("Ethereum Project:", ethProject);
    }
    
    function _createCampaigns() private {
        console.log("=== Creating Test Campaigns ===");
        
        vm.startPrank(sponsor);
        
        // 为Bitcoin创建两个Campaign
        usdc.approve(address(campaignFactory), 2000 * 10**6);
        btcCampaign1 = campaignFactory.createCampaign(
            btcProject,
            "Bitcoin Community",
            30, // 30天
            address(usdc),
            1000 * 10**6 // 1000 USDC
        );
        
        btcCampaign2 = campaignFactory.createCampaign(
            btcProject,
            "Crypto Foundation", 
            60, // 60天
            address(usdc),
            1000 * 10**6 // 1000 USDC
        );
        
        // 为Ethereum创建一个Campaign
        weth.approve(address(campaignFactory), 2 * 10**18);
        ethCampaign1 = campaignFactory.createCampaign(
            ethProject,
            "ETH Supporters",
            45, // 45天
            address(weth),
            2 * 10**18 // 2 WETH
        );
        
        vm.stopPrank();
        
        console.log("BTC Campaign 1:", btcCampaign1);
        console.log("BTC Campaign 2:", btcCampaign2);
        console.log("ETH Campaign 1:", ethCampaign1);
    }
    
    // ==================== 基础功能测试 ====================
    
    function test_BasicDeployment() public view {
        // 验证合约部署
        assertTrue(address(platform) != address(0));
        assertTrue(address(projectFactory) != address(0));
        assertTrue(address(campaignFactory) != address(0));
        assertTrue(address(priceOracle) != address(0));
        
        // 验证配置
        assertEq(platform.projectFactory(), address(projectFactory));
        assertEq(platform.campaignFactory(), address(campaignFactory));
        
        console.log("[PASS] Basic deployment test");
    }
    
    function test_ProjectCreation() public view {
        // 验证项目创建
        assertTrue(platform.isProject(btcProject));
        assertTrue(platform.isProject(ethProject));
        
        IProject btc = IProject(btcProject);
        assertEq(btc.name(), "Bitcoin");
        assertEq(btc.symbol(), "BTC");
        assertEq(btc.creator(), address(this));
        assertTrue(btc.isActive());
        
        console.log("[PASS] Project creation test");
    }
    
    function test_CampaignCreation() public { 
        // 验证Campaign创建
        assertTrue(campaignFactory.isValidCampaign(btcCampaign1));
        assertTrue(campaignFactory.isValidCampaign(btcCampaign2));
        assertTrue(campaignFactory.isValidCampaign(ethCampaign1));
        
        ICampaign campaign = ICampaign(btcCampaign1);
        assertEq(campaign.projectAddress(), btcProject);
        assertEq(campaign.sponsor(), sponsor);
        assertEq(campaign.sponsorName(), "Bitcoin Community");
        assertEq(campaign.rewardToken(), address(usdc));
        assertEq(campaign.totalRewardPool(), 1000 * 10**6);
        assertTrue(campaign.isCurrentlyActive());
        
        // 验证Campaign名称格式
        assertEq(campaign.name(), "Bitcoin-Campaign1");
        assertEq(campaign.symbol(), "CRT");
        
        // 验证Project关联Campaign
        address[] memory campaigns = IProject(btcProject).getCampaigns();
        assertEq(campaigns.length, 2);
        assertEq(campaigns[0], btcCampaign1);
        assertEq(campaigns[1], btcCampaign2);
        
        console.log("[PASS] Campaign creation test");
    }
    
    // ==================== 核心交互测试 ====================
    
    function test_CommentAndCRTMinting() public {
        console.log("=== Testing Comment and CRT Minting ===");
        
        IProject btc = IProject(btcProject);
        ICampaign campaign1 = ICampaign(btcCampaign1);
        ICampaign campaign2 = ICampaign(btcCampaign2);
        
        // Alice发表评论
        vm.expectEmit(true, true, false, true);
        emit CommentPosted(0, alice, "Bitcoin is the future!");
        
        vm.prank(alice);
        uint256 commentId = btc.postComment("Bitcoin is the future!");
        
        // 验证评论创建
        assertEq(commentId, 0);
        IProject.Comment memory comment = btc.getComment(commentId);
        assertEq(comment.author, alice);
        assertEq(comment.content, "Bitcoin is the future!");
        assertEq(comment.likes, 0);
        
        // 验证CRT铸造 - Alice应该在两个Campaign中都获得CRT
        assertEq(campaign1.balanceOf(alice), 5 ether); // 5 CRT for comment
        assertEq(campaign2.balanceOf(alice), 5 ether); // 5 CRT for comment
        
        // 验证CRT分类统计
        (uint256 commentCRT1, uint256 likeCRT1, uint256 totalCRT1,) = campaign1.getUserCRTBreakdown(alice);
        assertEq(commentCRT1, 5 ether);
        assertEq(likeCRT1, 0);
        assertEq(totalCRT1, 5 ether);
        
        console.log("Alice CRT in Campaign1:", campaign1.balanceOf(alice));
        console.log("Alice CRT in Campaign2:", campaign2.balanceOf(alice));
        console.log("[PASS] Comment and CRT minting test");
    }
    
    function test_LikeAndCRTMinting() public {
        console.log("=== Testing Like and CRT Minting ===");
        
        IProject btc = IProject(btcProject);
        ICampaign campaign1 = ICampaign(btcCampaign1);
        
        // Alice发表评论
        vm.prank(alice);
        uint256 commentId = btc.postComment("Great project!");
        
        // Bob点赞Alice的评论
        vm.expectEmit(true, true, false, true);
        emit CommentLiked(commentId, bob);
        
        vm.prank(bob);
        btc.likeComment(commentId);
        
        // 验证点赞记录
        assertTrue(btc.hasUserLikedComment(bob, commentId));
        IProject.Comment memory comment = btc.getComment(commentId);
        assertEq(comment.likes, 1);
        
        // 验证CRT分配
        // Alice: 5(评论) + 1(被点赞) = 6 CRT
        // Bob: 1(点赞) = 1 CRT
        assertEq(campaign1.balanceOf(alice), 6 ether);
        assertEq(campaign1.balanceOf(bob), 1 ether);
        
        // 验证CRT分类
        (uint256 aliceCommentCRT, uint256 aliceLikeCRT,,) = campaign1.getUserCRTBreakdown(alice);
        (uint256 bobCommentCRT, uint256 bobLikeCRT,,) = campaign1.getUserCRTBreakdown(bob);
        
        assertEq(aliceCommentCRT, 5 ether);
        assertEq(aliceLikeCRT, 1 ether);
        assertEq(bobCommentCRT, 0);
        assertEq(bobLikeCRT, 1 ether);
        
        console.log("Alice total CRT:", campaign1.balanceOf(alice));
        console.log("Bob total CRT:", campaign1.balanceOf(bob));
        console.log("[PASS] Like and CRT minting test");
    }
    
    function test_MultipleCampaignInteraction() public {
        console.log("=== Testing Multiple Campaign Interaction ===");
        
        IProject btc = IProject(btcProject);
        IProject eth = IProject(ethProject);
        
        // Alice在Bitcoin项目发表评论
        vm.prank(alice);
        btc.postComment("Bitcoin is digital gold!");
        
        // Alice在Ethereum项目发表评论
        vm.prank(alice);
        eth.postComment("Ethereum enables smart contracts!");
        
        // 验证Alice在不同项目的CRT
        ICampaign btcCampaignContract1 = ICampaign(btcCampaign1);
        ICampaign btcCampaignContract2 = ICampaign(btcCampaign2);
        ICampaign ethCampaignContract = ICampaign(ethCampaign1);
        
        // Bitcoin项目有两个Campaign，都应该给Alice CRT
        assertEq(btcCampaignContract1.balanceOf(alice), 5 ether);
        assertEq(btcCampaignContract2.balanceOf(alice), 5 ether);
        
        // Ethereum项目有一个Campaign
        assertEq(ethCampaignContract.balanceOf(alice), 5 ether);
        
        // 验证聚合查询
        uint256 totalBtcCRT = btc.getUserTotalCRT(alice);
        uint256 totalEthCRT = eth.getUserTotalCRT(alice);
        
        assertEq(totalBtcCRT, 10 ether); // 5 + 5 from two campaigns
        assertEq(totalEthCRT, 5 ether);  // 5 from one campaign
        
        console.log("Alice BTC total CRT:", totalBtcCRT);
        console.log("Alice ETH total CRT:", totalEthCRT);
        console.log("[PASS] Multiple campaign interaction test");
    }
    
    function test_CampaignDetailedQuery() public {
        console.log("=== Testing Campaign Detailed Query ===");
        
        IProject btc = IProject(btcProject);
        
        // 用户活动
        vm.prank(alice);
        uint256 comment1 = btc.postComment("First comment");
        
        vm.prank(bob);
        uint256 comment2 = btc.postComment("Second comment");
        
        vm.prank(alice);
        btc.likeComment(comment2);
        
        vm.prank(bob);
        btc.likeComment(comment1);
        
        // 测试详细CRT查询
        (
            address[] memory campaignAddresses,
            uint256[] memory commentCRTs,
            uint256[] memory likeCRTs,
            uint256[] memory totalCRTs,
            uint256[] memory pendingRewards
        ) = btc.getUserCampaignCRTDetails(alice);
        
        // 验证返回数据
        assertEq(campaignAddresses.length, 2); // Bitcoin有两个Campaign
        assertEq(campaignAddresses[0], btcCampaign1);
        assertEq(campaignAddresses[1], btcCampaign2);
        
        // Alice: 5(评论) + 2(1点赞+1被点赞) = 7 CRT per campaign
        assertEq(commentCRTs[0], 5 ether);
        assertEq(likeCRTs[0], 2 ether);
        assertEq(totalCRTs[0], 7 ether);
        
        assertEq(commentCRTs[1], 5 ether);
        assertEq(likeCRTs[1], 2 ether);
        assertEq(totalCRTs[1], 7 ether);
        
        console.log("Alice Campaign1 CRT:", totalCRTs[0]);
        console.log("Alice Campaign2 CRT:", totalCRTs[1]);
        console.log("[PASS] Campaign detailed query test");
    }
    
    // ==================== 奖励分配测试 ====================
    
    function test_RewardDistribution() public {
        console.log("=== Testing Reward Distribution ===");
        
        IProject btc = IProject(btcProject);
        ICampaign campaign = ICampaign(btcCampaign1);
        
        // 模拟用户活动
        vm.prank(alice);
        uint256 comment1 = btc.postComment("Alice's comment");
        
        vm.prank(bob);
        uint256 comment2 = btc.postComment("Bob's comment");
        
        vm.prank(charlie);
        btc.likeComment(comment1); // Alice gets extra CRT
        
        vm.prank(alice);
        btc.likeComment(comment2); // Bob gets extra CRT
        
        // 验证活动前状态
        assertEq(campaign.balanceOf(alice), 7 ether); // 5(评论) + 1(点赞) + 1(被点赞)
        assertEq(campaign.balanceOf(bob), 6 ether);   // 5(评论) + 1(被点赞)  
        assertEq(campaign.balanceOf(charlie), 1 ether); // 1(点赞)
        
        // 快进到Campaign结束
        vm.warp(block.timestamp + 31 days);
        
        // 只有平台可以分配奖励
        vm.expectRevert("Only platform can call");
        vm.prank(alice);
        campaign.distributeRewards();
        
        // 平台分配奖励
        vm.prank(address(platform));
        campaign.distributeRewards();
        
        // 验证奖励分配状态
        assertTrue(campaign.rewardsDistributed());
        
        // 验证用户有待领取奖励
        (,,,uint256 alicePending) = campaign.getUserCRTBreakdown(alice);
        (,,,uint256 bobPending) = campaign.getUserCRTBreakdown(bob);
        (,,,uint256 charliePending) = campaign.getUserCRTBreakdown(charlie);
        
        assertTrue(alicePending > 0);
        assertTrue(bobPending > 0); 
        assertTrue(charliePending > 0);
        
        console.log("Alice pending reward:", alicePending);
        console.log("Bob pending reward:", bobPending);
        console.log("Charlie pending reward:", charliePending);
        
        // 测试奖励领取
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        
        vm.prank(alice);
        campaign.claimRewards();
        
        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        assertTrue(aliceBalanceAfter > aliceBalanceBefore);
        
        console.log("Alice claimed:", aliceBalanceAfter - aliceBalanceBefore);
        console.log("[PASS] Reward distribution test");
    }
    
    function test_EmptyCampaignExtension() public {
        console.log("=== Testing Empty Campaign Extension ===");
        
        // 创建一个新的Campaign，但不进行任何活动
        vm.prank(sponsor);
        usdc.approve(address(campaignFactory), 500 * 10**6);
        
        vm.prank(sponsor);
        address emptyCampaign = campaignFactory.createCampaign(
            btcProject,
            "Empty Test",
            1, // 1天
            address(usdc),
            500 * 10**6
        );
        
        ICampaign campaign = ICampaign(emptyCampaign);
        uint256 originalEndTime = campaign.endTime();
        
        // 快进到结束时间
        vm.warp(originalEndTime + 1);
        
        // 尝试分配奖励，应该延长时间而不是分配
        vm.prank(address(platform));
        campaign.distributeRewards();
        
        // 验证时间被延长了7天
        uint256 newEndTime = campaign.endTime();
        assertEq(newEndTime, originalEndTime + 7 days);
        assertFalse(campaign.rewardsDistributed());
        
        console.log("Original end time:", originalEndTime);
        console.log("New end time:", newEndTime);
        console.log("[PASS] Empty campaign extension test");
    }
    
    // ==================== CRT代币特性测试 ====================
    
    function test_CRTNonTransferable() public {
        console.log("=== Testing CRT Non-transferable ===");
        
        IProject btc = IProject(btcProject);
        ICampaign campaign = ICampaign(btcCampaign1);
        
        // Alice获得一些CRT
        vm.prank(alice);
        btc.postComment("Test comment");
        
        assertEq(campaign.balanceOf(alice), 5 ether);
        
        // 尝试转移CRT应该失败
        vm.prank(alice);
        vm.expectRevert("CRT: tokens are non-transferable");
        campaign.transfer(bob, 1 ether);
        
        vm.prank(alice);
        vm.expectRevert("CRT: tokens are non-transferable");
        campaign.approve(bob, 1 ether);
        
        console.log("[PASS] CRT non-transferable test");
    }
    
    // ==================== 兼容性测试 ====================
    
    function test_BackwardCompatibility() public view {
        console.log("=== Testing Backward Compatibility ===");
        
        IProject btc = IProject(btcProject);
        
        // 测试兼容性函数不会报错
        (IProject.Sponsorship[] memory sponsorships, uint256 totalUSD) = btc.getPoolInfo();
        assertEq(sponsorships.length, 0);
        assertEq(totalUSD, 0);
        
        // getPoolValueUSD现在应该返回所有Campaign的奖池总额
        // Bitcoin项目有两个Campaign，每个1000 USDC，总共2000 USDC = 2000 * 10^6
        assertEq(btc.getPoolValueUSD(), 2000 * 10**6);
        
        IProject.UserStats memory stats = btc.getUserStats(alice);
        assertEq(stats.totalComments, 0);
        assertEq(stats.totalLikes, 0);
        assertEq(stats.totalCRT, 0);
        
        console.log("[PASS] Backward compatibility test");
    }
} 