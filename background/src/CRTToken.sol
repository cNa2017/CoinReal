// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CRTToken is ERC20, Ownable {
    mapping(address => bool) public isMinter;
    
    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "Not a minter");
        _;
    }
    
    constructor() ERC20("CoinReal Token", "CRT") Ownable(msg.sender) {
        // Initial supply: 0 (tokens are minted as rewards)
    }
    
    // CRT tokens are non-transferable (soulbound)
    function transfer(address, uint256) public pure override returns (bool) {
        revert("CRT: tokens are non-transferable");
    }
    
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("CRT: tokens are non-transferable");
    }
    
    function approve(address, uint256) public pure override returns (bool) {
        revert("CRT: tokens are non-transferable");
    }
    
    // Add minter (for project contracts)
    function addMinter(address minter) external onlyOwner {
        isMinter[minter] = true;
    }
    
    // Remove minter
    function removeMinter(address minter) external onlyOwner {
        isMinter[minter] = false;
    }
    
    // Only project contracts can mint tokens
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
    
    // Burn tokens after reward distribution
    function burn(address from, uint256 amount) external onlyMinter {
        _burn(from, amount);
    }
} 