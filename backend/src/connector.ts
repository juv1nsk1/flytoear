import FireFly from "@hyperledger/firefly-sdk";
import config from "../config.json";
import flyconfig from "../flytoearn.json";

// Initialize FireFly SDK with host and namespace from config
const firefly = new FireFly({
  host: config.HOST,
  namespace: config.NAMESPACE,
});

/**
 * Mint fungible tokens to a specific address.
 * @param pool - The token pool ID.
 * @param to - The recipient address.
 * @param amount - Amount of tokens to mint.
 * @returns True if successful, false otherwise.
 */
export async function mintToken(pool: string, to: string, amount: string): Promise<boolean> {
  try {
    firefly.mintTokens({
      pool,
      to,
      key: config.SIGNING_KEY,
      amount,
    });
  } catch (e: any) {
    console.error("Error minting token:", e);
    return false;
  }
  return true;
}

/**
 * Mint an NFT using a contract API.
 * @param apiName - The API registered in FireFly.
 * @param to - Recipient address.
 * @param uri - Unique identifier for the NFT.
 * @returns True if successful, false otherwise.
 */
export async function mintTokenByApi(apiName: string, to: string, uri: string): Promise<boolean> {
  try {
    await firefly.invokeContractAPI(apiName, "safeMint", {
      input: {
        idempotencyKey: uri + to,
        to: to,
        uri: uri,
        amount: "1", 
      },
      key: config.SIGNING_KEY,
    });
  } catch (e: any) {
    console.error("Error minting token API:", e);
    return false;
  }
  return true;
}

/**
 * Simulate a borrow operation using collateral.
 * @param amount - The amount to simulate borrowing.
 * @returns Simulation result or error object.
 */
export async function simulateBorrow(amount: string): Promise<any> {
  try {
    const response = await firefly.queryContractAPI(flyconfig.KLENDER_API, "simulateBorrowFromCollateral", {
      input: {
        flymAmount: amount,
      },
      key: config.SIGNING_KEY,
    });
    return response;
  } catch (e: any) {
    console.error("Error simulating borrow:", e);
    return { error: e };
  }
}

/**
 * Borrow an amount from the lending contract.
 * @param borrower - The borrower's address.
 * @param amount - Amount to borrow.
 * @returns True if successful, false otherwise.
 */
export async function doBorrow(borrower: string, amount: string): Promise<boolean> {
  const response = await approveTransfer(config.TOKEN_FLYM_POOL_ID, borrower, config.KLENDER_ADDRESS);
  //console.log("approval:", response);
  try {
    const response = await firefly.invokeContractAPI(flyconfig.KLENDER_API, "borrow", {
      input: {
        amount: amount,
      },
      key: borrower,
    });
    return true;
  } catch (e: any) {
    console.error("Error borrowing:", e);
    return false;
  }
}

/**
 * Retrieve loan information for a borrower.
 * @param borrower - The address of the borrower.
 * @returns Loan data or error object.
 */
export async function getLoan(borrower: string): Promise<any> {
  try {
    const response = await firefly.queryContractAPI(flyconfig.KLENDER_API, "getLoan", {
      input: {
        borrower: borrower,
      },
      key: borrower,
    });
    return response;
  } catch (e: any) {
    console.error("Error getting loan:", e);
    return { error: e };
  }
}

/**
 * Approve token transfer from a user to an operator.
 * @param pool - Token pool ID.
 * @param from - Owner address.
 * @param to - Operator address.
 * @returns True if approval succeeded, false otherwise.
 */
export async function approveTransfer(pool: string, from: string, to: string): Promise<boolean> {
  try {
    const response = await firefly.approveTokens({
      pool,
      operator: to,
      key: from,
    });
  } catch (e: any) {
    console.error("Error approving token transfer:", e);
    return false;
  }
  return true;
}

/**
 * Repay a loan using USDT.
 * @param borrower - The borrower's address.
 * @returns True if repayment succeeded, false otherwise.
 */
