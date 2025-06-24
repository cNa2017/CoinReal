// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IPriceOracle.sol";

interface IERC20Decimals {
    function decimals() external view returns (uint8);
}

contract MockPriceOracle is IPriceOracle {
    // Mock prices in USD with 8 decimals (e.g., 100_000_000 = $1.00)
    mapping(address => uint256) public tokenPrices;
    mapping(address => uint256) public lastUpdated;
    
    // Mock supported tokens
    address[] public supportedTokens;
    mapping(address => string) public tokenSymbols;
    
    constructor() {
        // Set some default mock prices
        // ETH = $2000
        tokenPrices[address(0)] = 2000 * 10**8;
        lastUpdated[address(0)] = block.timestamp;
        supportedTokens.push(address(0));
        tokenSymbols[address(0)] = "ETH";
        
        // Add some common mock tokens
        address mockUSDT = 0x1111111111111111111111111111111111111111;
        address mockUSDC = 0x2222222222222222222222222222222222222222;
        
        tokenPrices[mockUSDT] = 1 * 10**8; // $1.00
        lastUpdated[mockUSDT] = block.timestamp;
        supportedTokens.push(mockUSDT);
        tokenSymbols[mockUSDT] = "USDT";
        
        tokenPrices[mockUSDC] = 1 * 10**8; // $1.00
        lastUpdated[mockUSDC] = block.timestamp;
        supportedTokens.push(mockUSDC);
        tokenSymbols[mockUSDC] = "USDC";
    }
    
    function setPrice(address token, uint256 priceInUSD) external override {
        tokenPrices[token] = priceInUSD * 10**8;
        lastUpdated[token] = block.timestamp;
        
        // Add to supported tokens if not already present
        bool exists = false;
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == token) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            supportedTokens.push(token);
            tokenSymbols[token] = "MOCK";
        }
    }
    
    function setPriceWithDecimals(address token, uint256 price) external {
        tokenPrices[token] = price;
        lastUpdated[token] = block.timestamp;
        
        // Add to supported tokens if not already present
        bool exists = false;
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == token) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            supportedTokens.push(token);
            tokenSymbols[token] = "MOCK";
        }
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
        usdValue = usdValue * 10**6; // usd 6 decimals
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
        totalUSDValue = totalUSDValue * 10**6; // usd 6 decimals
    }
    
    // Additional required interface functions
    function getPrice(address token) external view returns (uint256 price, uint256 lastUpdate) {
        return (tokenPrices[token], lastUpdated[token]);
    }
    
    function getBatchPrices(address[] calldata tokens) external view returns (
        uint256[] memory prices,
        uint256[] memory lastUpdates
    ) {
        prices = new uint256[](tokens.length);
        lastUpdates = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            prices[i] = tokenPrices[tokens[i]];
            lastUpdates[i] = lastUpdated[tokens[i]];
        }
    }
    
    function isPriceAvailable(address token) external view returns (bool isAvailable, uint256 stalePeriod) {
        return (tokenPrices[token] > 0, 24 hours);
    }
    
    function getSupportedTokens() external view returns (
        address[] memory tokens,
        string[] memory symbols
    ) {
        tokens = new address[](supportedTokens.length);
        symbols = new string[](supportedTokens.length);
        
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            tokens[i] = supportedTokens[i];
            symbols[i] = tokenSymbols[supportedTokens[i]];
        }
    }
    
    function validatePrice(address token, uint256 expectedPrice) external view returns (
        bool isValid,
        uint256 deviation
    ) {
        uint256 currentPrice = tokenPrices[token];
        if (currentPrice == 0) return (false, 0);
        if (expectedPrice == 0) return (false, 0);
        
        uint256 diff = currentPrice > expectedPrice ? currentPrice - expectedPrice : expectedPrice - currentPrice;
        deviation = (diff * 10000) / expectedPrice; // basis points
        isValid = deviation <= 1000; // 10% tolerance
    }
    
    function getPriceRange(address token, uint256 period) external view returns (
        uint256 minPrice,
        uint256 maxPrice,
        uint256 avgPrice
    ) {
        uint256 currentPrice = tokenPrices[token];
        if (currentPrice == 0) {
            return (0, 0, 0);
        }
        
        // Mock some reasonable price range (±20% from current price)
        minPrice = (currentPrice * 80) / 100;
        maxPrice = (currentPrice * 120) / 100;
        avgPrice = currentPrice;
    }
    
    function addDataSource(address token, address dataSource, uint8 sourceType) external {
        // Mock implementation - do nothing
    }
    
    function setStalePeriod(uint256 stalePeriod) external {
        // Mock implementation - do nothing
    }
    
    function setPaused(bool paused) external {
        // Mock implementation - do nothing
    }
} 