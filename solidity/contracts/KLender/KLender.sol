// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./Controller.sol";

/**
 * @title KLender
 * @dev Lending contract that allows users to borrow stablecoins (USDT)
 * using another token (FLYM) as collateral. Inherits logic from LenderController.
 */
contract KLender is LenderController {
    /**
     * @dev Constructor sets the stable token and collateral token used by the protocol.
     * @param stableTokenAddress The address of the ERC20 token used for lending (USDT)
     * @param collateralTokenAddress The address of the ERC20 token used as collateral (FLYM)
     */
    constructor(address stableTokenAddress, address collateralTokenAddress, address controllerAddress) {
        setStableToken(stableTokenAddress);
        _collateralToken = IERC20(collateralTokenAddress);
        _controller = controllerAddress;
    }

    /**
     * @notice Allows users to borrow stablecoins by locking collateral.
     * @param amount The amount of stablecoins to borrow.
     */
    function borrow(uint256 amount) external nonReentrant {
        require(loans[msg.sender].principal == 0, "Loan already exists");

        uint256 interest = (amount * interestRate) / 100;
        uint256 collateralRequired = convertUSDTToCollateral(((amount + interest) * collateralRatio) / 100);

        loans[msg.sender] = Loan({
            principal: amount,
            interestAmount: interest,
            collateralAmount: collateralRequired,
            startTimestamp: block.timestamp,
            isApproved: false
        });

        emit LoanRequested(msg.sender, collateralRequired);
    }

    
    /**
     * @notice Approves the loan and transfers the stablecoins to the borrower by the controller.
     * @param borrower The address of the borrower.
     */
    function approveBorrow(address borrower) external nonReentrant {
        require(msg.sender == _controller, "Only controller can approve loans");

        Loan memory loan = loans[borrower];
        require(loan.principal > 0, "Loan does not exist");

        require(_collateralToken.transferFrom(address(borrower), address(this), loan.collateralAmount), "Collateral transfer failed");
        require(_stableToken.transfer(address(borrower), loan.principal), "USDT transfer failed");

        loans[borrower].isApproved = true;

        emit LoanIssued(msg.sender, loan.principal, loan.collateralAmount);
    }


    /**
     * @notice Controller can cancel a loan request if it has not been approved.
     * @param borrower The address of the borrower.
     */

    function cancelRequest(address borrower) external {
        Loan memory loan = loans[borrower];
        require(loan.principal != 0, "Loan does not exist");
        require(!loan.isApproved, "Loan already approved");
        emit LoanDenied(borrower);
        delete loans[borrower];
    }



    /**
     * @notice Simulates how much collateral would be required for a given USDT loan.
     * @param amount The desired loan amount in USDT.
     * @return collateralRequired The amount of collateral required
     * @return interest The calculated interest
     */
    function simulateBorrowFromUSDT(uint256 amount) external view returns (uint256 collateralRequired, uint256 interest) {
        interest = (amount * interestRate) / 100;
        collateralRequired = convertUSDTToCollateral(((amount + interest) * collateralRatio) / 100);
        return (collateralRequired, interest);
    }

    /**
     * @notice Simulates the maximum loan and interest given a FLYM amount as collateral.
     * @param flymAmount The amount of collateral the user wants to deposit.
     * @return maxBorrow The maximum amount of USDT that can be borrowed
     * @return interest The interest that would be charged on the max borrow
     */
    function simulateBorrowFromCollateral(uint256 flymAmount) external view returns (uint256 maxBorrow, uint256 interest) {
        uint256 collateralValueInUSDT = convertCollateralToUSDT(flymAmount); 

        uint256 dominator = collateralRatio * (100 + interestRate); 
        uint256 amount = collateralValueInUSDT * 10000 / dominator; // scaled with *10000 for precision

        uint256 calculatedInterest = (amount * interestRate) / 100;

        return (amount, calculatedInterest);
    }

    /**
     * @notice Repays the current loan in full and unlocks the collateral.
     */
    function repay() external nonReentrant {
        Loan memory loan = loans[msg.sender];
        uint256 totalOwed = loan.principal + loan.interestAmount;
        require(totalOwed > 0, "No debt to repay");
        require(loan.isApproved , "Loan not approved yet");

        require(_stableToken.balanceOf(msg.sender) >= totalOwed, "Insufficient stable token balance");
        require(_stableToken.transferFrom(msg.sender, address(this), totalOwed), "USDT repayment failed");
        require(_collateralToken.transfer(msg.sender, loan.collateralAmount), "Collateral return failed");

        emit LoanRepaid(msg.sender, totalOwed, loan.collateralAmount);

        delete loans[msg.sender];
    }

    /**
     * @notice Allows the owner to liquidate a loan if it's undercollateralized.
     * @param borrower The address of the user to be liquidated.
     */
    function liquidate(address borrower) external onlyOwner {
        require(loans[borrower].isApproved, "Loan not approved");
        require(isLiquidatable(borrower), "Loan is not eligible for liquidation");

        emit LoanLiquidated(borrower, msg.sender, loans[borrower].principal);

        delete loans[borrower];
    }

    /**
     * @notice Returns the current loan details for a borrower.
     * @param borrower The address of the borrower.
     * @return The Loan struct with all relevant data.
     */
    function getLoan(address borrower) external view returns (Loan memory) {
        return loans[borrower];
    }

    /// @notice Emitted when a new loan is requested
    event LoanRequested(address indexed borrower, uint256 collateralAmount);

    /// @notice Emitted when a loan request is denied
    event LoanDenied(address indexed borrower);

    /// @notice Emitted when a new loan is issued
    event LoanIssued(address indexed borrower, uint256 principal, uint256 collateralAmount);

    /// @notice Emitted when a loan is fully repaid
    event LoanRepaid(address indexed borrower, uint256 totalRepaid, uint256 collateralReturned);

    /// @notice Emitted when a loan is liquidated
    event LoanLiquidated(address indexed borrower, address indexed liquidator, uint256 principal);
}