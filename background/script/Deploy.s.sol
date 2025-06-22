// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import "../src/CoinRealPlatform.sol";
import "../src/ProjectFactory.sol";
import "../src/Project.sol";
import "../src/mocks/MockPriceOracle.sol";
import "../src/mocks/MockERC20.sol";
import "../src/interfaces/IProject.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployScript is Script {
    // 部署的合约实例
    CoinRealPlatform public platform;
    MockPriceOracle public priceOracle;
    ProjectFactory public factory;
    Project public projectImpl;
    
    // Mock代币
    MockERC20 public usdc;
    MockERC20 public weth;
    MockERC20 public dai;
    MockERC20 public usdt;
    MockERC20 public bnb;
    
    // 项目地址
    address[] public allProjects;
    
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
        
        // 5. Add project sponsorship
        _addSponsorship();
        
        // 6. Simulate user interactions
        _simulateUserInteractions();
        
        // 7. Output final state
        _outputFinalState();
        
        vm.stopBroadcast();
        
        // 8. Generate deployment info file
        _writeDeploymentInfo();
        
        console.log("=== CoinReal Platform Deployment Completed ===");
    }
    
    function _deployCore() private {
        console.log("\n[Step 1] Deploying core contracts...");
        
        // Deploy price oracle
        priceOracle = new MockPriceOracle();
        console.log("MockPriceOracle deployed at:", address(priceOracle));
        
        // Deploy platform main contract
        platform = new CoinRealPlatform(address(priceOracle));
        console.log("CoinRealPlatform deployed at:", address(platform));
        console.log("CRTToken deployed at:", platform.crtToken());
        
        // Deploy project implementation contract
        projectImpl = new Project();
        console.log("Project implementation deployed at:", address(projectImpl));
        
        // Deploy project factory
        factory = new ProjectFactory(address(projectImpl));
        console.log("ProjectFactory deployed at:", address(factory));
        
        // Configure platform
        platform.setProjectFactory(address(factory));
        console.log("+ Project factory configured to platform");
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
        console.log("\n[Step 4] Allocating funds to sample users...");
        
        // Allocate test tokens to sample users
        address[] memory users = new address[](4);
        users[0] = alice;
        users[1] = bob; 
        users[2] = charlie;
        users[3] = david;
        
        for (uint256 i = 0; i < users.length; i++) {
            // Allocate different amounts of tokens
            uint256 multiplier = i + 1;
            
            usdc.mint(users[i], 50000 * 10**6 * multiplier);  // 50K-200K USDC
            weth.mint(users[i], 20 * 10**18 * multiplier);    // 20-80 WETH
            dai.mint(users[i], 30000 * 10**18 * multiplier);  // 30K-120K DAI
            usdt.mint(users[i], 40000 * 10**6 * multiplier);  // 40K-160K USDT
            bnb.mint(users[i], 1000 * 10**18 * multiplier);   // 1000-4000 BNB
            
            console.log("+ User", users[i], "received test tokens");
        }
    }
    
    function _addSponsorship() private {
        console.log("\n[Step 5] Adding project sponsorship...");
        
        // Add different scales of sponsorship to different projects
        
        // Bitcoin - Large USDC sponsorship
        _sponsorProject(allProjects[0], address(usdc), 100000 * 10**6); // 100K USDC
        _sponsorProject(allProjects[0], address(weth), 20 * 10**18);     // 20 WETH
        console.log("+ Bitcoin project received sponsorship");
        
        // Ethereum - Diversified sponsorship
        _sponsorProject(allProjects[1], address(usdc), 150000 * 10**6); // 150K USDC
        _sponsorProject(allProjects[1], address(weth), 30 * 10**18);     // 30 WETH
        _sponsorProject(allProjects[1], address(dai), 80000 * 10**18);   // 80K DAI
        console.log("+ Ethereum project received sponsorship");
        
        // Solana - Medium sponsorship
        _sponsorProject(allProjects[2], address(weth), 25 * 10**18);     // 25 WETH
        _sponsorProject(allProjects[2], address(bnb), 2000 * 10**18);    // 2000 BNB
        console.log("+ Solana project received sponsorship");
        
        // Polygon - Small sponsorship
        _sponsorProject(allProjects[3], address(usdc), 30000 * 10**6);   // 30K USDC
        _sponsorProject(allProjects[3], address(dai), 25000 * 10**18);   // 25K DAI
        console.log("+ Polygon project received sponsorship");
        
        // Other projects receive basic sponsorship
        for (uint256 i = 4; i < allProjects.length; i++) {
            _sponsorProject(allProjects[i], address(usdc), 10000 * 10**6); // 10K USDC
            console.log("+ Project", i+1, "received basic sponsorship");
        }
    }
    
    function _simulateUserInteractions() private {
        console.log("\n[Step 6] Simulating user interactions...");
        
        // Simulate Alice's activity
        vm.stopBroadcast();
        vm.startBroadcast(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d); // Alice's private key
        _simulateUserActivity(alice, "Alice");
        vm.stopBroadcast();
        
        // Simulate Bob's activity  
        vm.startBroadcast(0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a); // Bob's private key
        _simulateUserActivity(bob, "Bob");
        vm.stopBroadcast();
        
        // Simulate Charlie's activity
        vm.startBroadcast(0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6); // Charlie's private key
        _simulateUserActivity(charlie, "Charlie");
        vm.stopBroadcast();
        
        // Restore original broadcast
        vm.startBroadcast(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80);
        
        // Now simulate likes after all comments are posted
        _simulateLikes();
        
        console.log("+ User interactions simulation completed");
    }
    
    function _simulateUserActivity(address user, string memory userName) private {
        // Each user posts comments on different projects
        string[] memory comments = new string[](5);
        comments[0] = string(abi.encodePacked(userName, " is very interested in this project, great tech prospects!"));
        comments[1] = string(abi.encodePacked("Deep analysis from ", userName, ": this ecosystem has huge development potential"));
        comments[2] = string(abi.encodePacked(userName, " thinks this is a project worth long-term attention"));
        comments[3] = string(abi.encodePacked("As ", userName, ", I'm bullish on this project's future development"));
        comments[4] = string(abi.encodePacked(userName, "'s view: community building is a key success factor"));
        
        // Post comments on first 5 projects
        for (uint256 i = 0; i < 5 && i < allProjects.length; i++) {
            try IProject(allProjects[i]).postComment(comments[i]) {
                // Comment successful
            } catch {
                // Ignore errors, continue to next
            }
        }
    }
    
    function _simulateLikes() private {
        console.log("+ Simulating likes on comments...");
        
        // Each user likes some existing comments
        
        // Alice likes comments
        vm.stopBroadcast();
        vm.startBroadcast(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d);
        _likeComments("Alice");
        vm.stopBroadcast();
        
        // Bob likes comments
        vm.startBroadcast(0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a);
        _likeComments("Bob");
        vm.stopBroadcast();
        
        // Charlie likes comments
        vm.startBroadcast(0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6);
        _likeComments("Charlie");
        vm.stopBroadcast();
        
        // Restore broadcast
        vm.startBroadcast(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80);
    }
    
    function _likeComments(string memory userName) private {
        // Like comments on first few projects (where we know comments exist)
        for (uint256 i = 0; i < 3 && i < allProjects.length; i++) {
            // Try to like the first few comments on each project
            for (uint256 j = 0; j < 3; j++) {
                try IProject(allProjects[i]).likeComment(j) {
                    // Like successful
                } catch {
                    // Comment doesn't exist or other error, ignore
                    break; // No more comments on this project
                }
            }
        }
    }
    
    function _sponsorProject(address project, address token, uint256 amount) private {
        IERC20(token).approve(project, amount);
        try IProject(project).sponsor(token, amount) {
            // Sponsorship successful
        } catch {
            // Ignore errors, continue execution
        }
    }
    
    function _outputFinalState() private {
        console.log("\n[Step 7] Final state statistics...");
        
        (uint256 totalProjects, uint256 totalUsers, uint256 totalComments, uint256 totalPoolValue) 
            = platform.getPlatformStats();
            
        console.log("=== Platform Statistics ===");
        console.log("Total Projects:", totalProjects);
        console.log("Total Users:", totalUsers);
        console.log("Total Comments:", totalComments);
        console.log("Total Pool Value (USD):", totalPoolValue / 10**8);
        
        console.log("\n=== Project Details ===");
        for (uint256 i = 0; i < allProjects.length; i++) {
            IProject project = IProject(allProjects[i]);
            (, uint256 poolValue) = project.getPoolInfo();
            
            console.log(string(abi.encodePacked(
                project.name(), " (", project.symbol(), "): $", 
                _uint2str(poolValue / 10**8), " - ", project.category()
            )));
        }
    }
    
    function _writeDeploymentInfo() private {
        console.log("\n[Step 8] Generating deployment info file...");
        
        string memory projectsJson = "";
        for (uint256 i = 0; i < allProjects.length; i++) {
            IProject project = IProject(allProjects[i]);
            string memory projectJson = string(abi.encodePacked(
                '"', _toLowerCase(project.symbol()), '": "', _addressToString(allProjects[i]), '"'
            ));
            
            if (i > 0) {
                projectsJson = string(abi.encodePacked(projectsJson, ",\n    "));
            }
            projectsJson = string(abi.encodePacked(projectsJson, projectJson));
        }
        
        string memory deploymentInfo = string(abi.encodePacked(
            '{\n',
            '  "network": "localhost",\n',
            '  "timestamp": "', _uint2str(block.timestamp), '",\n',
            '  "platform": "', _addressToString(address(platform)), '",\n',
            '  "crtToken": "', _addressToString(platform.crtToken()), '",\n',
            '  "priceOracle": "', _addressToString(address(priceOracle)), '",\n',
            '  "projectFactory": "', _addressToString(address(factory)), '",\n',
            '  "projectImplementation": "', _addressToString(address(projectImpl)), '",\n',
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
    
    // Helper functions
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(data[i] >> 4)];
            str[3+i*2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
    
    function _toLowerCase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
} 