// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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
        address priceOracle
    ) external returns (address projectAddress) {
        // Use CREATE2 for deterministic addresses
        bytes32 salt = keccak256(abi.encodePacked(name, symbol, block.timestamp));
        
        // Deploy minimal proxy
        bytes memory bytecode = _getCloneBytecode(implementation);
        assembly {
            projectAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        require(projectAddress != address(0), "Clone creation failed");
        
        // Initialize the project
        IProject(projectAddress).initialize(
            name,
            symbol,
            description,
            category,
            drawPeriod,
            creator,
            priceOracle
        );
        
        emit ProjectCreated(projectAddress, creator);
    }
    
    function _getCloneBytecode(address target) private pure returns (bytes memory) {
        bytes memory bytecode = new bytes(45);
        assembly {
            // Store the bytecode
            mstore(add(bytecode, 0x20), 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(bytecode, 0x34), shl(0x60, target))
            mstore(add(bytecode, 0x48), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
        }
        return bytecode;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
} 