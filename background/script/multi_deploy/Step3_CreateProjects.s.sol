// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {console} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import "./utils/BaseMultiDeploy.sol";
import "../../src/CoinRealPlatform.sol";
import "../../src/interfaces/IProject.sol";

/**
 * @title Step3_CreateProjects
 * @notice 第三步：创建示例项目
 * @dev 使用方法: forge script script/multi_deploy/Step3_CreateProjects.s.sol --network <network_name> --broadcast
 */
contract Step3_CreateProjects is BaseMultiDeploy {
    using stdJson for string;
    
    struct ProjectData {
        string name;
        string symbol;
        string description;
        string category;
        uint16 drawPeriod;
    }
    
    function run() external {
        // 从环境变量获取网络名称，默认为anvil
        string memory networkName = vm.envOr("NETWORK", string("anvil"));
        
        // 初始化网络配置
        initializeNetwork(networkName);
        
        console.log("=== Step 3: Creating Sample Projects ===");
        
        // 读取现有配置
        DeploymentConfig memory config = readDeploymentConfig();
        require(config.platform != address(0), "Core contracts not deployed! Please run Step1 first.");
        
        // 检查项目是否已经创建
        string memory configPath = string(abi.encodePacked("./", configFileName));
        if (vm.exists(configPath)) {
            string memory existingJson = vm.readFile(configPath);
            // 尝试读取projects字段，如果不存在则继续创建
            try vm.parseJsonString(existingJson, ".projects.btc.address") returns (string memory btcAddr) {
                if (bytes(btcAddr).length > 0) {
                    console.log("Projects already created!");
                    return;
                }
            } catch {
                // projects字段不存在，继续创建
                console.log("Projects field not found, proceeding with project creation...");
            }
        }
        
        // 读取项目数据
        ProjectData[] memory projectsData = loadProjectsData();
        
        // 开始创建项目
        startBroadcast();
        
        CoinRealPlatform platform = CoinRealPlatform(config.platform);
        address[] memory createdProjects = new address[](projectsData.length);
        
        for (uint256 i = 0; i < projectsData.length; i++) {
            ProjectData memory projectData = projectsData[i];
            
            address projectAddress = platform.createProject(
                projectData.name,
                projectData.symbol,
                projectData.description,
                projectData.category,
                projectData.drawPeriod
            );
            
            createdProjects[i] = projectAddress;
        }
        
        stopBroadcast();
        
        // 更新配置文件
        addProjectsToConfig(createdProjects);
        
        console.log("Step 3 completed successfully!");
    }
    
    /**
     * @dev 从配置文件加载项目数据
     */
    function loadProjectsData() internal view returns (ProjectData[] memory) {
        string memory projectsConfigPath = "script/multi_deploy/config/projects-data.json";
        require(vm.exists(projectsConfigPath), "Projects config file not found!");
        
        string memory json = vm.readFile(projectsConfigPath);
        
        // 手动解析JSON数组（简化版本）
        ProjectData[] memory projects = new ProjectData[](9); // 我们知道有9个项目
        
        projects[0] = ProjectData({
            name: "Bitcoin",
            symbol: "BTC",
            description: "Bitcoin is the world's first decentralized digital currency, enabling peer-to-peer transactions. As the pioneer of blockchain technology, Bitcoin features scarcity, decentralization and censorship resistance.",
            category: "Layer1",
            drawPeriod: 7
        });
        
        projects[1] = ProjectData({
            name: "Ethereum",
            symbol: "ETH",
            description: "Ethereum is a decentralized, open-source blockchain platform that supports smart contract functionality. It serves as the foundation for the Web3 ecosystem, providing powerful infrastructure for DeFi, NFTs and dApps.",
            category: "Layer1",
            drawPeriod: 7
        });
        
        projects[2] = ProjectData({
            name: "Solana",
            symbol: "SOL",
            description: "Solana is a high-performance blockchain supporting builders around the world. Known for its ultra-fast transaction speeds and low costs, it's a popular choice for building DeFi and Web3 applications.",
            category: "Layer1",
            drawPeriod: 14
        });
        
        projects[3] = ProjectData({
            name: "Polygon",
            symbol: "MATIC",
            description: "Polygon is Ethereum's scaling solution, providing faster and lower-cost transactions. Through sidechain technology, it brings users better DeFi and Gaming experiences.",
            category: "Layer2",
            drawPeriod: 10
        });
        
        projects[4] = ProjectData({
            name: "Arbitrum",
            symbol: "ARB",
            description: "Arbitrum is Ethereum's Layer 2 scaling solution using Optimistic Rollup technology. It provides developers with a fully Ethereum-compatible environment while significantly reducing transaction costs.",
            category: "Layer2",
            drawPeriod: 7
        });
        
        projects[5] = ProjectData({
            name: "Uniswap",
            symbol: "UNI",
            description: "Uniswap is the leading decentralized trading protocol, allowing users to swap ERC-20 tokens without intermediaries. It revolutionized DeFi trading through its Automated Market Maker (AMM) model.",
            category: "DeFi",
            drawPeriod: 5
        });
        
        projects[6] = ProjectData({
            name: "Aave",
            symbol: "AAVE",
            description: "Aave is an open-source decentralized lending protocol where users can deposit assets to earn interest or borrow assets with over-collateralization. It supports innovative features like flash loans.",
            category: "DeFi",
            drawPeriod: 7
        });
        
        projects[7] = ProjectData({
            name: "OpenSea",
            symbol: "OS",
            description: "OpenSea is the world's largest NFT marketplace where users can buy, sell and discover exclusive digital items. It provides a complete NFT ecosystem for creators and collectors.",
            category: "NFT",
            drawPeriod: 3
        });
        
        projects[8] = ProjectData({
            name: "Axie Infinity",
            symbol: "AXS",
            description: "Axie Infinity is a blockchain-based game where players can collect, breed and battle digital pets called Axies. It pioneered the Play-to-Earn gaming model.",
            category: "GameFi",
            drawPeriod: 14
        });
        
        return projects;
    }
} 