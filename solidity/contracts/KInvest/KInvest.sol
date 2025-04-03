// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./Controller.sol";

/**
 * @title KInvest
 * @dev A staking contract where users deposit stablecoins and receive them back with interest.
 * Inherits from StakeController which handles the logic for interest calculation and storage.
 */
contract KInvest is StakeController {
    /**
     * @notice Allows a user to stake a specific amount of stable tokens.
     * @param amount The amount of tokens to stake.
     */
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(stakes[msg.sender].amount == 0, "Already staked");

        // Transfer stable tokens from user to this contract
        require(_stableToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Record stake data
        stakes[msg.sender] = Stake({
            amount: amount,
            startTimestamp: block.timestamp
        });

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Allows a user to withdraw their stake along with accumulated interest.
     */
    function unstake() external nonReentrant {
        Stake memory stakeData = stakes[msg.sender];
        require(stakeData.amount > 0, "No stake found");

        uint256 interest = calculateAccumulatedInterest(msg.sender);
        uint256 total = stakeData.amount + interest;

        // Ensure contract has enough balance to repay
        require(_stableToken.balanceOf(address(this)) >= total, "Insufficient contract balance");

        // Transfer principal + interest back to user
        require(_stableToken.transfer(msg.sender, total), "Transfer failed");

        emit Unstaked(msg.sender, stakeData.amount, interest);

        // Remove stake record
        delete stakes[msg.sender];
    }

    /**
     * @notice Returns stake info for a given user.
     * @param user The address of the staker.
     * @return amount The staked amount
     * @return startTimestamp When the stake was made
     * @return accumulatedInterest Current calculated interest
     */
    function getStake(address user)
        external
        view
        returns (
            uint256 amount,
            uint256 startTimestamp,
            uint256 accumulatedInterest
        )
    {
        Stake memory stakeData = stakes[user];
        amount = stakeData.amount;
        startTimestamp = stakeData.startTimestamp;
        accumulatedInterest = calculateAccumulatedInterest(user);
    }

    /// @notice Emitted when a user stakes tokens
    event Staked(address indexed user, uint256 amount);

    /// @notice Emitted when a user unstakes and receives tokens + interest
    event Unstaked(address indexed user, uint256 amount, uint256 interest);

    /**
     * @notice Constructor sets the stable token (e.g. USDT) used for staking.
     * @param stableTokenAddress The address of the ERC20 stable token.
     */
    constructor(address stableTokenAddress) {
        setStableToken(stableTokenAddress);
    }
}