export async function doRepay(borrower: string): Promise<boolean> {
  await approveTransfer(config.TOKEN_USDT_POOL_ID, borrower, config.KLENDER_ADDRESS);
  try {
    const response = await firefly.invokeContractAPI(flyconfig.KLENDER_API, "repay", {
      input: {},
      key: borrower,
    });
    return true;
  } catch (e: any) {
    console.error("Error repaying:", e);
    return false;
  }
}

/**
 * Get the token balance for a user or all users in a pool.
 * @param pool - Token pool ID.
 * @param to - User address or "all" for the entire pool.
 * @returns Token balance or "0" on error.
 */
export async function getTokenBalance(pool: string, to: string): Promise<any> {
  const filter = to === "all" ? { pool: pool } : { pool: pool, key: to };
  try {
    const balance = await firefly.getTokenBalances(filter);
    return balance;
  } catch (e: any) {
    console.error("Error getting token balance:", e);
    return "0";
  }
}

/**
 * Burn (expire) tokens from a specific address.
 * @param pool - Token pool ID.
 * @param from - Address from which tokens are burned.
 * @param amount - Amount of tokens to burn.
 * @returns Burn result or "0" on error.
 */
export async function expireToken(pool: string, from: string, amount: number): Promise<any> {
  try {
    const balance = await firefly.burnTokens({
      pool: pool,
      key: from,
      amount: amount.toString(),
    });
    return balance;
  } catch (e: any) {
    console.error("Error burning tokens:", e);
    return "0";
  }
}

/**
 * Retrieve the current monthly interest rate.
 * @returns Interest rate value or error object.
 */
export async function getInterestRate(): Promise<any> {
  try {
    const response = await firefly.queryContractAPI(flyconfig.KINVEST_API, "monthlyInterestRate", {
      input: {},
      key: config.SIGNING_KEY,
    });
    return response.output;
  } catch (e: any) {
    console.error("Error getting interest rate:", e);
    return { error: e };
  }
}

/**
 * Stake USDT tokens in the investment contract.
 * @param investor - The investor's address.
 * @param amount - Amount to stake.
 * @returns True if successful, false otherwise.
 */
export async function doStake(investor: string, amount: string): Promise<boolean> {
  const response = await approveTransfer(config.TOKEN_USDT_POOL_ID, investor, config.KINVEST_ADDRESS);
  //console.log("approval:", response);
  try {
    const response = await firefly.invokeContractAPI(flyconfig.KINVEST_API, "stake", {
      input: {
        amount: amount,
      },
      key: investor,
    });
    return true;
  } catch (e: any) {
    console.error("Error staking:", e);
    return false;
  }
}

/**
 * Retrieve the current stake position for a user.
 * @param investor - The investor's address.
 * @returns Stake data or error object.
 */
export async function getStake(investor: string): Promise<any> {
  try {
    const response = await firefly.queryContractAPI(flyconfig.KINVEST_API, "getStake", {
      input: {
        user: investor,
      },
      key: investor,
    });
    return response;
  } catch (e: any) {
    console.error("Error getting stake:", e);
    return { error: e };
  }
}

/**
 * Unstake previously staked tokens.
 * @param investor - The investor's address.
 * @returns True if successful, false otherwise.
 */
export async function doUnstake(investor: string): Promise<boolean> {
  await approveTransfer(config.TOKEN_USDT_POOL_ID, investor, config.KINVEST_ADDRESS);
  try {
    const response = await firefly.invokeContractAPI(flyconfig.KINVEST_API, "unstake", {
      input: {},
      key: investor,
    });
    return true;
  } catch (e: any) {
    console.error("Error unstaking:", e);
    return false;
  }
}

export async function getIdentities(): Promise<any> {
  try {
    const response = await firefly.getIdentities({
    });
    console.log("Identities:", response);
    return response;
  } catch (e: any) {
    console.error("Error getting identities:", e);
    return { error: e };
  }
}