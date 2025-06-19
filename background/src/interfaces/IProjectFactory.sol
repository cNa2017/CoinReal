// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IProjectFactory {
    function createProject(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata category,
        uint16 drawPeriod,
        address creator,
        address priceOracle
    ) external returns (address projectAddress);
    
    function implementation() external view returns (address);
}