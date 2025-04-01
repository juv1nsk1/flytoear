// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title StakeController
 * @dev Abstract base contract that handles staking logic for ERC20 tokens.
 * Includes interest calculation, configuration of the token, and admin controls.
 */
contract StakeController is Ownable, ReentrancyGuard {
    // The ERC20 stable token used for staking (e.g. USDT)
    IERC20 internal _stableToken;

    // Monthly interest rate in basis points (e.g., 700 = 7.00%)
    uint256 public monthlyInterestRate = 700;

    /// @dev Represents a user's stake: amount and timestamp when staked
    struct Stake {
        uint256 amount;
        uint256 startTimestamp;
    }

    // Mapping from user address to stake information
    mapping(address => Stake) public stakes;

    /**
     * @notice Sets the stable token to be used for staking.
     * @dev Can only be called by the contract owner.
     * @param token The address of the ERC20 stable token contract.
     */
    function setStableToken(address token) public onlyOwner {
        require(token != address(0), "Invalid stable token address");
        _stableToken = IERC20(token);
        emit StableTokenSet(token);
    }

    /**
     * @notice Sets the monthly interest rate (in basis points).
     * @dev Example: 700 means 7% per month. Only callable by the owner.
     * @param newRate The new interest rate to apply.
     */
    function setMonthlyInterestRate(uint256 newRate) external onlyOwner {
        monthlyInterestRate = newRate;
        emit InterestRateSet(newRate);
    }

    /**
     * @notice Calculates the accumulated interest for a given user based on their stake.
     * @param user The address of the staker.
     * @return The interest amount in token units.
     */
    function calculateAccumulatedInterest(address user) public view returns (uint256) {
        Stake memory stakeData = stakes[user];
        if (stakeData.amount == 0) return 0;

        // Calculate days passed since the stake was created
        uint256 daysElapsed = (block.timestamp - stakeData.startTimestamp) / 1 days;

        // Convert monthly rate to daily (approximate: divide by 30)
        uint256 dailyRate = monthlyInterestRate / 30;

        // Calculate interest using basis points: amount * rate * time / 10000
        uint256 interest = (stakeData.amount * dailyRate * daysElapsed) / 10000;

        return interest;
    }


    /**
     * @notice Allows owner to withdraw stable tokens from the contract.
     * @param amount Amount to withdraw.
     * @param treasure Recipient address.
     */
    function withDrawStable(uint256 amount, address treasure) external onlyOwner {
        require(_stableToken.balanceOf(address(this)) >= amount, "Insufficient stable token balance");
        require(_stableToken.transfer(treasure, amount), "USDT transfer failed");
        emit StableWithdrawn(address(_stableToken), amount);
    }

    /// @notice Emitted when the stable token address is set
    event StableTokenSet(address indexed token);

    /// @notice Emitted when a new interest rate is set
    event InterestRateSet(uint256 newRate);
    
    /// @notice Emitted when stable tokens are withdrawn
    event StableWithdrawn(address indexed token, uint256 amount);
}