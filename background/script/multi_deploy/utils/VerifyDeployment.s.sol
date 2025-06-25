// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {console} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import "./BaseMultiDeploy.sol";
import "../../../src/CoinRealPlatform.sol";
import "../../../src/interfaces/IProject.sol";
import "../../../src/interfaces/ICampaign.sol";
import "../../../src/mocks/MockERC20.sol";

/**
 * @title VerifyDeployment
 * @notice 验证多步部署的结果
 * @dev 使用方法: forge script script/multi_deploy/utils/VerifyDeployment.s.sol --network <network_name>
 */
contract VerifyDeployment is BaseMultiDeploy {
    using stdJson for string;
    
    function run() external view {
        // 从环境变量获取网络名称，默认为anvil
        string memory networkName = vm.envOr("NETWORK", string("anvil"));
        
        console.log("Network:", networkName);
        
        // 读取配置文件
        string memory configFileName = string(abi.encodePacked("deployments-", networkName, ".json"));
        string memory configPath = string(abi.encodePacked("./", configFileName));
        
        if (!vm.exists(configPath)) {
            console.log("Config file not found:", configFileName);
            console.log("Please run deployment scripts first");
            return;
        }
        
        string memory json = vm.readFile(configPath);
        console.log("Config file found:", configFileName);
        
        // 验证核心合约
        _verifyCoreContracts(json);
        
        // 验证代币
        _verifyTokens(json);
        
        // 验证项目
        _verifyProjects(json);
        
        // 输出总结
        console.log("\n=== Verification Complete ===");
        console.log("All contracts deployed and configured successfully!");
    }
    
    function _verifyCoreContracts(string memory json) internal view {
        console.log("\nVerifying core contracts...");
        
        address platformAddr = json.readAddress(".platform");
        if (platformAddr != address(0)) {
            console.log("Platform:", platformAddr);
            
            // 检查平台配置
            CoinRealPlatform platform = CoinRealPlatform(platformAddr);
            
            address projectFactory = platform.projectFactory();
            address campaignFactory = platform.campaignFactory();
            
            console.log("  - ProjectFactory:", projectFactory);
            console.log("  - CampaignFactory:", campaignFactory);
            
            // 验证工厂地址匹配
            address expectedProjectFactory = json.readAddress(".projectFactory");
            address expectedCampaignFactory = json.readAddress(".campaignFactory");
            
            if (projectFactory == expectedProjectFactory) {
                console.log("  ProjectFactory configured correctly");
            } else {
                console.log("  ProjectFactory configuration error");
            }
            
            if (campaignFactory == expectedCampaignFactory) {
                console.log("  CampaignFactory configured correctly");
            } else {
                console.log("  CampaignFactory configuration error");
            }
        } else {
            console.log("Failed to read Platform address");
        }
        
        address oracleAddr = json.readAddress(".priceOracle");
        if (oracleAddr != address(0)) {
            console.log("PriceOracle:", oracleAddr);
        } else {
            console.log("Failed to read PriceOracle address");
        }
    }
    
    function _verifyTokens(string memory json) internal view {
        console.log("\nVerifying test tokens...");
        
        string[5] memory tokenNames = ["usdc", "weth", "dai", "usdt", "bnb"];
        string[5] memory tokenSymbols = ["USDC", "WETH", "DAI", "USDT", "BNB"];
        
        for (uint256 i = 0; i < tokenNames.length; i++) {
            address tokenAddr = json.readAddress(string(abi.encodePacked(".tokens.", tokenNames[i])));
            if (tokenAddr != address(0)) {
                MockERC20 token = MockERC20(tokenAddr);
                string memory symbol = token.symbol();
                uint256 totalSupply = token.totalSupply();
                
                console.log(string(abi.encodePacked(tokenSymbols[i], ": ", _addressToString(tokenAddr))));
                console.log(string(abi.encodePacked("  - Symbol: ", symbol)));
                console.log(string(abi.encodePacked("  - Total Supply: ", _uint2str(totalSupply))));
            } else {
                console.log(string(abi.encodePacked("Failed to read ", tokenSymbols[i], " address")));
            }
        }
    }
    
    function _verifyProjects(string memory json) internal view {
        console.log("\nVerifying projects...");
        
        string[9] memory projectKeys = ["btc", "eth", "sol", "matic", "arb", "uni", "aave", "os", "axs"];
        uint256 validProjects = 0;
        
        for (uint256 i = 0; i < projectKeys.length; i++) {
            address projectAddr = json.readAddress(string(abi.encodePacked(".projects.", projectKeys[i], ".address")));
            if (projectAddr != address(0)) {
                IProject project = IProject(projectAddr);
                string memory name = project.name();
                string memory symbol = project.symbol();
                string memory category = project.category();
                
                console.log(string(abi.encodePacked(name, " (", symbol, "): ", _addressToString(projectAddr))));
                console.log(string(abi.encodePacked("  - Category: ", category)));
                
                validProjects++;
            } else {
                console.log(string(abi.encodePacked("Failed to read project ", projectKeys[i])));
            }
        }
        
        console.log(string(abi.encodePacked("Valid projects: ", _uint2str(validProjects), "/9")));
        
        // 验证示例用户（如果存在）
        string memory aliceAddr = json.readString(".sampleUsers.alice");
        if (bytes(aliceAddr).length > 0) {
            console.log("\nSample users:");
            console.log(string(abi.encodePacked("  - Alice: ", aliceAddr)));
            console.log(string(abi.encodePacked("  - Bob: ", json.readString(".sampleUsers.bob"))));
            console.log(string(abi.encodePacked("  - Charlie: ", json.readString(".sampleUsers.charlie"))));
            console.log(string(abi.encodePacked("  - David: ", json.readString(".sampleUsers.david"))));
        } else {
            console.log("\nSample users: Not initialized");
        }
    }
} 