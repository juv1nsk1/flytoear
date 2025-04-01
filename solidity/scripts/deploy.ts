import { ethers } from "hardhat";

async function main() {
  const TokenFLYM = await ethers.getContractFactory("FLYM");
  const tokenflym = await TokenFLYM.deploy();
  await tokenflym.deployed();


  const TokenUSDT = await ethers.getContractFactory("USDT");
  const tokenusdt = await TokenUSDT.deploy();
  await tokenusdt.deployed();

  console.log("Contracts deployed!\nAdd the addresses to backend/index.ts:");
  console.log(`TOKEN_ADDRESS_USDT: ${tokenusdt.address}`);
  console.log(`TOKEN_ADDRESS_FLYM: ${tokenflym.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

