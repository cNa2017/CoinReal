// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {console} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import "./utils/BaseMultiDeploy.sol";
import "../../src/mocks/MockERC20.sol";
import "../../src/interfaces/IProject.sol";

/**
 * @title Step5_InitializeData
 * @notice 第五步：初始化测试数据（可选）
 * @dev 使用方法: forge script script/multi_deploy/Step5_InitializeData.s.sol --network <network_name> --broadcast
 */
contract Step5_InitializeData is BaseMultiDeploy {
    using stdJson for string;
    
    // 示例用户地址（用私钥生成的确定性地址）
    address public constant alice = 0x61066c18AE1cBF46b71110ab24C33689A4F1817b;   // 私钥2
    address public constant bob = 0xae36225C6Db93Be9F67305E763AaaAc2219eBa1c;     // 私钥3
    address public constant charlie = 0xbD5A5adDf604FC215F78B3Bf3B71380a6642fEb2; // 私钥4
    address public constant david = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;   // 私钥5
    // address public constant alice = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;   // 私钥2
    // address public constant bob = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;     // 私钥3
    // address public constant charlie = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; // 私钥4
    // address public constant david = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;   // 私钥5
    
    function run() external {
        // 从环境变量获取网络名称，默认为anvil
        string memory networkName = vm.envOr("NETWORK", string("anvil"));
        
        // 初始化网络配置
        initializeNetwork(networkName);
        
        console.log("=== Step 5: Initializing Test Data (Optional) ===");
        
        // 检查是否应该跳过数据初始化（生产环境）
        bool skipDataInit = vm.envOr("SKIP_DATA_INIT", false);
        
        if (skipDataInit) {
            console.log("Step 5 skipped for production deployment");
            return;
        }
        
        // 读取现有配置
        string memory configPath = string(abi.encodePacked("./", configFileName));
        require(vm.exists(configPath), "Config file not found!");
        
        string memory existingJson = vm.readFile(configPath);
        
        // 检查代币
        address usdcAddress;
        address wethAddress;
        address daiAddress;
        address usdtAddress;
        address bnbAddress;
        
        try vm.parseJsonAddress(existingJson, ".tokens.usdc") returns (address addr) {
            usdcAddress = addr;
        } catch {
            revert("Tokens not deployed! Please run Step2 first.");
        }
        
        try vm.parseJsonAddress(existingJson, ".tokens.weth") returns (address addr) {
            wethAddress = addr;
        } catch {
            revert("WETH token not found in config!");
        }
        
        try vm.parseJsonAddress(existingJson, ".tokens.dai") returns (address addr) {
            daiAddress = addr;
        } catch {
            revert("DAI token not found in config!");
        }
        
        try vm.parseJsonAddress(existingJson, ".tokens.usdt") returns (address addr) {
            usdtAddress = addr;
        } catch {
            revert("USDT token not found in config!");
        }
        
        try vm.parseJsonAddress(existingJson, ".tokens.bnb") returns (address addr) {
            bnbAddress = addr;
        } catch {
            revert("BNB token not found in config!");
        }
        
        // 检查项目
        address[] memory projectAddresses = new address[](9);
        try vm.parseJsonAddress(existingJson, ".projects.btc.address") returns (address addr) {
            projectAddresses[0] = addr;
        } catch {
            revert("Projects not created! Please run Step3 first.");
        }
        
        string[8] memory projectKeys = ["eth", "sol", "matic", "arb", "uni", "aave", "os", "axs"];
        for (uint256 i = 0; i < projectKeys.length; i++) {
            string memory key = string(abi.encodePacked(".projects.", projectKeys[i], ".address"));
            try vm.parseJsonAddress(existingJson, key) returns (address addr) {
                projectAddresses[i + 1] = addr;
            } catch {
                revert(string(abi.encodePacked("Project ", projectKeys[i], " not found in config!")));
            }
        }
        
        // 开始初始化
        startBroadcast();
        
        // 1. 分配测试代币给用户
        _setupUsers(usdcAddress, wethAddress, daiAddress, usdtAddress, bnbAddress);
        
        stopBroadcast();
        
        // 2. 模拟用户交互（不需要广播，使用prank）
        _simulateUserInteractions(projectAddresses);
        
        // 3. 更新配置文件，添加示例用户信息
        _addSampleUsersToConfig();
        
        console.log("Step 5 completed successfully!");
    }
    
    /**
     * @dev 给示例用户分配测试代币
     */
    function _setupUsers(
        address usdcAddress,
        address wethAddress,
        address daiAddress,
        address usdtAddress,
        address bnbAddress
    ) private {
        MockERC20 usdc = MockERC20(usdcAddress);
        MockERC20 weth = MockERC20(wethAddress);
        MockERC20 dai = MockERC20(daiAddress);
        MockERC20 usdt = MockERC20(usdtAddress);
        MockERC20 bnb = MockERC20(bnbAddress);
        
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
        }
    }
    
    /**
     * @dev 模拟用户交互（评论和点赞）
     */
    function _simulateUserInteractions(address[] memory projectAddresses) private {
        // 模拟用户评论和点赞
        for (uint256 i = 0; i < projectAddresses.length; i++) {
            address projectAddr = projectAddresses[i];
            IProject project = IProject(projectAddr);
            string memory projectName = project.name();
            
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
        }
    }
    
    /**
     * @dev 添加示例用户信息到配置文件
     */
    function _addSampleUsersToConfig() private {
        // 读取现有配置
        string memory existingJson = vm.readFile(configFileName);
        
        // 重新构建JSON（简化处理）
        DeploymentConfig memory config = readDeploymentConfig();
        
        string memory json = "";
        json = string(abi.encodePacked('{\n'));
        json = string(abi.encodePacked(json, '  "network": "', config.network, '",\n'));
        json = string(abi.encodePacked(json, '  "timestamp": "', _uint2str(config.timestamp), '",\n'));
        json = string(abi.encodePacked(json, '  "platform": "', _addressToString(config.platform), '",\n'));
        json = string(abi.encodePacked(json, '  "priceOracle": "', _addressToString(config.priceOracle), '",\n'));
        json = string(abi.encodePacked(json, '  "projectFactory": "', _addressToString(config.projectFactory), '",\n'));
        json = string(abi.encodePacked(json, '  "campaignFactory": "', _addressToString(config.campaignFactory), '",\n'));
        json = string(abi.encodePacked(json, '  "projectImplementation": "', _addressToString(config.projectImplementation), '",\n'));
        json = string(abi.encodePacked(json, '  "campaignImplementation": "', _addressToString(config.campaignImplementation), '",\n'));
        
        // 添加代币配置
        string memory usdcAddr;
        try vm.parseJsonString(existingJson, ".tokens.usdc") returns (string memory addr) {
            usdcAddr = addr;
        } catch {
            // tokens字段不存在，跳过
        }
        
        if (bytes(usdcAddr).length > 0) {
            json = string(abi.encodePacked(json, '  "tokens": {\n'));
            json = string(abi.encodePacked(json, '    "usdc": "', usdcAddr, '",\n'));
            
            string memory wethAddr;
            try vm.parseJsonString(existingJson, ".tokens.weth") returns (string memory addr) {
                wethAddr = addr;
            } catch {}
            
            string memory daiAddr;
            try vm.parseJsonString(existingJson, ".tokens.dai") returns (string memory addr) {
                daiAddr = addr;
            } catch {}
            
            string memory usdtAddr;
            try vm.parseJsonString(existingJson, ".tokens.usdt") returns (string memory addr) {
                usdtAddr = addr;
            } catch {}
            
            string memory bnbAddr;
            try vm.parseJsonString(existingJson, ".tokens.bnb") returns (string memory addr) {
                bnbAddr = addr;
            } catch {}
            
            json = string(abi.encodePacked(json, '    "weth": "', wethAddr, '",\n'));
            json = string(abi.encodePacked(json, '    "dai": "', daiAddr, '",\n'));
            json = string(abi.encodePacked(json, '    "usdt": "', usdtAddr, '",\n'));
            json = string(abi.encodePacked(json, '    "bnb": "', bnbAddr, '"\n'));
            json = string(abi.encodePacked(json, '  },\n'));
        }
        
        // 添加项目配置
        string memory btcAddr;
        try vm.parseJsonString(existingJson, ".projects.btc.address") returns (string memory addr) {
            btcAddr = addr;
        } catch {
            // projects字段不存在，跳过
        }
        
        if (bytes(btcAddr).length > 0) {
            json = string(abi.encodePacked(json, '  "projects": {\n'));
            json = string(abi.encodePacked(json, '    "btc": {\n'));
            
            string memory btcName;
            try vm.parseJsonString(existingJson, ".projects.btc.name") returns (string memory name) {
                btcName = name;
            } catch {}
            
            string memory btcSymbol;
            try vm.parseJsonString(existingJson, ".projects.btc.symbol") returns (string memory symbol) {
                btcSymbol = symbol;
            } catch {}
            
            json = string(abi.encodePacked(json, '      "name": "', btcName, '",\n'));
            json = string(abi.encodePacked(json, '      "symbol": "', btcSymbol, '",\n'));
            json = string(abi.encodePacked(json, '      "address": "', btcAddr, '"\n'));
            json = string(abi.encodePacked(json, '    }'));
            
            // 添加其他项目（简化处理）
            string[8] memory otherProjects = ["eth", "sol", "matic", "arb", "uni", "aave", "os", "axs"];
            for (uint256 i = 0; i < otherProjects.length; i++) {
                string memory projectName;
                string memory projectSymbol;
                string memory projectAddr;
                
                try vm.parseJsonString(existingJson, string(abi.encodePacked(".projects.", otherProjects[i], ".name"))) returns (string memory name) {
                    projectName = name;
                } catch {}
                
                try vm.parseJsonString(existingJson, string(abi.encodePacked(".projects.", otherProjects[i], ".symbol"))) returns (string memory symbol) {
                    projectSymbol = symbol;
                } catch {}
                
                try vm.parseJsonString(existingJson, string(abi.encodePacked(".projects.", otherProjects[i], ".address"))) returns (string memory addr) {
                    projectAddr = addr;
                } catch {}
                
                json = string(abi.encodePacked(json, ',\n    "', otherProjects[i], '": {\n'));
                json = string(abi.encodePacked(json, '      "name": "', projectName, '",\n'));
                json = string(abi.encodePacked(json, '      "symbol": "', projectSymbol, '",\n'));
                json = string(abi.encodePacked(json, '      "address": "', projectAddr, '"\n'));
                json = string(abi.encodePacked(json, '    }'));
            }
            
            json = string(abi.encodePacked(json, '\n  },\n'));
        }
        
        // 添加示例用户
        json = string(abi.encodePacked(json, '  "sampleUsers": {\n'));
        json = string(abi.encodePacked(json, '    "alice": "', _addressToString(alice), '",\n'));
        json = string(abi.encodePacked(json, '    "bob": "', _addressToString(bob), '",\n'));
        json = string(abi.encodePacked(json, '    "charlie": "', _addressToString(charlie), '",\n'));
        json = string(abi.encodePacked(json, '    "david": "', _addressToString(david), '"\n'));
        json = string(abi.encodePacked(json, '  }\n'));
        json = string(abi.encodePacked(json, '}'));
        
        vm.writeFile(configFileName, json);
    }
} 