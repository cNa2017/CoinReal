// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {console} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import "./utils/BaseMultiDeploy.sol";
import "../../src/CampaignFactory.sol";
import "../../src/mocks/MockERC20.sol";
import "../../src/interfaces/IProject.sol";
import "../../src/interfaces/ICampaign.sol";

/**
 * @title Step4_CreateCampaigns
 * @notice 第四步：为项目创建Campaign
 * @dev 使用方法: forge script script/multi_deploy/Step4_CreateCampaigns.s.sol --network <network_name> --broadcast
 */
contract Step4_CreateCampaigns is BaseMultiDeploy {
    using stdJson for string;
    
    function run() external {
        // 从环境变量获取网络名称，默认为anvil
        string memory networkName = vm.envOr("NETWORK", string("anvil"));
        
        // 初始化网络配置
        initializeNetwork(networkName);
        
        console.log("=== Step 4: Creating Sample Campaigns ===");
        
        // 读取现有配置
        DeploymentConfig memory config = readDeploymentConfig();
        require(config.platform != address(0), "Core contracts not deployed! Please run Step1 first.");
        require(config.campaignFactory != address(0), "CampaignFactory not found in config!");
        
        // 检查是否有代币和项目
        string memory configPath = string(abi.encodePacked("./", configFileName));
        require(vm.exists(configPath), "Config file not found!");
        
        string memory existingJson = vm.readFile(configPath);
        
        // 检查代币
        address usdcAddress;
        address wethAddress;
        try vm.parseJsonAddress(existingJson, ".tokens.usdc") returns (address addr) {
            usdcAddress = addr;
        } catch {
            revert("Tokens not deployed! Please run Step2 first.");
        }
        require(usdcAddress != address(0), "USDC token address is zero!");
        
        try vm.parseJsonAddress(existingJson, ".tokens.weth") returns (address addr) {
            wethAddress = addr;
        } catch {
            revert("WETH token not found in config!");
        }
        require(wethAddress != address(0), "WETH token address is zero!");
        
        // 检查项目
        address[] memory projectAddresses = new address[](9);
        try vm.parseJsonAddress(existingJson, ".projects.btc.address") returns (address addr) {
            projectAddresses[0] = addr;
        } catch {
            revert("Projects not created! Please run Step3 first.");
        }
        require(projectAddresses[0] != address(0), "BTC project address is zero!");
        
        // 读取其他项目地址
        string[8] memory projectKeys = ["eth", "sol", "matic", "arb", "uni", "aave", "os", "axs"];
        for (uint256 i = 0; i < projectKeys.length; i++) {
            string memory key = string(abi.encodePacked(".projects.", projectKeys[i], ".address"));
            try vm.parseJsonAddress(existingJson, key) returns (address addr) {
                projectAddresses[i + 1] = addr;
            } catch {
                revert(string(abi.encodePacked("Project ", projectKeys[i], " not found in config!")));
            }
            require(projectAddresses[i + 1] != address(0), 
                string(abi.encodePacked("Project ", projectKeys[i], " address is zero!")));
        }
        
        // 开始创建Campaign
        startBroadcast();
        
        CampaignFactory campaignFactory = CampaignFactory(config.campaignFactory);
        MockERC20 usdc = MockERC20(usdcAddress);
        MockERC20 weth = MockERC20(wethAddress);
        
        address[] memory allCampaigns = new address[](11); // 9个USDC Campaign + 2个WETH Campaign
        uint256 campaignIndex = 0;
        
        // 为每个项目创建USDC Campaign
        for (uint256 i = 0; i < projectAddresses.length; i++) {
            IProject project = IProject(projectAddresses[i]);
            string memory projectName = project.name();
            
            // 批准代币转移
            usdc.approve(address(campaignFactory), 1000 * 10**6); // 1000 USDC
            
            // 创建Campaign
            address campaign = campaignFactory.createCampaign(
                projectAddresses[i],
                string(abi.encodePacked(projectName, " Community")),
                43200, // 30天
                address(usdc),
                1000 * 10**6 // 1000 USDC
            );
            
            allCampaigns[campaignIndex] = campaign;
            campaignIndex++;
        }
        
        // 为前两个项目创建WETH Campaign
        for (uint256 i = 0; i < 2; i++) {
            // 批准代币转移
            weth.approve(address(campaignFactory), 1 * 10**18); // 1 WETH
            
            // 创建Campaign
            address campaign = campaignFactory.createCampaign(
                projectAddresses[i],
                "Crypto Foundation",
                86400, // 60天
                address(weth),
                1 * 10**18 // 1 WETH
            );
            
            allCampaigns[campaignIndex] = campaign;
            campaignIndex++;
        }
        
        stopBroadcast();
        
        console.log("Step 4 completed successfully!");
    }
} 