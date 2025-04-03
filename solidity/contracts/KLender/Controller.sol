// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LenderController
 * @dev Base contract providing lending logic, configuration controls and liquidation rules.
 * This contract is meant to be inherited by a lending protocol such as KLender.
 */
contract LenderController is Ownable(), ReentrancyGuard {

    IERC20 internal _stableToken;       // Token used for borrowing (USDT)
    IERC20 internal _collateralToken;   // Token used as collateral (FLYM)

    // Controller address - Flym Org 
    address internal _controller;

    // Protocol parameters
    uint256 public collateralRatio = 150;               // 150% collateral requirement
    uint256 public interestRate = 5;                    // 5% interest rate
    uint256 public liquidationThreshold = 110;         // liquidate if collateral < 110% of debt
    uint256 public gracePeriod = 90 days;              // Loan must be repaid within 90 days

    // Used to manage delayed collateral changes
    address internal _proposedCollateralToken;
    uint256 internal _collateralProposalUnlockTime;

    // Price of 1 unit of collateral in USDT (with 18 decimals)
    uint256 public flymPriceInUSDT = 1e18;

    /// Struct storing loan details for a user
    struct Loan {
        uint256 principal;
        uint256 interestAmount;
        uint256 collateralAmount;
        uint256 startTimestamp;
        bool isApproved;
    }

    mapping(address => Loan) public loans;

    /**
     * @notice Sets the ERC20 stable token used for loans.
     * @param token The token address.
     */
    function setStableToken(address token) public onlyOwner {
        require(token != address(0), "Invalid stable token address");
        _stableToken = IERC20(token);
        emit StableTokenSet(token);
    }

    /**
     * @notice Updates the required collateral ratio 
     * @param ratio The new collateral ratio.
     */
    function setCollateralRatio(uint256 ratio) external onlyOwner {
        require(ratio > 0 , "Invalid collateral ratio");
        collateralRatio = ratio;
    }

    /**
     * @notice Updates the loan interest rate (5 = 5%)
     * @param rate The new interest rate.
     */
    function setInterestRate(uint256 rate) external onlyOwner {
        require(rate > 0, "Invalid interest rate");
        interestRate = rate;
    }

    /**
     * @notice Updates the liquidation threshold.
     * @param threshold The minimum required collateral % before liquidation is allowed.
     */
    function setLiquidationThreshold(uint256 threshold) external onlyOwner {
        require(threshold > 0, "Invalid liquidation threshold");
        liquidationThreshold = threshold;
    }

    /**
     * @notice Sets the controller address.
     * @param controller The new controller address.
     */
    function setController(address controller) external onlyOwner {
        require(controller != address(0), "Invalid controller address");
        _controller = controller;
    }

    /**
     * @notice Sets the number of seconds a loan can remain unpaid before being liquidated.
     * @param period The new grace period in seconds.
     */
    function setGracePeriod(uint256 period) external onlyOwner {
        require(period > 0, "Invalid grace period");
        gracePeriod = period;
    }

    /// @notice Returns the address of the current stable token
    function getStableToken() external view returns (address) {
        return address(_stableToken);
    }

    /// @notice Returns the address of the current collateral token
    function getCollateralToken() external view returns (address) {
        return address(_collateralToken);
    }

    /**
     * @notice Proposes a new token to be used as collateral.
     * @dev Must be confirmed after 7 days via `confirmCollateralProposal`.
     * @param token The proposed new collateral token address.
     */
    function proposeCollateralToken(address token) external onlyOwner {
        require(token != address(0), "Invalid collateral token address");
        _proposedCollateralToken = token;
        _collateralProposalUnlockTime = block.timestamp + 7 days;
        emit CollateralTokenProposed(token);
    }

    /**
     * @notice Confirms the collateral token proposal after 7-day cooldown.
     */
    function confirmCollateralProposal() external onlyOwner {
        require(block.timestamp >= _collateralProposalUnlockTime, "Proposal is still locked");
        _collateralToken = IERC20(_proposedCollateralToken);
        emit CollateralTokenConfirmed(_proposedCollateralToken);
        _proposedCollateralToken = address(0);
    }

    /**
     * @notice Sets the price of 1 unit of collateral in USDT (scaled to 18 decimals).
     * @param newPrice The new price (1e18 = 1 USDT per collateral unit)
     */
    function setFlymPriceInUSDT(uint256 newPrice) external onlyOwner {
        flymPriceInUSDT = newPrice;
        emit FlymPriceSet(newPrice);
    }

    /**
     * @notice Converts collateral amount to equivalent USDT value.
     * @param amount Amount of collateral token.
     */
    function convertCollateralToUSDT(uint256 amount) public view returns (uint256) {
        return (amount * flymPriceInUSDT) / 1e18;
    }

    /**
     * @notice Converts USDT amount to required collateral.
     * @param amount Amount of USDT.
     */
    function convertUSDTToCollateral(uint256 amount) public view returns (uint256) {
        return (amount * 1e18) / flymPriceInUSDT;
    }

    /**
     * @notice Returns the USDT value at which the loan becomes eligible for liquidation.
     * @param borrower The address of the borrower.
     */
    function getLiquidationThreshold(address borrower) public view returns (uint256) {
        Loan memory loan = loans[borrower];
        uint256 total = loan.principal + loan.interestAmount;
        return (total * liquidationThreshold) / 100;
    }

    /**
     * @notice Checks if a loan can be liquidated.
     * @dev Can be based on insufficient collateral or loan overdue.
     * @param borrower The borrower to evaluate.
     * @return true if loan is liquidatable.
     */
    function isLiquidatable(address borrower) internal view returns (bool) {
        uint256 collateralValue = convertCollateralToUSDT(loans[borrower].collateralAmount);
        uint256 threshold = getLiquidationThreshold(borrower);
        return (
            collateralValue <= threshold ||
            block.timestamp >= loans[borrower].startTimestamp + gracePeriod
        );
    }

    /**
     * @notice Allows owner to withdraw collateral tokens from the contract.
     * @param amount Amount to withdraw.
     * @param treasure Recipient address.
     */
    function withDrawCollateral(uint256 amount, address treasure) external onlyOwner {
        require(_collateralToken.balanceOf(address(this)) >= amount, "Insufficient collateral balance");
        require(_collateralToken.transfer(treasure, amount), "Collateral transfer failed");
        emit CollateralWithdrawn(address(_collateralToken), amount);
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

    // Events
    event StableTokenSet(address indexed token);
    event CollateralTokenProposed(address indexed token);
    event CollateralTokenConfirmed(address indexed token);
    event FlymPriceSet(uint256 newPrice);
    event CollateralWithdrawn(address indexed token, uint256 amount);
    event StableWithdrawn(address indexed token, uint256 amount);
}