// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {console} from "forge-std/Script.sol";
import "./utils/BaseMultiDeploy.sol";
import "../../src/CoinRealPlatform.sol";
import "../../src/ProjectFactory.sol";
import "../../src/Project.sol";
import "../../src/Campaign.sol";
import "../../src/CampaignFactory.sol";
import "../../src/mocks/MockPriceOracle.sol";

/**
 * @title Step1_DeployCore
 * @notice 第一步：部署核心合约
 * @dev 使用方法: forge script script/multi_deploy/Step1_DeployCore.s.sol --network <network_name> --broadcast
 */
contract Step1_DeployCore is BaseMultiDeploy {
    
    function run() external {
        // 从环境变量获取网络名称，默认为anvil
        string memory networkName = vm.envOr("NETWORK", string("anvil"));
        
        // 初始化网络配置
        initializeNetwork(networkName);
        
        console.log("=== Step 1: Deploying Core Contracts ===");
        
        // 检查是否已经部署过核心合约
        DeploymentConfig memory existingConfig = readDeploymentConfig();
        if (existingConfig.platform != address(0)) {
            console.log("Core contracts already deployed!");
            console.log("To redeploy, please delete the config file:", configFileName);
            return;
        }
        
        // 开始部署
        startBroadcast();
        
        // 1. 部署价格预言机
        MockPriceOracle priceOracle = new MockPriceOracle();
        console.log("MockPriceOracle deployed at:", address(priceOracle));
        
        // 2. 部署平台主合约
        CoinRealPlatform platform = new CoinRealPlatform(address(priceOracle));
        console.log("CoinRealPlatform deployed at:", address(platform));
        
        // 3. 部署项目实现合约
        Project projectImpl = new Project();
        
        // 4. 部署项目工厂合约
        ProjectFactory projectFactory = new ProjectFactory(address(projectImpl));
        console.log("ProjectFactory deployed at:", address(projectFactory));
        
        // 5. 部署Campaign实现合约
        Campaign campaignImpl = new Campaign();
        
        // 6. 部署Campaign工厂合约
        CampaignFactory campaignFactory = new CampaignFactory(address(campaignImpl));
        console.log("CampaignFactory deployed at:", address(campaignFactory));
        
        // 配置合约关联
        platform.setProjectFactory(address(projectFactory));
        platform.setCampaignFactory(address(campaignFactory));
        campaignFactory.setPlatform(address(platform));
        
        stopBroadcast();
        
        // 保存部署配置
        DeploymentConfig memory config = DeploymentConfig({
            network: currentNetwork.name,
            timestamp: block.timestamp,
            platform: address(platform),
            priceOracle: address(priceOracle),
            projectFactory: address(projectFactory),
            campaignFactory: address(campaignFactory),
            projectImplementation: address(projectImpl),
            campaignImplementation: address(campaignImpl)
        });
        
        writeDeploymentConfig(config);
        
        console.log("Step 1 completed successfully!");
    }
} 