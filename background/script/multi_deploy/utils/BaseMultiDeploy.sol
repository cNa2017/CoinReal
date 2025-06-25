// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import "../../../src/interfaces/IProject.sol";
import "../../../src/interfaces/ICampaign.sol";

/**
 * @title BaseMultiDeploy
 * @notice 多步部署的基础合约，提供通用功能
 */
abstract contract BaseMultiDeploy is Script {
    using stdJson for string;
    
    // 网络配置
    struct NetworkConfig {
        string name;
        string rpcUrl;
        uint256 privateKey;
        uint256 chainId;
        bool isTestnet;
    }
    
    // 部署配置
    struct DeploymentConfig {
        string network;
        uint256 timestamp;
        address platform;
        address priceOracle;
        address projectFactory;
        address campaignFactory;
        address projectImplementation;
        address campaignImplementation;
    }
    
    // 当前网络配置
    NetworkConfig public currentNetwork;
    string public configFileName;
    
    // 环境变量键名映射
    mapping(string => string) private rpcUrlKeys;
    mapping(string => string) private privateKeyKeys;
    
    constructor() {
        // 初始化环境变量键名映射
        rpcUrlKeys["anvil"] = "anvil_url";
        rpcUrlKeys["sepolia"] = "sepolia_url"; 
        rpcUrlKeys["avalanche_fuji"] = "avalanche_fuji_url";
        
        privateKeyKeys["anvil"] = "anvil_private_key";
        privateKeyKeys["sepolia"] = "sepolia_private_key";
        privateKeyKeys["avalanche_fuji"] = "avalanche_fuji_private_key";
    }
    
    /**
     * @dev 初始化网络配置
     */
    function initializeNetwork(string memory networkName) internal {
        currentNetwork.name = networkName;
        configFileName = string(abi.encodePacked("deployments-", networkName, ".json"));
        
        // 从环境变量获取RPC URL和私钥
        string memory rpcUrlKey = rpcUrlKeys[networkName];
        string memory privateKeyKey = privateKeyKeys[networkName];
        
        require(bytes(rpcUrlKey).length > 0, string(abi.encodePacked("Unsupported network: ", networkName)));
        
        currentNetwork.rpcUrl = vm.envString(rpcUrlKey);
        currentNetwork.privateKey = vm.envUint(privateKeyKey);
        
        // 设置网络特定配置
        if (keccak256(bytes(networkName)) == keccak256(bytes("anvil"))) {
            currentNetwork.chainId = 31337;
            currentNetwork.isTestnet = true;
        } else if (keccak256(bytes(networkName)) == keccak256(bytes("sepolia"))) {
            currentNetwork.chainId = 11155111;
            currentNetwork.isTestnet = true;
        } else if (keccak256(bytes(networkName)) == keccak256(bytes("avalanche_fuji"))) {
            currentNetwork.chainId = 43113;
            currentNetwork.isTestnet = true;
        }
        
        // Network initialized
    }
    
    /**
     * @dev 开始广播交易
     */
    function startBroadcast() internal {
        vm.startBroadcast(currentNetwork.privateKey);
    }
    
    /**
     * @dev 停止广播交易
     */
    function stopBroadcast() internal {
        vm.stopBroadcast();
    }
    
    /**
     * @dev 读取现有的部署配置
     */
    function readDeploymentConfig() internal view returns (DeploymentConfig memory config) {
        string memory configPath = string(abi.encodePacked("./", configFileName));
        
        if (!vm.exists(configPath)) {
            // 如果配置文件不存在，返回空配置
            return config;
        }
        
        string memory json = vm.readFile(configPath);
        
        config.network = json.readString(".network");
        config.timestamp = json.readUint(".timestamp");
        
        // 读取地址，如果字段存在则读取
        config.platform = json.readAddress(".platform");
        config.priceOracle = json.readAddress(".priceOracle");
        config.projectFactory = json.readAddress(".projectFactory");
        config.campaignFactory = json.readAddress(".campaignFactory");
        config.projectImplementation = json.readAddress(".projectImplementation");
        config.campaignImplementation = json.readAddress(".campaignImplementation");
    }
    
    /**
     * @dev 写入部署配置
     */
    function writeDeploymentConfig(DeploymentConfig memory config) internal {
        string memory json = "";
        
        // 基本信息
        json = string(abi.encodePacked('{\n'));
        json = string(abi.encodePacked(json, '  "network": "', config.network, '",\n'));
        json = string(abi.encodePacked(json, '  "timestamp": "', _uint2str(config.timestamp), '",\n'));
        
        // 核心合约地址
        if (config.platform != address(0)) {
            json = string(abi.encodePacked(json, '  "platform": "', _addressToString(config.platform), '",\n'));
        }
        if (config.priceOracle != address(0)) {
            json = string(abi.encodePacked(json, '  "priceOracle": "', _addressToString(config.priceOracle), '",\n'));
        }
        if (config.projectFactory != address(0)) {
            json = string(abi.encodePacked(json, '  "projectFactory": "', _addressToString(config.projectFactory), '",\n'));
        }
        if (config.campaignFactory != address(0)) {
            json = string(abi.encodePacked(json, '  "campaignFactory": "', _addressToString(config.campaignFactory), '",\n'));
        }
        if (config.projectImplementation != address(0)) {
            json = string(abi.encodePacked(json, '  "projectImplementation": "', _addressToString(config.projectImplementation), '",\n'));
        }
        if (config.campaignImplementation != address(0)) {
            json = string(abi.encodePacked(json, '  "campaignImplementation": "', _addressToString(config.campaignImplementation), '",\n'));
        }
        
        // 移除最后的逗号并关闭JSON
        if (bytes(json).length > 3) {
            // 移除最后的逗号和换行
            bytes memory jsonBytes = bytes(json);
            if (jsonBytes[jsonBytes.length - 2] == ',') {
                json = string(abi.encodePacked(substring(json, 0, bytes(json).length - 2), '\n'));
            }
        }
        json = string(abi.encodePacked(json, '}'));
        
        vm.writeFile(configFileName, json);
    }
    
    /**
     * @dev 添加代币配置到现有配置文件
     */
    function addTokensToConfig(
        address usdc,
        address weth, 
        address dai,
        address usdt,
        address bnb
    ) internal {
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
        json = string(abi.encodePacked(json, '  "tokens": {\n'));
        json = string(abi.encodePacked(json, '    "usdc": "', _addressToString(usdc), '",\n'));
        json = string(abi.encodePacked(json, '    "weth": "', _addressToString(weth), '",\n'));
        json = string(abi.encodePacked(json, '    "dai": "', _addressToString(dai), '",\n'));
        json = string(abi.encodePacked(json, '    "usdt": "', _addressToString(usdt), '",\n'));
        json = string(abi.encodePacked(json, '    "bnb": "', _addressToString(bnb), '"\n'));
        json = string(abi.encodePacked(json, '  }\n'));
        json = string(abi.encodePacked(json, '}'));
        
        vm.writeFile(configFileName, json);
    }
    
    /**
     * @dev 添加项目配置到现有配置文件
     */
    function addProjectsToConfig(address[] memory projectAddresses) internal {
        // 读取现有配置
        string memory existingJson = "";
        if (vm.exists(configFileName)) {
            existingJson = vm.readFile(configFileName);
        }
        
        // 构建项目JSON
        string memory projectsJson = "";
        for (uint256 i = 0; i < projectAddresses.length; i++) {
            if (i > 0) projectsJson = string(abi.encodePacked(projectsJson, ',\n    '));
            
            IProject project = IProject(projectAddresses[i]);
            string memory projectName = project.name();
            string memory symbol = project.symbol();
            
            projectsJson = string(abi.encodePacked(
                projectsJson,
                '"', _toLowerCase(symbol), '": {\n',
                '      "name": "', projectName, '",\n',
                '      "symbol": "', symbol, '",\n',
                '      "address": "', _addressToString(projectAddresses[i]), '"\n',
                '    }'
            ));
        }
        
        // 重新构建完整JSON（这里简化处理，实际应该解析现有JSON）
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
        
        // 添加代币配置（如果存在）
        if (vm.exists(configFileName)) {
            string memory existingConfig = vm.readFile(configFileName);
            string memory usdcAddr = existingConfig.readString(".tokens.usdc");
            if (bytes(usdcAddr).length > 0) {
                json = string(abi.encodePacked(json, '  "tokens": {\n'));
                json = string(abi.encodePacked(json, '    "usdc": "', usdcAddr, '",\n'));
                json = string(abi.encodePacked(json, '    "weth": "', existingConfig.readString(".tokens.weth"), '",\n'));
                json = string(abi.encodePacked(json, '    "dai": "', existingConfig.readString(".tokens.dai"), '",\n'));
                json = string(abi.encodePacked(json, '    "usdt": "', existingConfig.readString(".tokens.usdt"), '",\n'));
                json = string(abi.encodePacked(json, '    "bnb": "', existingConfig.readString(".tokens.bnb"), '"\n'));
                json = string(abi.encodePacked(json, '  },\n'));
            }
        }
        
        // 添加项目配置
        json = string(abi.encodePacked(json, '  "projects": {\n'));
        json = string(abi.encodePacked(json, '    ', projectsJson, '\n'));
        json = string(abi.encodePacked(json, '  }\n'));
        json = string(abi.encodePacked(json, '}'));
        
        vm.writeFile(configFileName, json);
    }
    
    // ====== 工具函数 ======
    
    function _addressToString(address _addr) internal pure returns (string memory) {
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
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
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
    
    function _toLowerCase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint256 i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
    
    function substring(string memory str, uint256 startIndex, uint256 endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
} 