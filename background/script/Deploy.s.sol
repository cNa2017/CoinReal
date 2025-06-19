// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import "../src/CoinRealPlatform.sol";
import "../src/ProjectFactory.sol";
import "../src/Project.sol";
import "../src/mocks/MockPriceOracle.sol";
import "../src/mocks/MockERC20.sol";

contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MockPriceOracle
        MockPriceOracle priceOracle = new MockPriceOracle();
        console.log("MockPriceOracle deployed at:", address(priceOracle));
        
        // Deploy CoinRealPlatform
        CoinRealPlatform platform = new CoinRealPlatform(address(priceOracle));
        console.log("CoinRealPlatform deployed at:", address(platform));
        console.log("CRTToken deployed at:", platform.crtToken());
        
        // Deploy Project implementation
        Project projectImpl = new Project();
        console.log("Project implementation deployed at:", address(projectImpl));
        
        // Deploy ProjectFactory
        ProjectFactory factory = new ProjectFactory(address(projectImpl));
        console.log("ProjectFactory deployed at:", address(factory));
        
        // Set factory in platform
        platform.setProjectFactory(address(factory));
        
        // Deploy mock tokens with proper decimals
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 1000000 * 10**6, 6); // 1M USDC with 6 decimals
        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH", 1000 * 10**18, 18); // 1000 WETH with 18 decimals
        MockERC20 dai = new MockERC20("Dai Stablecoin", "DAI", 1000000 * 10**18, 18); // 1M DAI with 18 decimals
        
        console.log("USDC deployed at:", address(usdc));
        console.log("WETH deployed at:", address(weth));
        console.log("DAI deployed at:", address(dai));
        
        // Set token prices in oracle
        priceOracle.setPriceWithDecimals(address(usdc), 1 * 10**8); // $1
        priceOracle.setPriceWithDecimals(address(weth), 2000 * 10**8); // $2000
        priceOracle.setPriceWithDecimals(address(dai), 1 * 10**8); // $1
        
        // Create 3 sample projects
        address btcProject = platform.createProject(
            "Bitcoin",
            "BTC",
            "The original cryptocurrency. Bitcoin is a decentralized digital currency that enables peer-to-peer transactions.",
            "Layer1",
            7 // 7 days draw period
        );
        console.log("Bitcoin project created at:", btcProject);
        
        address ethProject = platform.createProject(
            "Ethereum",
            "ETH",
            "A decentralized platform that runs smart contracts. Ethereum is the foundation for the Web3 ecosystem.",
            "Layer1",
            7
        );
        console.log("Ethereum project created at:", ethProject);
        
        address solProject = platform.createProject(
            "Solana",
            "SOL",
            "A high-performance blockchain supporting builders around the world. Known for its speed and low transaction costs.",
            "Layer1",
            7
        );
        console.log("Solana project created at:", solProject);
        
        // Add some initial sponsorships to each project
        uint256 sponsorAmount = 1000 * 10**6; // 1000 USDC
        
        // Approve and sponsor Bitcoin project
        usdc.approve(btcProject, sponsorAmount);
        IProject(btcProject).sponsor(address(usdc), sponsorAmount);
        console.log("Sponsored Bitcoin project with 1000 USDC");
        
        // Approve and sponsor Ethereum project
        usdc.approve(ethProject, sponsorAmount * 2);
        IProject(ethProject).sponsor(address(usdc), sponsorAmount * 2);
        console.log("Sponsored Ethereum project with 2000 USDC");
        
        // Approve and sponsor Solana project with WETH
        uint256 wethAmount = 1 * 10**18; // 1 WETH ($2000)
        weth.approve(solProject, wethAmount);
        IProject(solProject).sponsor(address(weth), wethAmount);
        console.log("Sponsored Solana project with 1 WETH");
        
        // Log summary
        console.log("\n=== Deployment Summary ===");
        console.log("Platform:", address(platform));
        console.log("CRT Token:", platform.crtToken());
        console.log("Price Oracle:", address(priceOracle));
        console.log("Project Factory:", address(factory));
        console.log("\n=== Mock Tokens ===");
        console.log("USDC:", address(usdc));
        console.log("WETH:", address(weth));
        console.log("DAI:", address(dai));
        console.log("\n=== Projects ===");
        console.log("Bitcoin:", btcProject);
        console.log("Ethereum:", ethProject);
        console.log("Solana:", solProject);
        
        vm.stopBroadcast();
        
        // Write deployment info to file
        string memory deploymentInfo = string(abi.encodePacked(
            '{\n',
            '  "platform": "', _addressToString(address(platform)), '",\n',
            '  "crtToken": "', _addressToString(platform.crtToken()), '",\n',
            '  "priceOracle": "', _addressToString(address(priceOracle)), '",\n',
            '  "projectFactory": "', _addressToString(address(factory)), '",\n',
            '  "tokens": {\n',
            '    "usdc": "', _addressToString(address(usdc)), '",\n',
            '    "weth": "', _addressToString(address(weth)), '",\n',
            '    "dai": "', _addressToString(address(dai)), '"\n',
            '  },\n',
            '  "projects": {\n',
            '    "bitcoin": "', _addressToString(btcProject), '",\n',
            '    "ethereum": "', _addressToString(ethProject), '",\n',
            '    "solana": "', _addressToString(solProject), '"\n',
            '  }\n',
            '}'
        ));
        
        vm.writeFile("./deployments.json", deploymentInfo);
        console.log("\nDeployment info written to deployments.json");
    }
    
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
} 