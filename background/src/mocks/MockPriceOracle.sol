// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IPriceOracle.sol";

interface IERC20Decimals {
    function decimals() external view returns (uint8);
}

contract MockPriceOracle is IPriceOracle {
    // Mock prices in USD with 8 decimals (e.g., 100_000_000 = $1.00)
    mapping(address => uint256) public tokenPrices;
    
    constructor() {
        // Set some default mock prices
        // ETH = $2000
        tokenPrices[address(0)] = 2000 * 10**8;
    }
    
    function setPrice(address token, uint256 priceInUSD) external {
        tokenPrices[token] = priceInUSD * 10**8;
    }
    
    function setPriceWithDecimals(address token, uint256 price) external {
        tokenPrices[token] = price;
    }
    
    function getUSDValue(address token, uint256 amount) external view returns (uint256 usdValue) {
        uint256 price = tokenPrices[token];
        require(price > 0, "Price not set for token");
        
        // Get token decimals - for mock, we'll assume a standard way
        // In real implementation, you'd call token.decimals()
        uint8 tokenDecimals = 18; // Default
        if (token != address(0)) {
            try IERC20Decimals(token).decimals() returns (uint8 decimals) {
                tokenDecimals = decimals;
            } catch {
                tokenDecimals = 18; // Default fallback
            }
        }
        
        // Price has 8 decimals, token amount has tokenDecimals
        // Result should have 8 decimals
        usdValue = (amount * price) / (10**tokenDecimals);
    }
    
    function getBatchUSDValue(
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external view returns (uint256 totalUSDValue) {
        require(tokens.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 price = tokenPrices[tokens[i]];
            if (price > 0) {
                uint8 tokenDecimals = 18; // Default
                if (tokens[i] != address(0)) {
                    try IERC20Decimals(tokens[i]).decimals() returns (uint8 decimals) {
                        tokenDecimals = decimals;
                    } catch {
                        tokenDecimals = 18; // Default fallback
                    }
                }
                totalUSDValue += (amounts[i] * price) / (10**tokenDecimals);
            }
        }
    }
} 