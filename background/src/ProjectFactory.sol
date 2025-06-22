// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IProjectFactory.sol";
import "./interfaces/IProject.sol";

contract ProjectFactory is IProjectFactory {
    address public immutable implementation;
    address public owner;
    
    event ProjectCreated(address indexed project, address indexed creator);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation");
        owner = msg.sender;
        implementation = _implementation;
    }
    
    function createProject(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata category,
        uint16 drawPeriod,
        address creator,
        address priceOracle,
        address platform
    ) external returns (address projectAddress) {
        // Use CREATE2 for deterministic addresses
        bytes32 salt = keccak256(abi.encodePacked(name, symbol, block.timestamp));
        
        // Deploy minimal proxy using Clones library
        projectAddress = Clones.cloneDeterministic(implementation, salt);
        
        require(projectAddress != address(0), "Clone creation failed");
        
        // Initialize the project
        IProject(projectAddress).initialize(
            name,
            symbol,
            description,
            category,
            drawPeriod,
            creator,
            priceOracle,
            platform
        );
        
        emit ProjectCreated(projectAddress, creator);
    }

    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
} 