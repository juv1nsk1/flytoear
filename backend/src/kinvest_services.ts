import { Router, Request, Response } from "express";
import { convertValue, convertValueToIntStr } from "./utils";
import { getInterestRate, getTokenBalance, doStake, getStake, doUnstake, getPoolID } from "./connector";


export const createServiceKInvest = (config:any) => {

  // router for investment services
  const servicesInvest = Router();

  // Retrieve the current interest rate
  servicesInvest.post("/simulate", async (req: Request, res: Response) => {

    const response = await getInterestRate();
    // Convert integer value to percentage (e.g. "500" => 5.00%)
    const interestRate = parseInt(response) / 100;

    return res.status(200).json({ interestRate });
  });

  // Get the USDT token balance for the test customer
  servicesInvest.get("/balance", async (req: Request, res: Response) => {

    let TOKEN_USDT_POOL_ID = await getPoolID("USDT");

    const usdtbalance = await getTokenBalance(TOKEN_USDT_POOL_ID, config.CUSTOMER);
    const usd = usdtbalance.length > 0 ? convertValue(usdtbalance[0].balance) : "0";

    return res.status(200).json({ usdtbalance: usd });
  });

  // Stake an amount of USDT
  servicesInvest.post("/stake", async (req: Request, res: Response) => {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Attempt staking operation for the test customer
    const response = await doStake(config.CUSTOMER, convertValueToIntStr(amount));

    // If staking fails already staked
    if (!response) {
      return res.status(500).json({ error: "Error staking. You may already have a position." });
    }

    return res.status(200).json({ ok: true });
  });

  // Get the current staking position of the test customer
  servicesInvest.get("/position", async (req: Request, res: Response) => {

    // Retrieve staking data
    console.log("customer", config.CUSTOMER);
    const response = await getStake(config.CUSTOMER);

    // Extract staking details
    const accumulatedInterest = response.accumulatedInterest;
    const principal = response.amount ? convertValue(response.amount) : "0";
    const startTimestamp = response.startTimestamp
      ? new Date(parseInt(response.startTimestamp) * 1000).toLocaleDateString()
      : "";

    return res.status(200).json({ accumulatedInterest, principal, startTimestamp });
  });

  // Withdraw staked tokens
  servicesInvest.post("/unstake", async (req: Request, res: Response) => {
    // Attempt unstaking operation
    const response = await doUnstake(config.CUSTOMER);

    if (!response) {
      return res.status(500).json({ error: "Error to unstake. You don't have a position." });
    }

    return res.status(200).json({ ok: true });
  });

  return servicesInvest;
}