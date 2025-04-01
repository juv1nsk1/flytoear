const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KInvest", function () {
  let owner, user:any;
  let usdt: any, kinvest: any;
  const STAKE_AMOUNT = ethers.utils.parseEther("100");

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const USDT = await ethers.getContractFactory("USDT");
    usdt = await USDT.deploy();
    await usdt.deployed();

    const Staker = await ethers.getContractFactory("KInvest");
    kinvest = await Staker.deploy(usdt.address);
    await kinvest.deployed();

    await usdt.transfer(user.address, STAKE_AMOUNT);
    await usdt.transfer(kinvest.address, STAKE_AMOUNT);
  });

  it("should allow a user to stake", async () => {
    const usdtUser = usdt.connect(user);
    const stakerUser = kinvest.connect(user);

    await usdtUser.approve(kinvest.address, STAKE_AMOUNT);
    await stakerUser.stake(STAKE_AMOUNT);

    const [amount, start, interest] = await kinvest.getStake(user.address);
    expect(amount).to.equal(STAKE_AMOUNT);
    expect(interest).to.equal(0);
  });

  it("should calculate interest over time", async () => {
    const usdtUser = usdt.connect(user);
    const stakerUser = kinvest.connect(user);

    await usdtUser.approve(kinvest.address, STAKE_AMOUNT);
    await stakerUser.stake(STAKE_AMOUNT);

    // Fast forward 30 days
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const [amount, start, interest] = await kinvest.getStake(user.address);
    const monthlyRate = await kinvest.monthlyInterestRate();
    const expectedInterest = STAKE_AMOUNT.mul(monthlyRate).div(10000);
    expect(interest).to.be.gt(1); 
  });

  it("should allow user to unstake and receive interest", async () => {
    const usdtUser = usdt.connect(user);
    const stakerUser = kinvest.connect(user);

    await usdtUser.approve(kinvest.address, STAKE_AMOUNT);
    await stakerUser.stake(STAKE_AMOUNT);

    // Fast forward 30 days
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const balanceBefore = await usdt.balanceOf(user.address);
    await stakerUser.unstake();
    const balanceAfter = await usdt.balanceOf(user.address);

    expect(balanceAfter).to.be.gt(balanceBefore);

    const [amount, , ] = await kinvest.getStake(user.address);
    expect(amount).to.equal(0);
  });
});