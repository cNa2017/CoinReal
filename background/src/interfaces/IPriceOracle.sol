// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPriceOracle {
    function getUSDValue(address token, uint256 amount) external view returns (uint256 usdValue);
    function getBatchUSDValue(
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external view returns (uint256 totalUSDValue);
} 