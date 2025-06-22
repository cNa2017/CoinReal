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

    function predictProjectAddress(bytes32 salt) external view returns (address predicted) {
        return Clones.predictDeterministicAddress(implementation, salt);
    }

    function isValidProject(address projectAddress) external view returns (bool isValid) {
        // Check if the address is a valid clone of our implementation
        return Clones.predictDeterministicAddress(implementation, keccak256(abi.encodePacked(projectAddress))) == projectAddress;
    }

    function getFactoryStats() external pure returns (
        uint256 totalProjects,
        string memory factoryVersion,
        uint256 creationFee
    ) {
        // Simplified implementation
        return (0, "1.0.0", 0);
    }

    function updateImplementation(address newImplementation) external view onlyOwner {
        // Not implemented for security - implementation is immutable
        revert("Implementation is immutable");
    }

    function setCreationFee(uint256 fee, address feeToken) external view onlyOwner {
        // Not implemented in this version
        revert("Not implemented");
    }

    function setPaused(bool paused) external view onlyOwner {
        // Not implemented in this version
        revert("Not implemented");
    }
} 