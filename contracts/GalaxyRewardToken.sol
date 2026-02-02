// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GalaxyRewardToken (GTT)
 * @notice Internal reward token for educational use only (no real monetary value).
 * Minting is restricted to the Crowdfund contract (minter).
 */
contract GalaxyRewardToken is ERC20, Ownable {
    address public minter;

    error NotMinter();
    error ZeroAddress();

    constructor(address initialOwner)
        ERC20("Galaxy Transfer Token", "GTT")
        Ownable(initialOwner)
    {}

    function setMinter(address newMinter) external onlyOwner {
        if (newMinter == address(0)) revert ZeroAddress();
        minter = newMinter;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != minter) revert NotMinter();
        _mint(to, amount);
    }
}
