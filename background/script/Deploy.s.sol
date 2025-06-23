// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import "../src/CoinRealPlatform.sol";
import "../src/ProjectFactory.sol";
import "../src/Project.sol";
import "../src/Campaign.sol";
import "../src/CampaignFactory.sol";
import "../src/mocks/MockPriceOracle.sol";
import "../src/mocks/MockERC20.sol";
import "../src/interfaces/IProject.sol";
import "../src/interfaces/ICampaign.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployScript is Script {
    // 部署的合约实例
    CoinRealPlatform public platform;
    MockPriceOracle public priceOracle;
    ProjectFactory public projectFactory;
    Project public projectImpl;
    CampaignFactory public campaignFactory;
    Campaign public campaignImpl;
    
    // Mock代币
    MockERC20 public usdc;
    MockERC20 public weth;
    MockERC20 public dai;
    MockERC20 public usdt;
    MockERC20 public bnb;
    
    // 项目地址
    address[] public allProjects;
    address[] public allCampaigns;
    
    // 示例用户地址（用私钥生成的确定性地址）
    address public alice = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;   // 私钥2
    address public bob = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;     // 私钥3
    address public charlie = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; // 私钥4
    address public david = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;   // 私钥5
    
    function run() external {
        // 使用固定私钥进行部署（本地测试用）
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Starting CoinReal Platform Deployment ===");
        
        // 1. Deploy core contracts
        _deployCore();
        
        // 2. Deploy and configure tokens
        _deployTokens();
        
        // 3. Create sample projects
        _createProjects();
        
        // 4. Setup sample users funds
        _setupUsers();
        
        // 5. Create sample campaigns
        _createCampaigns();
        
        // 6. Output final state
        _outputFinalState();
        
        vm.stopBroadcast();
        
        // 7. Simulate user interactions (after broadcast)
        _simulateUserInteractions();
        
        // 8. Generate deployment info file
        _writeDeploymentInfo();
        
        console.log("=== CoinReal Platform Deployment Completed ===");
    }
    
    function _deployCore() private {
        console.log("\n[Step 1] Deploying core contracts...");
        
        // Deploy price oracle
        priceOracle = new MockPriceOracle();
        console.log("MockPriceOracle deployed at:", address(priceOracle));
        
        // Deploy platform main contract (不再需要CRT Token)
        platform = new CoinRealPlatform(address(priceOracle));
        console.log("CoinRealPlatform deployed at:", address(platform));
        
        // Deploy project implementation contract
        projectImpl = new Project();
        console.log("Project implementation deployed at:", address(projectImpl));
        
        // Deploy project factory
        projectFactory = new ProjectFactory(address(projectImpl));
        console.log("ProjectFactory deployed at:", address(projectFactory));
        
        // Deploy campaign implementation contract
        campaignImpl = new Campaign();
        console.log("Campaign implementation deployed at:", address(campaignImpl));
        
        // Deploy campaign factory
        campaignFactory = new CampaignFactory(address(campaignImpl));
        console.log("CampaignFactory deployed at:", address(campaignFactory));
        
        // Configure platform
        platform.setProjectFactory(address(projectFactory));
        platform.setCampaignFactory(address(campaignFactory));
        console.log("+ Project factory configured to platform");
        console.log("+ Campaign factory configured to platform");
        
        // Configure campaign factory with platform address
        campaignFactory.setPlatform(address(platform));
        console.log("+ Platform address configured to campaign factory");
    }
    
    function _deployTokens() private {
        console.log("\n[Step 2] Deploying test tokens...");
        
        // Deploy multiple test tokens with larger amounts
        usdc = new MockERC20("USD Coin", "USDC", 10000000 * 10**6, 6);      // 10M USDC
        weth = new MockERC20("Wrapped Ether", "WETH", 100000 * 10**18, 18); // 100K WETH
        dai = new MockERC20("Dai Stablecoin", "DAI", 10000000 * 10**18, 18); // 10M DAI
        usdt = new MockERC20("Tether USD", "USDT", 10000000 * 10**6, 6);     // 10M USDT
        bnb = new MockERC20("BNB Token", "BNB", 1000000 * 10**18, 18);       // 1M BNB
        
        console.log("USDC deployed at:", address(usdc));
        console.log("WETH deployed at:", address(weth));
        console.log("DAI deployed at:", address(dai));
        console.log("USDT deployed at:", address(usdt));
        console.log("BNB deployed at:", address(bnb));
        
        // Set token prices (8 decimal precision)
        priceOracle.setPriceWithDecimals(address(usdc), 1 * 10**8);      // $1.00
        priceOracle.setPriceWithDecimals(address(weth), 2500 * 10**8);   // $2500.00
        priceOracle.setPriceWithDecimals(address(dai), 1 * 10**8);       // $1.00
        priceOracle.setPriceWithDecimals(address(usdt), 1 * 10**8);      // $1.00
        priceOracle.setPriceWithDecimals(address(bnb), 300 * 10**8);     // $300.00
        
        console.log("+ Token prices configured");
    }
    
    function _createProjects() private {
        console.log("\n[Step 3] Creating sample projects...");
        
        // Layer1 projects
        address btcProject = platform.createProject(
            "Bitcoin",
            "BTC",
            "Bitcoin is the world's first decentralized digital currency, enabling peer-to-peer transactions. As the pioneer of blockchain technology, Bitcoin features scarcity, decentralization and censorship resistance.",
            "Layer1",
            7
        );
        allProjects.push(btcProject);
        console.log("+ Bitcoin project created:", btcProject);
        
        address ethProject = platform.createProject(
            "Ethereum",
            "ETH", 
            "Ethereum is a decentralized, open-source blockchain platform that supports smart contract functionality. It serves as the foundation for the Web3 ecosystem, providing powerful infrastructure for DeFi, NFTs and dApps.",
            "Layer1",
            7
        );
        allProjects.push(ethProject);
        console.log("+ Ethereum project created:", ethProject);
        
        address solProject = platform.createProject(
            "Solana",
            "SOL",
            "Solana is a high-performance blockchain supporting builders around the world. Known for its ultra-fast transaction speeds and low costs, it's a popular choice for building DeFi and Web3 applications.",
            "Layer1",
            14
        );
        allProjects.push(solProject);
        console.log("+ Solana project created:", solProject);
        
        // Layer2 projects
        address polygonProject = platform.createProject(
            "Polygon",
            "MATIC",
            "Polygon is Ethereum's scaling solution, providing faster and lower-cost transactions. Through sidechain technology, it brings users better DeFi and Gaming experiences.",
            "Layer2",
            10
        );
        allProjects.push(polygonProject);
        console.log("+ Polygon project created:", polygonProject);
        
        address arbProject = platform.createProject(
            "Arbitrum",
            "ARB",
            "Arbitrum is Ethereum's Layer 2 scaling solution using Optimistic Rollup technology. It provides developers with a fully Ethereum-compatible environment while significantly reducing transaction costs.",
            "Layer2",
            7
        );
        allProjects.push(arbProject);
        console.log("+ Arbitrum project created:", arbProject);
        
        // DeFi projects
        address uniProject = platform.createProject(
            "Uniswap",
            "UNI",
            "Uniswap is the leading decentralized trading protocol, allowing users to swap ERC-20 tokens without intermediaries. It revolutionized DeFi trading through its Automated Market Maker (AMM) model.",
            "DeFi",
            5
        );
        allProjects.push(uniProject);
        console.log("+ Uniswap project created:", uniProject);
        
        address aaveProject = platform.createProject(
            "Aave",
            "AAVE",
            "Aave is an open-source decentralized lending protocol where users can deposit assets to earn interest or borrow assets with over-collateralization. It supports innovative features like flash loans.",
            "DeFi",
            7
        );
        allProjects.push(aaveProject);
        console.log("+ Aave project created:", aaveProject);
        
        // NFT projects
        address opensea = platform.createProject(
            "OpenSea",
            "OS",
            "OpenSea is the world's largest NFT marketplace where users can buy, sell and discover exclusive digital items. It provides a complete NFT ecosystem for creators and collectors.",
            "NFT",
            3
        );
        allProjects.push(opensea);
        console.log("+ OpenSea project created:", opensea);
        
        // GameFi projects
        address axieProject = platform.createProject(
            "Axie Infinity",
            "AXS",
            "Axie Infinity is a blockchain-based game where players can collect, breed and battle digital pets called Axies. It pioneered the Play-to-Earn gaming model.",
            "GameFi",
            14
        );
        allProjects.push(axieProject);
        console.log("+ Axie Infinity project created:", axieProject);
        
        console.log("+ Total created", allProjects.length, "sample projects");
    }
    
    function _setupUsers() private {
        console.log("\n[Step 4] Setting up user funds...");
        
        address[] memory users = new address[](4);
        users[0] = alice;
        users[1] = bob;
        users[2] = charlie;
        users[3] = david;
        
        // 给每个用户分配代币
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            
            // 分配各种代币
            usdc.transfer(user, 10000 * 10**6);      // 10K USDC
            weth.transfer(user, 10 * 10**18);        // 10 WETH
            dai.transfer(user, 10000 * 10**18);      // 10K DAI
            usdt.transfer(user, 10000 * 10**6);      // 10K USDT
            bnb.transfer(user, 100 * 10**18);        // 100 BNB
            
            console.log("+ User", user, "funded with test tokens");
        }
    }
    
    function _createCampaigns() private {
        console.log("\n[Step 5] Creating sample campaigns...");
        
        // 为每个项目创建Campaign
        for (uint256 i = 0; i < allProjects.length; i++) {
            address projectAddr = allProjects[i];
            string memory projectName = IProject(projectAddr).name();
            
            // 创建Campaign 1 - USDC奖池
            usdc.approve(address(campaignFactory), 1000 * 10**6); // 1000 USDC
            address campaign1 = campaignFactory.createCampaign(
                projectAddr,
                string(abi.encodePacked(projectName, " Community")),
                30, // 30天
                address(usdc),
                1000 * 10**6 // 1000 USDC
            );
            allCampaigns.push(campaign1);
            console.log("+ Campaign created for", projectName, "with USDC:", campaign1);
            
            // 创建Campaign 2 - WETH奖池 (仅为前两个项目)
            if (i < 2) {
                weth.approve(address(campaignFactory), 1 * 10**18); // 1 WETH
                address campaign2 = campaignFactory.createCampaign(
                    projectAddr,
                    "Crypto Foundation",
                    60, // 60天
                    address(weth),
                    1 * 10**18 // 1 WETH
                );
                allCampaigns.push(campaign2);
                console.log("+ Second campaign created for", projectName, "with WETH:", campaign2);
            }
        }
    }
    
    function _simulateUserInteractions() private {
        console.log("\n[Step 7] Simulating user interactions...");
        
        // 模拟用户评论和点赞
        for (uint256 i = 0; i < allProjects.length; i++) {
            address projectAddr = allProjects[i];
            IProject project = IProject(projectAddr);
            string memory projectName = project.name();
            
            console.log("+ Simulating interactions for", projectName);
            
            // Alice 发表评论
            vm.prank(alice);
            uint256 comment1 = project.postComment(
                string(abi.encodePacked("Great project! ", projectName, " has amazing potential for the future of blockchain."))
            );
            
            // Bob 发表评论
            vm.prank(bob);
            uint256 comment2 = project.postComment(
                string(abi.encodePacked("I'm bullish on ", projectName, ". The technology is revolutionary!"))
            );
            
            // Charlie 发表评论
            vm.prank(charlie);
            uint256 comment3 = project.postComment(
                string(abi.encodePacked(projectName, " is leading the innovation in crypto space. Excited to be part of this community!"))
            );
            
            // 用户互相点赞
            vm.prank(bob);
            project.likeComment(comment1);
            
            vm.prank(charlie);
            project.likeComment(comment1);
            
            vm.prank(alice);
            project.likeComment(comment2);
            
            vm.prank(david);
            project.likeComment(comment2);
            
            vm.prank(alice);
            project.likeComment(comment3);
            
            console.log("  - 3 comments posted, 5 likes given");
        }
    }
    
    function _outputFinalState() private {
        console.log("\n[Step 6] Final deployment state:");
        console.log("Platform:", address(platform));
        console.log("ProjectFactory:", address(projectFactory));
        console.log("CampaignFactory:", address(campaignFactory));
        console.log("PriceOracle:", address(priceOracle));
        
        console.log("\nProjects created:", allProjects.length);
        for (uint256 i = 0; i < allProjects.length; i++) {
            console.log("  -", IProject(allProjects[i]).name(), ":", allProjects[i]);
        }
        
        console.log("\nCampaigns created:", allCampaigns.length);
        for (uint256 i = 0; i < allCampaigns.length; i++) {
            ICampaign campaign = ICampaign(allCampaigns[i]);
            console.log("  -", campaign.name(), ":", allCampaigns[i]);
        }
        
        console.log("\nTest tokens:");
        console.log("  - USDC:", address(usdc));
        console.log("  - WETH:", address(weth));
        console.log("  - DAI:", address(dai));
        console.log("  - USDT:", address(usdt));
        console.log("  - BNB:", address(bnb));
    }
    
    function _writeDeploymentInfo() private {
        console.log("\n[Step 8] Writing deployment info...");
        
        // Generate projects JSON
        string memory projectsJson = "";
        for (uint256 i = 0; i < allProjects.length; i++) {
            if (i > 0) projectsJson = string(abi.encodePacked(projectsJson, ',\n    '));
            
            IProject project = IProject(allProjects[i]);
            string memory projectName = project.name();
            string memory symbol = project.symbol();
            
            projectsJson = string(abi.encodePacked(
                projectsJson,
                '"', _toLowerCase(symbol), '": {\n',
                '      "name": "', projectName, '",\n',
                '      "symbol": "', symbol, '",\n',
                '      "address": "', _addressToString(allProjects[i]), '"\n',
                '    }'
            ));
        }
        
        // Generate standard JSON format
        string memory deploymentInfo = string(abi.encodePacked(
            '{\n',
            '  "network": "localhost",\n',
            '  "timestamp": "', _uint2str(block.timestamp), '",\n',
            '  "platform": "', _addressToString(address(platform)), '",\n',
            '  "priceOracle": "', _addressToString(address(priceOracle)), '",\n',
            '  "projectFactory": "', _addressToString(address(projectFactory)), '",\n',
            '  "campaignFactory": "', _addressToString(address(campaignFactory)), '",\n',
            '  "projectImplementation": "', _addressToString(address(projectImpl)), '",\n',
            '  "campaignImplementation": "', _addressToString(address(campaignImpl)), '",\n',
            '  "tokens": {\n',
            '    "usdc": "', _addressToString(address(usdc)), '",\n',
            '    "weth": "', _addressToString(address(weth)), '",\n',
            '    "dai": "', _addressToString(address(dai)), '",\n',
            '    "usdt": "', _addressToString(address(usdt)), '",\n',
            '    "bnb": "', _addressToString(address(bnb)), '"\n',
            '  },\n',
            '  "projects": {\n',
            '    ', projectsJson, '\n',
            '  },\n',
            '  "sampleUsers": {\n',
            '    "alice": "', _addressToString(alice), '",\n',
            '    "bob": "', _addressToString(bob), '",\n',
            '    "charlie": "', _addressToString(charlie), '",\n',
            '    "david": "', _addressToString(david), '"\n',
            '  }\n',
            '}'
        ));
        
        vm.writeFile("./deployments.json", deploymentInfo);
        console.log("+ Deployment info written to deployments.json");
    }
    
    function _addressToString(address _addr) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
    
    function _uint2str(uint256 _i) private pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    function _toLowerCase(string memory str) private pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint256 i = 0; i < bStr.length; i++) {
            // 如果是大写字母 (A-Z)，转换为小写
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
} 