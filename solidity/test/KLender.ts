const { expect } = require("chai");
const { ethers } = require("hardhat");
import config from "./config.json"

describe("KLender", function () {
  let owner, user:any, controller:any;
  let usdt:any, flym:any, klender:any;

  // const USDT_ADDRESS = config.USDT;
  // const FLYM_ADDRESS = config.FLYM;

  const BORROW_AMOUNT =  ethers.utils.parseUnits("1", 18);
  const BORROW_AMOUNT2 =  ethers.utils.parseUnits("10", 18);

  beforeEach(async () => {
    [owner, user, controller] = await ethers.getSigners();

    // // Load existing token contracts
    // flym = await ethers.getContractAt("IERC20", FLYM_ADDRESS);
    // usdt = await ethers.getContractAt("IERC20", USDT_ADDRESS);

    // Deploy USDT
    const Usdt = await ethers.getContractFactory("USDT");
    usdt = await Usdt.deploy();
    await usdt.deployed();


    // Deploy Flym
    const Flym = await ethers.getContractFactory("FLYM");
    flym = await Flym.deploy();
    await flym.deployed();

    // Deploy Klender
    const Klender = await ethers.getContractFactory("KLender");
    klender = await Klender.deploy(usdt.address, flym.address, controller.address);
    await klender.deployed();

    // Transfer USDT to Klender to simulating liquidity pool
    await usdt.transfer(klender.address, BORROW_AMOUNT);


    // Mint FLYM to user
    const flymWithOwner = flym.connect(owner);
    await flym.transfer(user.address, BORROW_AMOUNT2);
    await usdt.transfer(user.address, BORROW_AMOUNT2);
    
  });



  it("allow user to borrow", async () => {
    const flymUser = flym.connect(user);
    const klenderUser = klender.connect(user);
    const klenderController = klender.connect(controller);

    // await showBalance(user, usdt, flym);
    // await showBalance(klender, usdt, flym);

    await flymUser.approve(klender.address, BORROW_AMOUNT2);
    await klenderUser.borrow(BORROW_AMOUNT);


    // await showBalance(user, usdt, flym);
    // await showBalance(klender, usdt, flym);

    const loan = await klender.getLoan(user.address);
    //console.log(loan)
    expect(loan.principal).to.equal(BORROW_AMOUNT);
    expect(loan.isApproved).to.equal(false);

    await klenderController.approveBorrow(user.address);
    //await klenderUser.processBorrow();
    const approvedLoan = await klender.getLoan(user.address);
    expect(approvedLoan.isApproved).to.equal(true);

  });

  it("allow user to repay and get collateral back", async () => {
    const flymUser = flym.connect(user);
    const usdtUser = usdt.connect(user);
    const klenderUser = klender.connect(user);
    const klenderController = klender.connect(controller);


    // await showBalance(user, usdt, flym);
    // await showBalance(klender, usdt, flym);

    await flymUser.approve(klender.address, BORROW_AMOUNT2);
    await klenderUser.borrow(BORROW_AMOUNT);
    await klenderController.approveBorrow(user.address);
    //await klenderUser.processBorrow();

    const loan1 = await klender.getLoan(user.address);
    expect(loan1.principal).to.equal(BORROW_AMOUNT);

    const totalToRepay = BORROW_AMOUNT2; // 15% interest

    // //await usdt.transfer(user.address, totalToRepay);
    //console.log("totalToRepay", totalToRepay)

    // await showBalance(user, usdt, flym);
    // await showBalance(klender, usdt, flym);

    await usdtUser.approve(klender.address, totalToRepay);
    await klenderUser.repay();

    const loan = await klender.getLoan(user.address);
    expect(loan.principal).to.equal(0);

    // await showBalance(user, usdt, flym);
    // await showBalance(klender, usdt, flym);
  });

  it("allow the owner to liquidate after grace period", async () => {
    const flymUser = flym.connect(user);
    const klenderUser = klender.connect(user);
    const klenderController = klender.connect(controller);

    await flymUser.approve(klender.address, BORROW_AMOUNT2);
    await klenderUser.borrow(BORROW_AMOUNT);
    await klenderController.approveBorrow(user.address);
    //await klenderUser.processBorrow();

    // Fast forward beyond grace period
    await ethers.provider.send("evm_increaseTime", [91 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await klender.liquidate(user.address);

    const loan = await klender.getLoan(user.address);
    expect(loan.principal).to.equal(0);

  });

  it("simulate borrow from USDT", async () => {
    const amount = ethers.utils.parseUnits("100", 18);
    const [interest, collateralRequired] = await klender.simulateBorrowFromUSDT(amount);

    expect(interest).to.equal("157500000000000000000");
    expect(collateralRequired).to.equal("5000000000000000000");
  });

  it("simulate borrow from FLYM", async () => {
    const flymAmount = ethers.utils.parseUnits("200", 18);
    const [maxBorrow, interest] = await klender.simulateBorrowFromCollateral(flymAmount);

    const collateralInUSDT = await klender.convertCollateralToUSDT(flymAmount);
    const denom = (await klender.collateralRatio()).mul((await klender.interestRate()).add(100));
    const expectedAmount = collateralInUSDT.mul(10000).div(denom);
    const expectedInterest = expectedAmount.mul(await klender.interestRate()).div(100);

    expect(maxBorrow).to.be.closeTo(expectedAmount, 1); // allow 1 wei difference
    expect(interest).to.be.closeTo(expectedInterest, 1);
  });
});

async function showBalance(wallet:any, usdt:any, flym:any) {
  console.log("wallet Address:", wallet.address);
  const usdtBalance = await usdt.balanceOf(wallet.address);
  const flymBalance = await flym.balanceOf(wallet.address);

  console.log("USDT Balance:", ethers.utils.formatUnits(usdtBalance, 18));
  console.log("FLYM Balance:", ethers.utils.formatUnits(flymBalance, 18));
}