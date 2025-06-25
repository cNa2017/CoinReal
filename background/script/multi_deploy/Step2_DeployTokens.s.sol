// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {console} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import "./utils/BaseMultiDeploy.sol";
import "../../src/mocks/MockERC20.sol";
import "../../src/mocks/MockPriceOracle.sol";

/**
 * @title Step2_DeployTokens
 * @notice 第二步：部署测试代币并设置价格
 * @dev 使用方法: forge script script/multi_deploy/Step2_DeployTokens.s.sol --network <network_name> --broadcast
 */
contract Step2_DeployTokens is BaseMultiDeploy {
    using stdJson for string;
    
    function run() external {
        // 从环境变量获取网络名称，默认为anvil
        string memory networkName = vm.envOr("NETWORK", string("anvil"));
        
        // 初始化网络配置
        initializeNetwork(networkName);
        
        console.log("=== Step 2: Deploying Test Tokens ===");
        
        // 读取现有配置
        DeploymentConfig memory config = readDeploymentConfig();
        require(config.platform != address(0), "Core contracts not deployed! Please run Step1 first.");
        require(config.priceOracle != address(0), "PriceOracle not found in config!");
        
        // 检查代币是否已经部署
        string memory configPath = string(abi.encodePacked("./", configFileName));
        if (vm.exists(configPath)) {
            string memory existingJson = vm.readFile(configPath);
            // 尝试读取tokens字段，如果不存在则继续部署
            try vm.parseJsonString(existingJson, ".tokens.usdc") returns (string memory usdcAddr) {
                if (bytes(usdcAddr).length > 0) {
                    console.log("Tokens already deployed!");
                    return;
                }
            } catch {
                // tokens字段不存在，继续部署
                console.log("Tokens field not found, proceeding with deployment...");
            }
        }
        
        // 开始部署
        startBroadcast();
        
        // 部署测试代币
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 10000000 * 10**6, 6);      // 10M USDC
        console.log("USDC deployed at:", address(usdc));
        
        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH", 100000 * 10**18, 18); // 100K WETH
        console.log("WETH deployed at:", address(weth));
        
        MockERC20 dai = new MockERC20("Dai Stablecoin", "DAI", 10000000 * 10**18, 18); // 10M DAI
        MockERC20 usdt = new MockERC20("Tether USD", "USDT", 10000000 * 10**6, 6);     // 10M USDT
        MockERC20 bnb = new MockERC20("BNB Token", "BNB", 1000000 * 10**18, 18);       // 1M BNB
        
        // 设置代币价格
        MockPriceOracle priceOracle = MockPriceOracle(config.priceOracle);
        priceOracle.setPriceWithDecimals(address(usdc), 1 * 10**8);      // $1.00
        priceOracle.setPriceWithDecimals(address(weth), 2500 * 10**8);   // $2500.00
        priceOracle.setPriceWithDecimals(address(dai), 1 * 10**8);       // $1.00
        priceOracle.setPriceWithDecimals(address(usdt), 1 * 10**8);      // $1.00
        priceOracle.setPriceWithDecimals(address(bnb), 300 * 10**8);     // $300.00
        
        stopBroadcast();
        
        // 更新配置文件
        addTokensToConfig(
            address(usdc),
            address(weth),
            address(dai),
            address(usdt),
            address(bnb)
        );
        
        console.log("Step 2 completed successfully!");
    }
} 