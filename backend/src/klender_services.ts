import { Router, Request, Response } from "express";
import config from "../config.json";
import { convertValue, convertValueToIntStr } from "./utils";
import { simulateBorrow, getTokenBalance, doBorrow, doRepay, getLoan, mintToken } from "./connector";

// router for services
const servicesLender = Router();

// simulate a borrow operation based on a given amount
servicesLender.post("/simulate", async (req: Request, res: Response) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  // Call simulation logic using formatted amount
  const response = await simulateBorrow(convertValueToIntStr(amount));

  // Return formatted interest and max borrowable amount
  return res.status(200).json({
    interest: convertValue(response.interest),
    maxBorrow: convertValue(response.maxBorrow),
  });
});

// Get the token balances (FLYM and USDT) for the test customer
servicesLender.get("/balance", async (req: Request, res: Response) => {

  // Fetch token balances using the second customer in config
  const flymbalance = await getTokenBalance(config.TOKEN_FLYM_POOL_ID, config.customer[1]);
  const usdtbalance = await getTokenBalance(config.TOKEN_USDT_POOL_ID, config.customer[1]);

  // Extract and convert balances 
  const usd = usdtbalance.length > 0 ? convertValue(usdtbalance[0].balance) : "0";
  const flym = flymbalance.length > 0 ? convertValue(flymbalance[0].balance) : "0";

  return res.status(200).json({ flymbalance: flym, usdtbalance: usd });
});

// Request a loan (borrow) using the configured customer
servicesLender.post("/borrow", async (req: Request, res: Response) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  // Attempt to perform the borrow operation
  const response = await doBorrow(config.customer[1], convertValueToIntStr(amount));

  // If borrow fails (user already has a loan)
  if (!response) {
    return res.status(500).json({ error: "Error borrowing. You may already have a borrow." });
  }

  return res.status(200).json({ ok: true });
});

// Get current loan details for the configured customer
servicesLender.get("/loan", async (req: Request, res: Response) => {
  const response = await getLoan(config.customer[1]);
  const { output } = response;

  // Convert and extract loan details
  const collateralAmount = output.collateralAmount ? convertValue(output.collateralAmount) : "0";
  const interestAmount = output.interestAmount ? convertValue(output.interestAmount) : "0";
  const principal = output.principal ? convertValue(output.principal) : "0";
  const startTimestamp = output.startTimestamp
    ? new Date(parseInt(output.startTimestamp) * 1000).toLocaleDateString()
    : "";

  return res.status(200).json({ collateralAmount, interestAmount, principal, startTimestamp });
});

// Repay an active loan
servicesLender.post("/repay", async (req: Request, res: Response) => {
  // Attempt to repay loan for configured customer
  const response = await doRepay(config.customer[1]);

  if (!response) {
    return res.status(500).json({ error: "Error to repay. Check your USDT balance." });
  }

  return res.status(200).json({});
});


export default servicesLender;